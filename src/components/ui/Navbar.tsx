"use client";

import { useState, useEffect } from "react";
import { useTheme } from "@/context/ThemeContext";
import { useLanguage } from "@/context/LanguageContext";
import styles from "./Navbar.module.css";

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { theme, toggleTheme } = useTheme();
  const { locale, setLocale, t } = useLanguage();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const toggleLang = () => setLocale(locale === "en" ? "ur" : "en");

  return (
    <nav className={`${styles.navbar} ${scrolled ? styles.scrolled : ""}`}>
      <div className={`container ${styles.inner}`}>
        {/* Logo */}
        <a href="/" className={styles.logo}>
          <span className={styles.logoIcon}>🏆</span>
          <div className={styles.logoText}>
            <span className={styles.logoTitle}>Super Diamond</span>
            <span className={styles.logoSub}>Champions Trophy</span>
          </div>
        </a>

        {/* Desktop Nav */}
        <div className={styles.navLinks}>
          <a href="/" className={styles.navLink}>{t("nav.home")}</a>
          <a href="/tournaments" className={styles.navLink}>{t("nav.tournaments")}</a>
          <a href="/about" className={styles.navLink}>{t("nav.about")}</a>
          <a href="/contact" className={styles.navLink}>{t("nav.contact")}</a>
        </div>

        {/* Actions */}
        <div className={styles.actions}>
          <button onClick={toggleLang} className={styles.langBtn} aria-label="Toggle language">
            {locale === "en" ? "اردو" : "EN"}
          </button>
          <button onClick={toggleTheme} className={styles.themeBtn} aria-label="Toggle theme">
            {theme === "dark" ? "☀️" : "🌙"}
          </button>
          <a href="/admin/login" className={`btn btn-primary ${styles.adminBtn}`}>
            {t("nav.admin")}
          </a>
        </div>

        {/* Mobile Toggle */}
        <button
          className={`${styles.hamburger} ${mobileOpen ? styles.open : ""}`}
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Toggle menu"
        >
          <span />
          <span />
          <span />
        </button>
      </div>

      {/* Mobile Menu */}
      <div className={`${styles.mobileMenu} ${mobileOpen ? styles.mobileOpen : ""}`}>
        <a href="/" className={styles.mobileLink} onClick={() => setMobileOpen(false)}>{t("nav.home")}</a>
        <a href="/tournaments" className={styles.mobileLink} onClick={() => setMobileOpen(false)}>{t("nav.tournaments")}</a>
        <a href="/about" className={styles.mobileLink} onClick={() => setMobileOpen(false)}>{t("nav.about")}</a>
        <a href="/contact" className={styles.mobileLink} onClick={() => setMobileOpen(false)}>{t("nav.contact")}</a>
        <div className={styles.mobileDivider} />
        <div className={styles.mobileActions}>
          <button onClick={toggleLang} className={styles.mobileLangBtn}>
            {locale === "en" ? "🌐 اردو میں تبدیل کریں" : "🌐 Switch to English"}
          </button>
          <button onClick={toggleTheme} className={styles.themeBtn}>
            {theme === "dark" ? `☀️ ${t("nav.lightMode")}` : `🌙 ${t("nav.darkMode")}`}
          </button>
          <a href="/admin/login" className="btn btn-primary" onClick={() => setMobileOpen(false)}>
            {t("nav.adminPanel")}
          </a>
        </div>
      </div>
    </nav>
  );
}
