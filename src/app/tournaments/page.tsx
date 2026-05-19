"use client";

import { useState, useEffect } from "react";
import Navbar from "@/components/ui/Navbar";
import Footer from "@/components/ui/Footer";
import { useLanguage } from "@/context/LanguageContext";
import styles from "./page.module.css";

const TYPE_KEYS: Record<string, { key: string; icon: string; color: string }> = {
  "1-day": { key: "comp.1day", icon: "⚡", color: "var(--gold)" },
  "3-day": { key: "comp.3day", icon: "🔥", color: "var(--pink)" },
  "5-day": { key: "comp.5day", icon: "🏆", color: "var(--teal)" },
  "11-day": { key: "comp.11day", icon: "👑", color: "var(--blue)" },
  "15-pigeon": { key: "comp.15pigeon", icon: "💎", color: "var(--gold-light)" },
};

export default function TournamentsPage() {
  const { t, locale } = useLanguage();
  const [filter, setFilter] = useState<string>("all");
  const [search, setSearch] = useState("");
  const [tournaments, setTournaments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/tournaments")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setTournaments(data);
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  const filtered = tournaments.filter((t) => {
    const matchFilter = filter === "all" || t.status === filter || t.competitionType === filter;
    const matchSearch =
      (t.name && t.name.toLowerCase().includes(search.toLowerCase())) ||
      (t.nameUrdu && t.nameUrdu.includes(search));
    return matchFilter && matchSearch;
  });

  const statusMap: Record<string, { labelKey: string; icon: string }> = {
    active: { labelKey: "listing.liveNow", icon: "🔴" },
    upcoming: { labelKey: "results.upcoming", icon: "🟡" },
    completed: { labelKey: "results.completed", icon: "✅" },
  };

  return (
    <>
      <Navbar />
      <main className={styles.main}>
        {/* Header */}
        <section className={styles.header}>
          <div className="container">
            <h1 className={styles.title}>
              {t("listing.title")} <span className={styles.accent}>{t("listing.titleAccent")}</span>
            </h1>
            <p className={styles.subtitle}>
              {t("listing.subtitle")}
            </p>
          </div>
        </section>

        {/* Filters */}
        <section className={styles.filterSection}>
          <div className="container">
            <div className={styles.filterBar}>
              <input
                type="text"
                placeholder={t("listing.search")}
                className={styles.searchInput}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              <div className={styles.filterTabs}>
                {[
                  { value: "all", labelKey: "listing.all", icon: "" },
                  { value: "active", labelKey: "listing.liveNow", icon: "🔴" },
                  { value: "upcoming", labelKey: "results.upcoming", icon: "🟡" },
                  { value: "completed", labelKey: "results.completed", icon: "✅" },
                ].map((f) => (
                  <button
                    key={f.value}
                    className={`${styles.filterBtn} ${filter === f.value ? styles.filterActive : ""}`}
                    onClick={() => setFilter(f.value)}
                  >
                    {f.icon ? `${f.icon} ` : ""}{t(f.labelKey)}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Cards Grid */}
        <section className={styles.gridSection}>
          <div className="container">
            {loading ? (
              <div className="text-center text-muted" style={{ padding: "4rem 0" }}>
                {t("results.loading")}
              </div>
            ) : (
              <>
                <div className={styles.grid}>
                  {filtered.map((tourn) => {
                    const typeInfo = TYPE_KEYS[tourn.competitionType] || TYPE_KEYS["5-day"];
                    const sInfo = statusMap[tourn.status] || statusMap["upcoming"];
                    return (
                      <a key={tourn._id} href={`/tournaments/${tourn._id}`} className={styles.card}>
                        {/* Card Top Accent */}
                        <div
                          className={styles.cardAccent}
                          style={{ background: typeInfo.color }}
                        />

                        {/* Header Row */}
                        <div className={styles.cardHeader}>
                          <span className={`${styles.statusBadge} ${styles[tourn.status]}`}>
                            {sInfo.icon} {t(sInfo.labelKey)}
                          </span>
                          <span
                            className={styles.typeBadge}
                            style={{ borderColor: typeInfo.color, color: typeInfo.color }}
                          >
                            {typeInfo.icon} {t(typeInfo.key)}
                          </span>
                        </div>

                        {/* Name */}
                        <h3 className={styles.cardName}>
                          {locale === "ur" ? (tourn.nameUrdu || tourn.name) : tourn.name}
                        </h3>
                        <p className={styles.cardUrdu}>
                          {locale === "ur" ? tourn.name : (tourn.nameUrdu || tourn.name)}
                        </p>

                        {/* Date */}
                        <p className={styles.cardDate}>
                          📅 {tourn.dayDates?.length ? tourn.dayDates[0] : "TBD"}
                        </p>

                        {/* Stats Row */}
                        <div className={styles.cardStats}>
                          <div className={styles.cardStat}>
                            <span className={styles.cardStatVal}>{tourn.loftsCount || 0}</span>
                            <span className={styles.cardStatLbl}>{t("listing.lofts")}</span>
                          </div>
                          <div className={styles.cardStatDiv} />
                          <div className={styles.cardStat}>
                            <span className={styles.cardStatVal}>{(tourn.loftsCount || 0) * (tourn.pigeonsPerLoft || 11)}</span>
                            <span className={styles.cardStatLbl}>{t("listing.pigeons")}</span>
                          </div>
                          <div className={styles.cardStatDiv} />
                          <div className={styles.cardStat}>
                            <span className={styles.cardStatVal}>{tourn.pigeonsPerLoft || 11}</span>
                            <span className={styles.cardStatLbl}>{t("listing.perLoft")}</span>
                          </div>
                        </div>

                        {/* Timings */}
                        <div className={styles.cardTimings}>
                          <span>🕐 {tourn.startTime} — {tourn.endTime}</span>
                        </div>

                        {/* Arrow */}
                        <div className={styles.cardArrow}>{t("listing.viewResults")}</div>
                      </a>
                    );
                  })}
                </div>

                {filtered.length === 0 && (
                  <div className={styles.emptyState}>
                    <span className={styles.emptyIcon}>🔍</span>
                    <p>{t("listing.noResults")}</p>
                  </div>
                )}
              </>
            )}
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
