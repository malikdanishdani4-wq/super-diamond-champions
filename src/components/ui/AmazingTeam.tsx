"use client";

import Image from "next/image";
import styles from "./AmazingTeam.module.css";
import { useLanguage } from "@/context/LanguageContext";

const posterMembers = [
  {
    id: "mansoor-qureshi",
    type: "regular",
    enName: "Ustad Mansoor Qureshi",
    urName: "استاد منصور قریشی",
    image: "/images/team/Ustad Mansoor Qureshi.jpeg",
  },
  {
    id: "khawaja-asif",
    type: "regular",
    enName: "Ustad Khawaja Asif",
    urName: "استاد خواجہ آصف",
    image: "/images/team/Ustad Khawaja Asif.jpeg",
  },
  {
    id: "malik-danish",
    type: "featured",
    enName: "Malik Danish",
    urName: "ملک دانش",
    enRole: "Organizer",
    urRole: "آرگنائزر",
    image: "/images/team/Malik Danish - Organizer.jpeg",
  },
  {
    id: "umair-ahmed",
    type: "featured",
    enName: "Ustad Umair Ahmed",
    urName: "استاد عمیر احمد",
    image: "/images/team/Ustad Umair Ahmed.jpeg",
  },
  {
    id: "iftikhar-jani",
    type: "regular",
    enName: "Ustad Iftikhar Jani",
    urName: "استاد افتخار جانی",
    image: "/images/team/Ustad Iftikhar Jani.jpeg",
  },
  {
    id: "malik-rashid",
    type: "regular",
    enName: "Khalifa Malik Rashid",
    urName: "خلیفہ ملک راشد",
    image: "/images/team/Khalifa Malik Rashid.jpeg",
  },
];

export default function AmazingTeam() {
  const { locale } = useLanguage();
  
  return (
    <section className={styles.section}>
      <div className="container">
        <div className={styles.posterContainer}>
          <div className={styles.posterGlow} />
          
          <h2 className={styles.posterTitle}>
            Amazing <span className={styles.accent}>Team</span>
          </h2>
          
          <div className={styles.posterGrid}>
            {posterMembers.map((member) => (
              <div 
                key={member.id} 
                className={`${styles.memberColumn} ${member.type === "featured" ? styles.featured : styles.regular}`}
              >
                <div className={styles.imageBox}>
                  <Image
                    src={member.image}
                    alt={member.enName}
                    fill
                    className={styles.image}
                    sizes="20vw"
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
        </div>
      </div>
    </section>
  );
}
