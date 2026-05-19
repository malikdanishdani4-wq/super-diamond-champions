"use client";

import { useState, useEffect, use } from "react";
import Navbar from "@/components/ui/Navbar";
import Footer from "@/components/ui/Footer";
import { useLanguage } from "@/context/LanguageContext";
import { t } from "@/lib/i18n";
import styles from "./page.module.css";

/* ── Types ─────────────────────────────────────────── */
interface Tournament {
  _id: string;
  name: string;
  nameUrdu: string;
  competitionType: string;
  startTime: string;
  endTime: string;
  totalDays: number;
  pigeonsPerLoft: number;
  dayDates: string[];
  dayDatesUrdu: string[];
  status: string;
}

interface Loft {
  _id: string;
  loftNumber: number;
  ownerName: string;
  ownerNameUrdu: string;
  area: string;
}

interface DayResult {
  _id: string;
  loftId: Loft | string;
  dayNumber: number;
  pigeonLandings: { pigeonNumber: number; landingTime: string }[];
  braveChildTime: string;
  totalDayDuration: string;
  position: number;
}

/* ── Helper: time string to seconds ──────────────── */
function timeToSeconds(t: string): number {
  if (!t || t === "00:00:00") return 0;
  const parts = t.split(":").map(Number);
  return (parts[0] || 0) * 3600 + (parts[1] || 0) * 60 + (parts[2] || 0);
}

