import { Award, Users, GraduationCap, Bus, CheckCircle2, ShieldCheck } from "lucide-react";
import styles from "./StatsSection.module.css";
import FadeUp from "@/components/motion/FadeUp";
import { SCHOOL_INFO } from "@/data/schoolData";
import { useData } from "@/context/DataContext";

export default function StatsSection() {
  const { schoolInfo } = useData();
  const statsList = schoolInfo?.stats || SCHOOL_INFO.stats;

  const statIcons = [
    <GraduationCap size={28} />,
    <Users size={28} />,
    <Award size={28} />,
    <CheckCircle2 size={28} />,
    <ShieldCheck size={28} />,
    <Bus size={28} />,
  ];

  const THEMES = [
    { card: styles.cardIndigo, text: styles.valIndigo, icon: styles.iconIndigo },
    { card: styles.cardEmerald, text: styles.valEmerald, icon: styles.iconEmerald },
    { card: styles.cardAmber, text: styles.valAmber, icon: styles.iconAmber },
    { card: styles.cardRose, text: styles.valRose, icon: styles.iconRose },
    { card: styles.cardSky, text: styles.valSky, icon: styles.iconSky },
    { card: styles.cardViolet, text: styles.valViolet, icon: styles.iconViolet },
  ];

  return (
    <section className={styles.section}>
      <div className={styles.container}>
        <div className={styles.header}>
          <FadeUp>
            <span className="section-subtitle">Our Milestones</span>
            <h2 className={styles.title}>School Achievements & Community</h2>
            <p className={styles.subtitle}>
              Numbers that reflect our dedication to nurturing young minds in Jhajha, Jamui, and beyond.
            </p>
          </FadeUp>
        </div>

        <div className={styles.statsGrid}>
          {statsList.map((stat, idx) => {
            const theme = THEMES[idx % THEMES.length];
            return (
              <FadeUp key={stat.label} delay={0.08 * (idx + 1)} fullHeight>
                <div className={`${styles.statCard} ${theme.card}`}>
                  <div className={`${styles.iconCircle} ${theme.icon}`}>
                    {statIcons[idx % statIcons.length]}
                  </div>
                  <div className={`${styles.statValue} ${theme.text}`}>{stat.value}</div>
                  <div className={styles.statLabel}>{stat.label}</div>
                </div>
              </FadeUp>
            );
          })}
        </div>
      </div>
    </section>
  );
}
