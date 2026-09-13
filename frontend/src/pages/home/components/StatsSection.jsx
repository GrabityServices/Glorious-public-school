import { Award, Users, GraduationCap, Bus, CheckCircle2, ShieldCheck } from "lucide-react";
import styles from "./StatsSection.module.css";
import FadeUp from "@/components/motion/FadeUp";
import { SCHOOL_INFO } from "@/data/schoolData";

export default function StatsSection() {
  const statIcons = [
    <GraduationCap size={28} />,
    <Users size={28} />,
    <Award size={28} />,
    <CheckCircle2 size={28} />,
    <ShieldCheck size={28} />,
    <Bus size={28} />,
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
          {SCHOOL_INFO.stats.map((stat, idx) => (
            <FadeUp key={stat.label} delay={0.08 * (idx + 1)} fullHeight>
              <div className={styles.statCard}>
                <div className={styles.iconCircle}>
                  {statIcons[idx % statIcons.length]}
                </div>
                <div className={styles.statValue}>{stat.value}</div>
                <div className={styles.statLabel}>{stat.label}</div>
              </div>
            </FadeUp>
          ))}
        </div>
      </div>
    </section>
  );
}
