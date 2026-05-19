"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { use } from "react";
import styles from "./page.module.css";

interface Tournament {
  _id: string;
  name: string;
  nameUrdu: string;
  competitionType: string;
  totalDays: number;
  pigeonsPerLoft: number;
  startTime: string;
  endTime: string;
  dayDates: string[];
  status: string;
}

interface Loft {
  _id: string;
  loftNumber: number;
  ownerName: string;
  ownerNameUrdu: string;
  area: string;
  areaUrdu: string;
}

interface DayResult {
  _id?: string;
  loftId: string;
  dayNumber: number;
  pigeonLandings: { pigeonNumber: number; landingTime: string }[];
  braveChildTime: string;
  totalDayDuration: string;
  position: number;
}

export default function TournamentManagePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [tournament, setTournament] = useState<Tournament | null>(null);
  const [lofts, setLofts] = useState<Loft[]>([]);
  const [activeTab, setActiveTab] = useState<"lofts" | "results">("lofts");
  const [activeDay, setActiveDay] = useState(1);
  const [showLoftForm, setShowLoftForm] = useState(false);
  const [loftForm, setLoftForm] = useState({ loftNumber: 0, ownerName: "", ownerNameUrdu: "", area: "", areaUrdu: "" });
  const [editLoftId, setEditLoftId] = useState<string | null>(null);

  // Results state
  const [results, setResults] = useState<Record<string, DayResult>>({});
  const [selectedLoft, setSelectedLoft] = useState<string | null>(null);
  const [pigeonTimes, setPigeonTimes] = useState<string[]>([]);
  const [braveTime, setBraveTime] = useState("00:00:00");
  const [saving, setSaving] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      const [tRes, lRes] = await Promise.all([
        fetch(`/api/tournaments/${id}`),
        fetch(`/api/tournaments/${id}/lofts`),
      ]);
      if (tRes.ok) setTournament(await tRes.json());
      if (lRes.ok) setLofts(await lRes.json());
    } catch (err) {
      console.error(err);
    }
  }, [id]);

  const fetchResults = useCallback(async (day: number) => {
    try {
      const res = await fetch(`/api/tournaments/${id}/results?day=${day}`);
      if (res.ok) {
        const data = await res.json();
        const map: Record<string, DayResult> = {};
        data.forEach((r: DayResult & { loftId: Loft | string }) => {
          const loftId = typeof r.loftId === "object" ? (r.loftId as Loft)._id : r.loftId;
          map[loftId] = r;
        });
        setResults(map);
      }
    } catch (err) {
      console.error(err);
    }
  }, [id]);

  useEffect(() => {
    fetch("/api/auth/check")
      .then((r) => r.json())
      .then((d) => {
        if (!d.authenticated) router.push("/admin/login");
        else fetchData();
      });
  }, [router, fetchData]);

  useEffect(() => {
    if (tournament) fetchResults(activeDay);
  }, [activeDay, tournament, fetchResults]);

  // Loft CRUD
  const handleSaveLoft = async (e: React.FormEvent) => {
    e.preventDefault();
    const method = editLoftId ? "PUT" : "POST";
    const url = editLoftId
      ? `/api/tournaments/${id}/lofts/${editLoftId}`
      : `/api/tournaments/${id}/lofts`;

    await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(loftForm),
    });

    setShowLoftForm(false);
    setEditLoftId(null);
    setLoftForm({ loftNumber: 0, ownerName: "", ownerNameUrdu: "", area: "", areaUrdu: "" });
    fetchData();
  };

  const handleDeleteLoft = async (loftId: string) => {
    if (!confirm("Delete this competitor?")) return;
    await fetch(`/api/tournaments/${id}/lofts/${loftId}`, { method: "DELETE" });
    fetchData();
  };

  // Results Entry
  const openResultEditor = (loft: Loft) => {
    setSelectedLoft(loft._id);
    const existing = results[loft._id];
    if (existing) {
      setPigeonTimes(existing.pigeonLandings.map((p) => p.landingTime));
      setBraveTime(existing.braveChildTime || "00:00:00");
    } else {
      setPigeonTimes(Array(tournament?.pigeonsPerLoft || 11).fill("00:00:00"));
      setBraveTime("00:00:00");
    }
  };

  const handleSaveResult = async () => {
    if (!selectedLoft || !tournament) return;
    setSaving(true);

    const pigeonLandings = pigeonTimes.map((t, i) => ({
      pigeonNumber: i + 1,
      landingTime: t || "00:00:00",
    }));

    await fetch(`/api/tournaments/${id}/results`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        loftId: selectedLoft,
        dayNumber: activeDay,
        pigeonLandings,
        braveChildTime: braveTime,
      }),
    });

    setSaving(false);
    setSelectedLoft(null);
    fetchResults(activeDay);
  };

  if (!tournament) {
    return <div className={styles.loading}><span className={styles.spinner} />Loading...</div>;
  }

  return (
    <div className={styles.page}>
      {/* Sidebar */}
      <aside className={styles.sidebar}>
        <div className={styles.sidebarLogo}>
          <span>🏆</span>
          <div>
            <strong>Admin Panel</strong>
            <small>Tournament Manager</small>
          </div>
        </div>
        <nav className={styles.sidebarNav}>
          <a href="/admin/dashboard" className={styles.navItem}>📊 Dashboard</a>
          <span className={`${styles.navItem} ${styles.active}`}>⚙️ {tournament.name}</span>
          <a href="/" className={styles.navItem}>🌐 View Website</a>
        </nav>
      </aside>

      {/* Main */}
      <main className={styles.main}>
        {/* Header */}
        <div className={styles.header}>
          <div>
            <a href="/admin/dashboard" className={styles.backLink}>← Back to Dashboard</a>
            <h1 className={styles.title}>{tournament.name}</h1>
            <p className={styles.subtitle}>{tournament.nameUrdu}</p>
          </div>
          <div className={styles.meta}>
            <span className={styles.badge}>{tournament.competitionType}</span>
            <span className={styles.badge}>{tournament.pigeonsPerLoft} pigeons/loft</span>
            <span className={styles.badge}>{tournament.startTime} — {tournament.endTime}</span>
          </div>
        </div>

        {/* Tabs */}
        <div className={styles.tabs}>
          <button
            className={`${styles.tab} ${activeTab === "lofts" ? styles.tabActive : ""}`}
            onClick={() => setActiveTab("lofts")}
          >
            🏠 Competitors ({lofts.length})
          </button>
          <button
            className={`${styles.tab} ${activeTab === "results" ? styles.tabActive : ""}`}
            onClick={() => setActiveTab("results")}
          >
            📊 Results Entry
          </button>
        </div>

        {/* Lofts Tab */}
        {activeTab === "lofts" && (
          <div className={styles.section}>
            <div className={styles.sectionHeader}>
              <h2>Competitors / Lofts</h2>
              <button
                onClick={() => {
                  setLoftForm({ loftNumber: lofts.length + 1, ownerName: "", ownerNameUrdu: "", area: "", areaUrdu: "" });
                  setEditLoftId(null);
                  setShowLoftForm(true);
                }}
                className="btn btn-primary"
              >
                + Add Competitor
              </button>
            </div>

            {showLoftForm && (
              <form onSubmit={handleSaveLoft} className={styles.inlineForm}>
                <input type="number" value={loftForm.loftNumber} onChange={(e) => setLoftForm({ ...loftForm, loftNumber: parseInt(e.target.value) })} placeholder="Loft #" required min={1} />
                <input value={loftForm.ownerName} onChange={(e) => setLoftForm({ ...loftForm, ownerName: e.target.value })} placeholder="Owner Name (English)" required />
                <input value={loftForm.ownerNameUrdu} onChange={(e) => setLoftForm({ ...loftForm, ownerNameUrdu: e.target.value })} placeholder="مالک کا نام (اردو)" dir="rtl" />
                <input value={loftForm.area} onChange={(e) => setLoftForm({ ...loftForm, area: e.target.value })} placeholder="Area (English)" />
                <input value={loftForm.areaUrdu} onChange={(e) => setLoftForm({ ...loftForm, areaUrdu: e.target.value })} placeholder="علاقہ (اردو)" dir="rtl" />
                <button type="submit" className="btn btn-primary">{editLoftId ? "Update" : "Add"}</button>
                <button type="button" onClick={() => setShowLoftForm(false)} className={styles.cancelBtn}>Cancel</button>
              </form>
            )}

            <div className={styles.tableWrap}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>Loft #</th>
                    <th>Owner Name</th>
                    <th>Owner (Urdu)</th>
                    <th>Area</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {lofts.map((l) => (
                    <tr key={l._id}>
                      <td><strong>{l.loftNumber}</strong></td>
                      <td>{l.ownerName}</td>
                      <td style={{ direction: "rtl" }}>{l.ownerNameUrdu}</td>
                      <td>{l.area} {l.areaUrdu && `(${l.areaUrdu})`}</td>
                      <td>
                        <div className={styles.actionBtns}>
                          <button
                            onClick={() => {
                              setLoftForm({
                                loftNumber: l.loftNumber,
                                ownerName: l.ownerName,
                                ownerNameUrdu: l.ownerNameUrdu,
                                area: l.area,
                                areaUrdu: l.areaUrdu,
                              });
                              setEditLoftId(l._id);
                              setShowLoftForm(true);
                            }}
                            className={styles.editBtn}
                          >
                            Edit
                          </button>
                          <button onClick={() => handleDeleteLoft(l._id)} className={styles.deleteBtn}>Delete</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Results Tab */}
        {activeTab === "results" && (
          <div className={styles.section}>
            {/* Day Selector */}
            <div className={styles.daySelector}>
              {Array.from({ length: tournament.totalDays }, (_, i) => (
                <button
                  key={i}
                  className={`${styles.dayBtn} ${activeDay === i + 1 ? styles.dayActive : ""}`}
                  onClick={() => { setActiveDay(i + 1); setSelectedLoft(null); }}
                >
                  Day {i + 1}
                  {tournament.dayDates[i] && <small>{tournament.dayDates[i]}</small>}
                </button>
              ))}
            </div>

            {/* Results Entry */}
            {selectedLoft ? (
              <div className={styles.resultEditor}>
                <h3>
                  Enter Results — Day {activeDay} —{" "}
                  {lofts.find((l) => l._id === selectedLoft)?.ownerName}
                </h3>
                <div className={styles.pigeonGrid}>
                  {pigeonTimes.map((t, i) => (
                    <div key={i} className={styles.pigeonField}>
                      <label>P{(i + 1).toString().padStart(2, "0")}</label>
                      <input
                        type="text"
                        value={t}
                        onChange={(e) => {
                          const next = [...pigeonTimes];
                          next[i] = e.target.value;
                          setPigeonTimes(next);
                        }}
                        placeholder="HH:MM:SS"
                      />
                    </div>
                  ))}
                  <div className={`${styles.pigeonField} ${styles.braveField}`}>
                    <label>Brave Child</label>
                    <input
                      type="text"
                      value={braveTime}
                      onChange={(e) => setBraveTime(e.target.value)}
                      placeholder="HH:MM:SS"
                    />
                  </div>
                </div>
                <div className={styles.resultActions}>
                  <button onClick={() => setSelectedLoft(null)} className={styles.cancelBtn}>Cancel</button>
                  <button onClick={handleSaveResult} className="btn btn-primary" disabled={saving}>
                    {saving ? "Saving..." : "Save Results"}
                  </button>
                </div>
              </div>
            ) : (
              <div className={styles.loftSelect}>
                <h3>Select a competitor to enter results for Day {activeDay}</h3>
                <div className={styles.loftGrid}>
                  {lofts.map((l) => {
                    const hasResult = !!results[l._id];
                    return (
                      <button
                        key={l._id}
                        className={`${styles.loftCard} ${hasResult ? styles.loftDone : ""}`}
                        onClick={() => openResultEditor(l)}
                      >
                        <span className={styles.loftNum}>#{l.loftNumber}</span>
                        <span className={styles.loftName}>{l.ownerName}</span>
                        {hasResult && <span className={styles.checkmark}>✅</span>}
                      </button>
                    );
                  })}
                </div>
                {lofts.length === 0 && (
                  <p className={styles.emptyNote}>
                    No competitors added yet. Switch to the Competitors tab to add some first.
                  </p>
                )}
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
