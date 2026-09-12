import { Link } from "react-router-dom";
import { GraduationCap, Bus, Home, BookOpen, Monitor, Trophy, ArrowRight } from "lucide-react";
import styles from "./FacilitiesSnapshot.module.css";
import FadeUp from "@/components/motion/FadeUp";
import { FACILITIES_DATA } from "@/data/facilitiesData";

export default function FacilitiesSnapshot() {
  const iconMap = {
    GraduationCap: <GraduationCap size={24} />,
    Bus: <Bus size={24} />,
    Home: <Home size={24} />,
    BookOpen: <BookOpen size={24} />,
    Monitor: <Monitor size={24} />,
    Trophy: <Trophy size={24} />,
  };

  return (
    <section className={styles.section}>
      <div className={styles.container}>
        <div className={styles.headerFlex}>
          <div>
            <FadeUp>
              <span className="section-subtitle">Campus Infrastructure</span>
              <h2 className={styles.title}>Our Facilities for Complete Growth</h2>
              <p className={styles.subtitle}>
                Equipped with safe buses, residential hostel, qualified teachers, modern library, science and IT labs, and sports grounds.
              </p>
            </FadeUp>
          </div>
          <FadeUp delay={0.1}>
            <Link to="/facilities" className="btn btn-secondary">
              <span>View All Facilities</span>
              <ArrowRight size={16} />
            </Link>
          </FadeUp>
        </div>

        <div className={styles.grid}>
          {FACILITIES_DATA.map((item, idx) => (
            <FadeUp key={item.id} delay={0.08 * (idx + 1)}>
              <div className={styles.card}>
                <div className={styles.iconCircle}>
                  {iconMap[item.icon] || <BookOpen size={24} />}
                </div>
                <h3 className={styles.cardTitle}>{item.title}</h3>
                <p className={styles.cardDesc}>{item.shortDesc}</p>
                <ul className={styles.bulletsList}>
                  {item.highlights.slice(0, 2).map((hl, i) => (
                    <li key={i}>{hl}</li>
                  ))}
                </ul>
              </div>
            </FadeUp>
          ))}
        </div>
      </div>
    </section>
  );
}
