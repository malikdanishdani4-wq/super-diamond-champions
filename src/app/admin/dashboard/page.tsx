"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import styles from "./page.module.css";

interface Tournament {
  _id: string;
  name: string;
  nameUrdu: string;
  competitionType: string;
  status: string;
  totalDays: number;
  pigeonsPerLoft: number;
  startTime: string;
  endTime: string;
  dayDates: string[];
  dayDatesUrdu: string[];
  season: string;
}

const TYPE_LABELS: Record<string, string> = {
  "1-day": "1-Day",
  "3-day": "3-Day",
  "5-day": "5-Day",
  "11-day": "11-Day",
  "15-pigeon": "15-Pigeon",
};

export default function AdminDashboard() {
  const router = useRouter();
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState({
    name: "",
    nameUrdu: "",
    season: "",
    competitionType: "5-day",
    pigeonsPerLoft: 11,
    startTime: "05:15",
    endTime: "20:00",
    status: "upcoming",
    dayDates: [""],
    dayDatesUrdu: [""],
  });

  const fetchTournaments = useCallback(async () => {
    try {
      const res = await fetch("/api/tournaments");
      if (res.ok) {
        const data = await res.json();
        setTournaments(data);
      }
    } catch (err) {
      console.error("Failed to fetch tournaments:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // Check auth
    fetch("/api/auth/check")
      .then((r) => r.json())
      .then((d) => {
        if (!d.authenticated) router.push("/admin/login");
        else fetchTournaments();
      });
  }, [router, fetchTournaments]);

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/admin/login");
  };

  const resetForm = () => {
    setForm({
      name: "",
      nameUrdu: "",
      season: "",
      competitionType: "5-day",
      pigeonsPerLoft: 11,
      startTime: "05:15",
      endTime: "20:00",
      status: "upcoming",
      dayDates: [""],
      dayDatesUrdu: [""],
    });
    setEditId(null);
    setShowForm(false);
  };

  const handleTypeChange = (type: string) => {
    const defaults: Record<string, { days: number; pigeons: number }> = {
      "1-day": { days: 1, pigeons: 11 },
      "3-day": { days: 3, pigeons: 11 },
      "5-day": { days: 5, pigeons: 11 },
      "11-day": { days: 11, pigeons: 11 },
      "15-pigeon": { days: 1, pigeons: 15 },
    };
    const d = defaults[type] || { days: 1, pigeons: 11 };
    setForm((prev) => ({
      ...prev,
      competitionType: type,
      pigeonsPerLoft: d.pigeons,
      dayDates: Array(d.days).fill(""),
      dayDatesUrdu: Array(d.days).fill(""),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const method = editId ? "PUT" : "POST";
    const url = editId ? `/api/tournaments/${editId}` : "/api/tournaments";

    try {
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        resetForm();
        fetchTournaments();
      }
    } catch (err) {
      console.error("Save failed:", err);
    }
  };

  const handleEdit = (t: Tournament) => {
    setForm({
      name: t.name,
      nameUrdu: t.nameUrdu,
      season: t.season,
      competitionType: t.competitionType,
      pigeonsPerLoft: t.pigeonsPerLoft,
      startTime: t.startTime,
      endTime: t.endTime,
      status: t.status,
      dayDates: t.dayDates.length ? t.dayDates : [""],
      dayDatesUrdu: t.dayDatesUrdu?.length ? t.dayDatesUrdu : [""],
    });
    setEditId(t._id);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this tournament?")) return;
    try {
      await fetch(`/api/tournaments/${id}`, { method: "DELETE" });
      fetchTournaments();
    } catch (err) {
      console.error("Delete failed:", err);
    }
  };

  const updateDayDate = (index: number, value: string, isUrdu: boolean) => {
    setForm((prev) => {
      const arr = isUrdu ? [...prev.dayDatesUrdu] : [...prev.dayDates];
      arr[index] = value;
      return isUrdu ? { ...prev, dayDatesUrdu: arr } : { ...prev, dayDates: arr };
    });
  };

  if (loading) {
    return (
      <div className={styles.loading}>
        <span className={styles.spinner} />
        Loading...
      </div>
    );
  }

  return (
    <div className={styles.page}>
      {/* Sidebar */}
      <aside className={styles.sidebar}>
        <div className={styles.sidebarLogo}>
          <span>🏆</span>
          <div>
            <strong>Admin Panel</strong>
            <small>Super Diamond Champions</small>
          </div>
        </div>
        <nav className={styles.sidebarNav}>
          <a href="/admin/dashboard" className={`${styles.navItem} ${styles.active}`}>📊 Dashboard</a>
          <a href="/" className={styles.navItem}>🌐 View Website</a>
        </nav>
        <button onClick={handleLogout} className={styles.logoutBtn}>🚪 Sign Out</button>
      </aside>

      {/* Main Content */}
      <main className={styles.main}>
        <div className={styles.topBar}>
          <h1 className={styles.pageTitle}>Dashboard</h1>
          <button onClick={() => { resetForm(); setShowForm(true); }} className="btn btn-primary">
            + Create Tournament
          </button>
        </div>

        {/* Stats */}
        <div className={styles.statsGrid}>
          <div className={styles.statCard}>
            <span className={styles.statValue}>{tournaments.length}</span>
            <span className={styles.statLabel}>Total Tournaments</span>
          </div>
          <div className={styles.statCard}>
            <span className={styles.statValue}>{tournaments.filter((t) => t.status === "active").length}</span>
            <span className={styles.statLabel}>Active</span>
          </div>
          <div className={styles.statCard}>
            <span className={styles.statValue}>{tournaments.filter((t) => t.status === "upcoming").length}</span>
            <span className={styles.statLabel}>Upcoming</span>
          </div>
          <div className={styles.statCard}>
            <span className={styles.statValue}>{tournaments.filter((t) => t.status === "completed").length}</span>
            <span className={styles.statLabel}>Completed</span>
          </div>
        </div>

        {/* Create/Edit Form */}
        {showForm && (
          <div className={styles.formCard}>
            <h2 className={styles.formTitle}>
              {editId ? "Edit Tournament" : "Create New Tournament"}
            </h2>
            <form onSubmit={handleSubmit} className={styles.form}>
              <div className={styles.formGrid}>
                <div className={styles.field}>
                  <label>Name (English)</label>
                  <input
                    type="text"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    placeholder="e.g. Heavy Weight Mela Rawalpindi"
                    required
                  />
                </div>
                <div className={styles.field}>
                  <label>Name (Urdu)</label>
                  <input
                    type="text"
                    value={form.nameUrdu}
                    onChange={(e) => setForm({ ...form, nameUrdu: e.target.value })}
                    placeholder="e.g. ہیوی ویٹ میلہ راولپنڈی"
                    dir="rtl"
                  />
                </div>
                <div className={styles.field}>
                  <label>Season</label>
                  <input
                    type="text"
                    value={form.season}
                    onChange={(e) => setForm({ ...form, season: e.target.value })}
                    placeholder="e.g. جیٹھ 2026"
                  />
                </div>
                <div className={styles.field}>
                  <label>Competition Type</label>
                  <select
                    value={form.competitionType}
                    onChange={(e) => handleTypeChange(e.target.value)}
                  >
                    <option value="1-day">1-Day Championship</option>
                    <option value="3-day">3-Day Championship</option>
                    <option value="5-day">5-Day Championship</option>
                    <option value="11-day">11-Day Championship</option>
                    <option value="15-pigeon">15-Pigeon Special</option>
                  </select>
                </div>
                <div className={styles.field}>
                  <label>Pigeons Per Loft</label>
                  <select
                    value={form.pigeonsPerLoft}
                    onChange={(e) => setForm({ ...form, pigeonsPerLoft: parseInt(e.target.value) })}
                  >
                    <option value={7}>7 Pigeons</option>
                    <option value={11}>11 Pigeons</option>
                    <option value={15}>15 Pigeons</option>
                  </select>
                </div>
                <div className={styles.field}>
                  <label>Status</label>
                  <select
                    value={form.status}
                    onChange={(e) => setForm({ ...form, status: e.target.value })}
                  >
                    <option value="upcoming">Upcoming</option>
                    <option value="active">Active</option>
                    <option value="completed">Completed</option>
                  </select>
                </div>
                <div className={styles.field}>
                  <label>Start Time</label>
                  <input
                    type="time"
                    value={form.startTime}
                    onChange={(e) => setForm({ ...form, startTime: e.target.value })}
                    required
                  />
                </div>
                <div className={styles.field}>
                  <label>End Time</label>
                  <input
                    type="time"
                    value={form.endTime}
                    onChange={(e) => setForm({ ...form, endTime: e.target.value })}
                    required
                  />
                </div>
              </div>

              {/* Day Dates */}
              <div className={styles.dayDatesSection}>
                <h3>Day Dates</h3>
                <div className={styles.dayDatesGrid}>
                  {form.dayDates.map((d, i) => (
                    <div key={i} className={styles.dayDateRow}>
                      <span className={styles.dayLabel}>Day {i + 1}</span>
                      <input
                        type="text"
                        value={d}
                        onChange={(e) => updateDayDate(i, e.target.value, false)}
                        placeholder={`e.g. May ${10 + i * 2}`}
                      />
                      <input
                        type="text"
                        value={form.dayDatesUrdu[i] || ""}
                        onChange={(e) => updateDayDate(i, e.target.value, true)}
                        placeholder={`e.g. مئی ${10 + i * 2}`}
                        dir="rtl"
                      />
                    </div>
                  ))}
                </div>
              </div>

              <div className={styles.formActions}>
                <button type="button" onClick={resetForm} className={styles.cancelBtn}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  {editId ? "Update Tournament" : "Create Tournament"}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Tournaments Table */}
        <div className={styles.tableCard}>
          <h2 className={styles.tableTitle}>All Tournaments</h2>
          {tournaments.length === 0 ? (
            <div className={styles.empty}>
              <p>No tournaments yet. Create your first tournament above.</p>
            </div>
          ) : (
            <div className={styles.tableWrap}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Type</th>
                    <th>Status</th>
                    <th>Pigeons</th>
                    <th>Time</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {tournaments.map((t) => (
                    <tr key={t._id}>
                      <td>
                        <div className={styles.nameCell}>
                          <strong>{t.name}</strong>
                          {t.nameUrdu && <span className={styles.urduName}>{t.nameUrdu}</span>}
                        </div>
                      </td>
                      <td>
                        <span className={styles.typeBadge}>{TYPE_LABELS[t.competitionType]}</span>
                      </td>
                      <td>
                        <span className={`${styles.statusBadge} ${styles[t.status]}`}>
                          {t.status}
                        </span>
                      </td>
                      <td>{t.pigeonsPerLoft}/loft</td>
                      <td>{t.startTime} — {t.endTime}</td>
                      <td>
                        <div className={styles.actionBtns}>
                          <a href={`/admin/tournaments/${t._id}`} className={styles.manageBtn}>
                            Manage
                          </a>
                          <button onClick={() => handleEdit(t)} className={styles.editBtn}>Edit</button>
                          <button onClick={() => handleDelete(t._id)} className={styles.deleteBtn}>Delete</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