function secondsToTime(s: number): string {
  if (s <= 0) return "00:00:00";
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}:${sec.toString().padStart(2, "0")}`;
}

/* ── Status translation helper ───────────────────── */
function getStatusLabel(status: string, translate: (key: string) => string): string {
  const map: Record<string, string> = {
    active: translate("results.active"),
    upcoming: translate("results.upcoming"),
    completed: translate("results.completed"),
  };
  return map[status.toLowerCase()] || status;
}

/* ── Component ─────────────────────────────────────── */
export default function TournamentDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { locale } = useLanguage();
  const tr = (key: string) => t(key, locale);
  const isUrdu = locale === "ur";

  const [tournament, setTournament] = useState<Tournament | null>(null);
  const [lofts, setLofts] = useState<Loft[]>([]);
  const [results, setResults] = useState<DayResult[]>([]);
  const [activeDay, setActiveDay] = useState<number | "total">(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!id) return;

    Promise.all([
      fetch(`/api/tournaments/${id}`).then((r) => r.json()),
      fetch(`/api/tournaments/${id}/lofts`).then((r) => r.json()),
      fetch(`/api/tournaments/${id}/results`).then((r) => r.json()),
    ])
      .then(([tournData, loftsData, resultsData]) => {
        if (tournData.error) {
          setError(tr("results.notFound"));
          setLoading(false);
          return;
        }
        setTournament(tournData);
        setLofts(Array.isArray(loftsData) ? loftsData : []);
        setResults(Array.isArray(resultsData) ? resultsData : []);
        setLoading(false);
      })
      .catch(() => {
        setError(tr("results.notFound"));
        setLoading(false);
      });
  }, [id]);

  if (loading) {
    return (
      <>
        <Navbar />
        <main className={styles.main}>
          <div className="container" style={{ padding: "8rem 0", textAlign: "center" }}>
            <p style={{ color: "var(--text-secondary)", fontSize: "1.2rem" }}>
              {tr("results.loading")}
            </p>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  if (error || !tournament) {
    return (
      <>
        <Navbar />
        <main className={styles.main}>
          <div className="container" style={{ padding: "8rem 0", textAlign: "center" }}>
            <h2 style={{ color: "var(--error)", marginBottom: "1rem" }}>⚠️ {error || tr("results.notFound")}</h2>
            <a href="/tournaments" className="btn btn-outline">{tr("results.backToList")}</a>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  // Build tabs
  const tabs = [
    ...Array.from({ length: tournament.totalDays }, (_, i) => ({
      label: tournament.dayDates?.[i] || `${tr("results.day")} ${i + 1}`,
      labelUrdu: tournament.dayDatesUrdu?.[i] || `${tr("results.day")} ${i + 1}`,
      value: i + 1,
    })),
    { label: tr("results.total"), labelUrdu: tr("results.total"), value: "total" as const },
  ];

  // Helper: compute total from pigeon landings (sum of 11 pigeon times, brave NOT included)
  function computePigeonTotal(landings: { pigeonNumber: number; landingTime: string }[]): number {
    let total = 0;
    if (landings) {
      for (const p of landings) {
        total += timeToSeconds(p.landingTime);
      }
    }
    return total;
  }

  // Get results for current day
  const dayResults = activeDay === "total"
    ? [] // Total view computed below
    : results.filter((r) => r.dayNumber === activeDay);

  // Build per-day rows with loft info
  const dayRows = dayResults
    .map((r) => {
      const loft = typeof r.loftId === "object" ? r.loftId : lofts.find((l) => l._id === r.loftId);
      const computedTotal = computePigeonTotal(r.pigeonLandings);
      return {
        ...r,
        loft,
        computedTotal: secondsToTime(computedTotal),
        computedTotalSeconds: computedTotal,
      };
    })
    .sort((a, b) => {
      return b.computedTotalSeconds - a.computedTotalSeconds;
    });

  // Build total view — aggregate all days per loft
  const totalMap = new Map<string, {
    loft: Loft | undefined;
    dayTotals: string[];
    braveTotal: number;
    grandTotal: number;
  }>();

  lofts.forEach((l) => {
    totalMap.set(l._id, {
      loft: l,
      dayTotals: Array(tournament.totalDays).fill("00:00:00"),
      braveTotal: 0,
      grandTotal: 0,
    });
  });

  results.forEach((r) => {
    const loftId = typeof r.loftId === "object" ? r.loftId._id : r.loftId;
    const entry = totalMap.get(loftId);
    if (entry && r.dayNumber >= 1 && r.dayNumber <= tournament.totalDays) {
      const dayPigeonTotal = computePigeonTotal(r.pigeonLandings);
      entry.dayTotals[r.dayNumber - 1] = secondsToTime(dayPigeonTotal);
      entry.grandTotal += dayPigeonTotal;
      entry.braveTotal += timeToSeconds(r.braveChildTime);
    }
  });

  const totalRows = Array.from(totalMap.values())
    .filter((e) => e.grandTotal > 0)
    .sort((a, b) => b.grandTotal - a.grandTotal)
    .map((e, i) => ({
      position: i + 1,
      loft: e.loft,
      dayTotals: e.dayTotals,
      braveChild: secondsToTime(e.braveTotal),
      totalTime: secondsToTime(e.grandTotal),
    }));

  const totalLofts = lofts.length;
  const totalPigeons = totalLofts * (tournament.pigeonsPerLoft || 11);

  // Tournament name based on locale
  const tournamentName = isUrdu ? (tournament.nameUrdu || tournament.name) : tournament.name;
  const tournamentSubName = isUrdu ? tournament.name : tournament.nameUrdu;

  // Badge text
  const badgeText = isUrdu
    ? `${tournament.totalDays} ${tr("results.dayCompetition")} — ${getStatusLabel(tournament.status, tr)}`
    : `${tournament.totalDays}-${tr("results.dayCompetition")} — ${getStatusLabel(tournament.status, tr)}`;

  return (
    <>
      <Navbar />
      <main className={styles.main}>
        {/* ── Header ──────────────────────────────── */}
        <section className={styles.header}>
          <div className="container">
            <div className={styles.headerBadge}>
              <span className={styles.liveDot} />
              {badgeText}
            </div>
            <h1 className={styles.headerTitle}>{tournamentName}</h1>
            <p className={styles.headerUrdu}>{tournamentSubName}</p>
            <div className={styles.timings}>
              <div className={styles.timeChip}>
                <span className={styles.timeLabel}>{tr("results.start")}</span>
                <span className={styles.timeValue}>{tournament.startTime}</span>
              </div>
              <div className={styles.timeDivider}>—</div>
              <div className={styles.timeChip}>
                <span className={styles.timeLabel}>{tr("results.end")}</span>
                <span className={styles.timeValue}>{tournament.endTime}</span>
              </div>
            </div>
          </div>
        </section>

        {/* ── Stats ───────────────────────────────── */}
        <section className={styles.statsSection}>
          <div className="container">
            <div className={styles.statsGrid}>
              <div className={`${styles.statCard} ${styles.statBlue}`}>
                <span className={styles.statValue}>{totalLofts}</span>
                <span className={styles.statLabel}>{tr("results.lofts")}</span>
              </div>
              <div className={`${styles.statCard} ${styles.statGold}`}>
                <span className={styles.statValue}>{totalPigeons}</span>
                <span className={styles.statLabel}>{tr("results.totalPigeons")}</span>
              </div>
              <div className={`${styles.statCard} ${styles.statTeal}`}>
                <span className={styles.statValue}>{tournament.pigeonsPerLoft}</span>
                <span className={styles.statLabel}>{tr("results.perLoft")}</span>
              </div>
              <div className={`${styles.statCard} ${styles.statPink}`}>
                <span className={styles.statValue}>{tournament.totalDays}</span>
                <span className={styles.statLabel}>{tr("results.totalDays")}</span>
              </div>
            </div>
          </div>
        </section>

        {/* ── Day Tabs ────────────────────────────── */}
        <section className={styles.tabsSection}>
          <div className="container">
            <div className={styles.tabsWrapper}>
              {tabs.map((tab) => (
                <button
                  key={tab.value}
                  className={`${styles.tab} ${activeDay === tab.value ? styles.tabActive : ""}`}
                  onClick={() => setActiveDay(tab.value as number | "total")}
                >
                  <span className={styles.tabLabel}>{isUrdu ? tab.labelUrdu : tab.label}</span>
                  <span className={styles.tabUrdu}>{isUrdu ? tab.label : tab.labelUrdu}</span>
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* ── Results Table ───────────────────────── */}
        <section className={styles.resultsSection}>
          <div className="container">
            <div className={styles.tableWrapper}>
              {activeDay === "total" ? (
                /* ── Total View ── */
                totalRows.length > 0 ? (
                  <table className={styles.table}>
                    <thead>
                      <tr>
                        <th className={styles.thPos}>{tr("results.position")}</th>
                        <th className={styles.thLoft}>{tr("results.loft")}</th>
                        <th className={styles.thName}>{tr("results.loftOwner")}</th>
                        {Array.from({ length: tournament.totalDays }, (_, i) => (
                          <th key={i} className={styles.thDay}>{tr("results.day")} {i + 1}</th>
                        ))}
                        <th className={styles.thTotal}>{tr("results.total")}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {totalRows.map((row, idx) => (
                        <tr key={idx} className={`${styles.row} ${idx < 3 ? styles[`rank${idx + 1}`] : ""}`}>
                          <td className={styles.tdPos}>
                            <span className={`${styles.positionBadge} ${idx < 3 ? styles[`pos${idx + 1}`] : ""}`}>
                              {row.position}
                            </span>
                          </td>
                          <td className={styles.tdLoft}>{row.loft?.loftNumber || "-"}</td>
                          <td className={styles.tdName}>
                            <span className={styles.nameEn}>{isUrdu ? (row.loft?.ownerNameUrdu || row.loft?.ownerName || "-") : (row.loft?.ownerName || "-")}</span>
                            <span className={styles.nameUr}>{isUrdu ? row.loft?.ownerName || "" : row.loft?.ownerNameUrdu || ""}</span>
                          </td>
                          {row.dayTotals.map((dt, i) => (
                            <td key={i} className={`${styles.tdTime} ${dt === "00:00:00" ? styles.notLanded : ""}`}>
                              {dt === "00:00:00" ? "—" : dt}
                            </td>
                          ))}
                          <td className={`${styles.tdTime} ${styles.tdTotalTime}`}>
                            {row.totalTime}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <div style={{ textAlign: "center", padding: "3rem", color: "var(--text-secondary)" }}>
                    <p style={{ fontSize: "2rem", marginBottom: "0.5rem" }}>📊</p>
                    <p>{tr("results.noResults")}</p>
                  </div>
                )
              ) : (
                /* ── Day View ── */
                dayRows.length > 0 ? (
                  <table className={styles.table}>
                    <thead>
                      <tr>
                        <th className={styles.thPos}>{tr("results.position")}</th>
                        <th className={styles.thLoft}>{tr("results.loft")}</th>
                        <th className={styles.thName}>{tr("results.loftOwner")}</th>
                        {Array.from({ length: tournament.pigeonsPerLoft }, (_, i) => (
                          <th key={i} className={styles.thPigeon}>P{(i + 1).toString().padStart(2, "0")}</th>
                        ))}
                        <th className={styles.thBrave}>{tr("results.brave")}</th>
                        <th className={styles.thTotal}>{tr("results.total")}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {dayRows.map((row, idx) => (
                        <tr key={idx} className={`${styles.row} ${idx < 3 ? styles[`rank${idx + 1}`] : ""}`}>
                          <td className={styles.tdPos}>
                            <span className={`${styles.positionBadge} ${idx < 3 ? styles[`pos${idx + 1}`] : ""}`}>
                              {idx + 1}
                            </span>
                          </td>
                          <td className={styles.tdLoft}>{row.loft?.loftNumber || "-"}</td>
                          <td className={styles.tdName}>
                            <span className={styles.nameEn}>{isUrdu ? (row.loft?.ownerNameUrdu || row.loft?.ownerName || "-") : (row.loft?.ownerName || "-")}</span>
                            <span className={styles.nameUr}>{isUrdu ? row.loft?.ownerName || "" : row.loft?.ownerNameUrdu || ""}</span>
                          </td>
                          {Array.from({ length: tournament.pigeonsPerLoft }, (_, i) => {
                            const landing = row.pigeonLandings?.find((p) => p.pigeonNumber === i + 1);
                            const time = landing?.landingTime || "00:00:00";
                            return (
                              <td key={i} className={`${styles.tdTime} ${time === "00:00:00" ? styles.notLanded : ""}`}>
                                {time === "00:00:00" ? "—" : time}
                              </td>
                            );
                          })}
                          <td className={`${styles.tdTime} ${styles.tdBrave}`}>
                            {row.braveChildTime === "00:00:00" ? "—" : row.braveChildTime}
                          </td>
                          <td className={`${styles.tdTime} ${styles.tdTotalTime}`}>
                            {row.computedTotal === "00:00:00" ? "—" : row.computedTotal}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <div style={{ textAlign: "center", padding: "3rem", color: "var(--text-secondary)" }}>
                    <p style={{ fontSize: "2rem", marginBottom: "0.5rem" }}>📋</p>
                    <p>{tr("results.noDayResults")}</p>
                  </div>
                )
              )}
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
