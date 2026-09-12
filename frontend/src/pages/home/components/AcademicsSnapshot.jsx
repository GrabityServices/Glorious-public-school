import { Link } from "react-router-dom";
import { ArrowRight, BookOpen, Sparkles, Check } from "lucide-react";
import styles from "./AcademicsSnapshot.module.css";
import FadeUp from "@/components/motion/FadeUp";
import { ACADEMIC_WINGS } from "@/data/academicsData";

export default function AcademicsSnapshot() {
  return (
    <section className={styles.section}>
      <div className={styles.container}>
        <div className={styles.header}>
          <FadeUp>
            <span className="section-subtitle">Academic Wings</span>
            <h2 className={styles.title}>From Nursery Foundations to Class 10th Board Mastery</h2>
            <p className={styles.subtitle}>
              Our curriculum is structured to support every developmental milestone from joyful early playway learning to rigorous high school board examination readiness.
            </p>
          </FadeUp>
        </div>

        <div className={styles.wingsGrid}>
          {ACADEMIC_WINGS.map((wing, idx) => (
            <FadeUp key={wing.id} delay={0.1 * (idx + 1)}>
              <div className={styles.wingCard}>
                <div className={styles.cardTop}>
                  <span className={styles.gradeBadge}>{wing.grades}</span>
                  <span className={styles.ageTag}>{wing.ageGroup}</span>
                </div>
                <h3 className={styles.wingTitle}>{wing.title}</h3>
                <p className={styles.wingTagline}>{wing.tagline}</p>
                <p className={styles.wingDesc}>{wing.description}</p>

                <div className={styles.featuresList}>
                  {wing.features.slice(0, 3).map((feat, i) => (
                    <div key={i} className={styles.featItem}>
                      <Check size={14} className={styles.checkIcon} />
                      <span>{feat}</span>
                    </div>
                  ))}
                </div>

                <div className={styles.cardBottom}>
                  <Link to="/academics" className={styles.cardLink}>
                    <span>Explore Syllabus</span>
                    <ArrowRight size={14} />
                  </Link>
                </div>
              </div>
            </FadeUp>
          ))}
        </div>

        <div className={styles.ctaBottom}>
          <FadeUp delay={0.3}>
            <Link to="/academics" className="btn btn-primary">
              <span>View Full Academic Curriculum & Timings</span>
              <ArrowRight size={16} />
            </Link>
          </FadeUp>
        </div>
      </div>
    </section>
  );
}
