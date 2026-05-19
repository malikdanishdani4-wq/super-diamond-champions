"use client";

import { useEffect, useState } from "react";
import Navbar from "@/components/ui/Navbar";
import Footer from "@/components/ui/Footer";
import { useLanguage } from "@/context/LanguageContext";
import styles from "./page.module.css";

const COMPETITION_KEYS = [
  { key: "1day", icon: "⚡", days: 1, color: "var(--gold)" },
  { key: "3day", icon: "🔥", days: 3, color: "var(--pink)" },
  { key: "5day", icon: "🏆", days: 5, color: "var(--teal)" },
  { key: "11day", icon: "👑", days: 11, color: "var(--blue)" },
  { key: "15pigeon", icon: "💎", days: 1, color: "var(--gold-light)" },
];

const STAT_KEYS = [
  { key: "stats.tournaments", value: "50+", icon: "🏆" },
  { key: "stats.lofts", value: "500+", icon: "🏠" },
  { key: "stats.pigeons", value: "5,000+", icon: "🕊️" },
  { key: "stats.cities", value: "15+", icon: "📍" },
];

export default function Home() {
  const { t, locale } = useLanguage();
  const [tournaments, setTournaments] = useState<any[]>([]);

  useEffect(() => {
    fetch("/api/tournaments")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          // Show up to 3 for featured
          setTournaments(data.slice(0, 3));
        }
      })
      .catch((err) => console.error(err));
  }, []);

  return (
    <>
      <Navbar />
      <main>
        {/* ── Hero Section ──────────────────────────── */}
        <section className={styles.hero}>
          <div className={`container ${styles.heroInner}`}>
            <div className={styles.heroContent}>
              <div className={styles.heroBadge}>
                <span className={styles.heroBadgeDot} />
                {t("hero.badge")}
              </div>
              <h1 className={styles.heroTitle}>
                {t("hero.title1")}
                <br />
                <span className={styles.heroAccent}>{t("hero.title2")}</span>
              </h1>
              <div className={styles.heroCta}>
                <a href="/tournaments" className="btn btn-primary">
                  {t("hero.viewTournaments")}
                </a>
              </div>
            </div>
            <div className={styles.heroVisual}>
              <div className={styles.trophyContainer}>
                <span className={styles.trophy}>🏆</span>
                <div className={styles.trophyGlow} />
              </div>
            </div>
          </div>
          <div className={styles.heroWave} />
        </section>

        {/* ── Competition Types ─────────────────────── */}
        <section className={styles.section}>
          <div className="container">
            <div className={styles.sectionHeader}>
              <h2 className="section-title">
                {t("comp.title")} <span className="accent">{t("comp.titleAccent")}</span>
              </h2>
              <p className="section-subtitle">
                {t("comp.subtitle")}
              </p>
            </div>
            <div className={styles.compGrid}>
              {COMPETITION_KEYS.map((comp, i) => (
                <div
                  key={i}
                  className={styles.compCard}
                  style={{ "--card-accent": comp.color } as React.CSSProperties}
                >
                  <span className={styles.compIcon}>{comp.icon}</span>
                  <h3 className={styles.compTitle}>{t(`comp.${comp.key}`)}</h3>
                  <p className={styles.compDesc}>{t(`comp.${comp.key}.desc`)}</p>
                  <div className={styles.compMeta}>
                    <span>{comp.days} {comp.days > 1 ? t("comp.days") : t("comp.day")}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Featured Tournaments ──────────────────── */}
        <section className={styles.section}>
          <div className="container">
            <div className={styles.sectionHeader}>
              <h2 className="section-title">
                {t("featured.title")} <span className="accent">{t("featured.titleAccent")}</span>
              </h2>
              <p className="section-subtitle">
                {t("featured.subtitle")}
              </p>
            </div>
            <div className={styles.tournGrid}>
              {tournaments.map((tourn) => (
                <a key={tourn._id} href={`/tournaments/${tourn._id}`} className={styles.tournCard}>
                  <div className={styles.tournHeader}>
                    <span className={`${styles.tournStatus} ${styles[tourn.status]}`}>
                      {tourn.status === "active" ? t("featured.live") : tourn.status === "upcoming" ? t("featured.upcoming") : t("featured.completed")}
                    </span>
                    <span className={styles.tournType}>{tourn.competitionType}</span>
                  </div>
                  <h3 className={styles.tournName}>
                    {locale === "ur" ? (tourn.nameUrdu || tourn.name) : tourn.name}
                  </h3>
                  <p className={styles.tournUrdu}>
                    {locale === "ur" ? tourn.name : (tourn.nameUrdu || tourn.name)}
                  </p>
                  <div className={styles.tournStats}>
                    <div className={styles.tournStat}>
                      <span className={styles.tournStatVal}>{tourn.loftsCount || 0}</span>
                      <span className={styles.tournStatLabel}>{t("listing.lofts")}</span>
                    </div>
                    <div className={styles.tournDivider} />
                    <div className={styles.tournStat}>
                      <span className={styles.tournStatVal}>{(tourn.loftsCount || 0) * (tourn.pigeonsPerLoft || 11)}</span>
                      <span className={styles.tournStatLabel}>{t("listing.pigeons")}</span>
                    </div>
                    <div className={styles.tournDivider} />
                    <div className={styles.tournStat}>
                      <span className={styles.tournStatVal}>{tourn.dayDates?.length ? tourn.dayDates[0] : "-"}</span>
                      <span className={styles.tournStatLabel}>{t("listing.date")}</span>
                    </div>
                  </div>
                </a>
              ))}
            </div>
            {tournaments.length === 0 && (
              <div className="text-center text-muted" style={{ padding: "2rem" }}>
                Loading tournaments...
              </div>
            )}
            <div className={styles.viewAll}>
              <a href="/tournaments" className="btn btn-outline">
                {t("featured.viewAll")}
              </a>
            </div>
          </div>
        </section>

        {/* ── CTA Section ──────────────────────────── */}
        <section className={styles.ctaSection}>
          <div className="container">
            <div className={styles.ctaCard}>
              <h2 className={styles.ctaTitle}>
                {t("cta.title")}
              </h2>
              <p className={styles.ctaDesc}>
                {t("cta.desc")}
              </p>
              <a href="/tournaments" className="btn btn-primary">
                {t("cta.button")}
              </a>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
