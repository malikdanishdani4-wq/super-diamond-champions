"use client";

import { useLanguage } from "@/context/LanguageContext";
import styles from "./Footer.module.css";

export default function Footer() {
  const { t } = useLanguage();

  return (
    <footer className={styles.footer}>
      <div className={`container ${styles.inner}`}>
        <div className={styles.col}>
          <h4 className={styles.colTitle}>{t("footer.contact")}</h4>
          <nav className={styles.links}>
            <span>📧 info@superdiamondtrophy.com</span>
            <span>📞 03145208143</span>
            <span>📍 Rawalpindi / Islamabad</span>
            <a
              href="https://wa.me/923145208143"
              target="_blank"
              rel="noopener noreferrer"
              className={styles.whatsappLink}
            >
              <svg
                className={styles.whatsappIcon}
                viewBox="0 0 32 32"
                fill="currentColor"
                xmlns="http://www.w3.org/2000/svg"
                aria-hidden="true"
              >
                <path d="M16.004 0C7.165 0 0 7.163 0 16.001c0 2.822.736 5.578 2.136 8.007L.074 32l8.188-2.147A15.944 15.944 0 0 0 16.004 32C24.838 32 32 24.837 32 16.001 32 7.163 24.838 0 16.004 0Zm0 29.393a13.368 13.368 0 0 1-7.222-2.112l-.518-.307-5.369 1.408 1.432-5.233-.337-.536a13.337 13.337 0 0 1-2.047-7.112C2.943 8.8 8.8 2.607 16.004 2.607c3.492 0 6.773 1.36 9.238 3.83a12.985 12.985 0 0 1 3.818 9.247c-.003 6.903-5.857 12.709-13.056 12.709Zm7.153-9.517c-.392-.196-2.32-1.145-2.68-1.276-.36-.13-.622-.196-.884.196s-1.015 1.276-1.244 1.538c-.23.262-.458.295-.85.098-.392-.196-1.655-.61-3.154-1.945-1.166-1.04-1.952-2.324-2.182-2.716-.229-.393-.024-.605.172-.8.177-.177.393-.458.589-.687.196-.23.261-.393.392-.655.131-.262.066-.491-.033-.687-.098-.197-.884-2.13-1.211-2.917-.32-.766-.644-.662-.884-.674-.229-.012-.491-.015-.753-.015s-.687.098-.1048.491c-.36.393-1.375 1.341-1.375 3.27 0 1.93 1.408 3.793 1.604 4.055.196.262 2.77 4.228 6.71 5.929.937.404 1.668.646 2.238.827.94.3 1.796.257 2.473.156.754-.113 2.32-.95 2.649-1.867.328-.917.328-1.703.229-1.867-.098-.163-.36-.262-.753-.458Z" />
              </svg>
              <span>WhatsApp</span>
            </a>
          </nav>
        </div>
      </div>

      <div className={styles.bottom}>
        <div className="container">
          <p>© 2026 Super Diamond Champions Trophy. {t("footer.rights")}</p>
        </div>
      </div>
    </footer>
  );
}
