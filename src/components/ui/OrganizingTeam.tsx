"use client";

import Image from "next/image";
import styles from "./OrganizingTeam.module.css";
import { useLanguage } from "@/context/LanguageContext";

const featuredMembers = [
  {
    id: "malik-danish",
    enName: "Malik Danish",
    urName: "ملک دانش",
    enRole: "Organizer",
    urRole: "آرگنائزر",
    image: "/images/team/Malik Danish - Organizer.jpeg",
  },
  {
    id: "umair-ahmed",
    enName: "Ustad Umair Ahmed",
    urName: "استاد عمیر احمد",
    image: "/images/team/Ustad Umair Ahmed.jpeg",
  },
];

const teamMembers = [
  {
    id: "iftikhar-jani",
    enName: "Ustad Iftikhar Jani",
    urName: "استاد افتخار جانی",
    image: "/images/team/Ustad Iftikhar Jani.jpeg",
  },
  {
    id: "khawaja-asif",
    enName: "Ustad Khawaja Asif",
    urName: "استاد خواجہ آصف",
    image: "/images/team/Ustad Khawaja Asif.jpeg",
  },
  {
    id: "mansoor-qureshi",
    enName: "Ustad Mansoor Qureshi",
    urName: "استاد منصور قریشی",
    image: "/images/team/Ustad Mansoor Qureshi.jpeg",
  },
  {
    id: "malik-rashid",
    enName: "Khalifa Malik Rashid",
    urName: "خلیفہ ملک راشد",
    image: "/images/team/Khalifa Malik Rashid.jpeg",
  },
];

export default function OrganizingTeam() {
  const { locale } = useLanguage();
  
  return (
    <section className={styles.section}>
      <div className="container">
        <div className={styles.sectionHeader}>
          <h2 className="section-title">
            Organizing <span className="accent">Team</span>
          </h2>
          <p className="section-subtitle">
            {locale === "ur" ? "ہماری منتظمین کی ٹیم" : "The personalities behind the championship"}
          </p>
        </div>

        <div className={styles.featuredGrid}>
          {featuredMembers.map((member) => (
            <div key={member.id} className={`${styles.memberCard} ${styles.featuredCard}`}>
              <div className={styles.imageWrapperFeatured}>
                <Image
                  src={member.image}
                  alt={member.enName}
                  fill
                  className={styles.image}
                  sizes="(max-width: 768px) 100vw, 50vw"
                />
              </div>
              <div className={styles.info}>
                <h3 className={styles.enName}>{member.enName}</h3>
                <h3 className={styles.urName}>{member.urName}</h3>
                {member.enRole && (
                  <div className={styles.roleWrapper}>
                    <span className={styles.enRole}>{member.enRole}</span>
                    <span className={styles.urRole}>{member.urRole}</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        <div className={styles.teamGrid}>
          {teamMembers.map((member) => (
            <div key={member.id} className={styles.memberCard}>
              <div className={styles.imageWrapper}>
                <Image
                  src={member.image}
                  alt={member.enName}
                  fill
                  className={styles.image}
                  sizes="(max-width: 768px) 50vw, 25vw"
                />
              </div>
              <div className={styles.info}>
                <h4 className={styles.enNameRegular}>{member.enName}</h4>
                <h4 className={styles.urNameRegular}>{member.urName}</h4>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
