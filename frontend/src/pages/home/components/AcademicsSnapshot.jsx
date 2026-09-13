import { Link } from "react-router-dom";
import { ArrowRight, Check } from "lucide-react";
import styles from "./AcademicsSnapshot.module.css";
import FadeUp from "@/components/motion/FadeUp";
import { ACADEMIC_WINGS } from "@/data/academicsData";

const WING_IMAGES = {
  "pre-primary": "/images/expert_guidance.png",
  "primary": "/images/hero_meditation.png",
  "middle": "/images/how_we_work.png",
  "secondary": "/images/blog1.png",
};

export default function AcademicsSnapshot() {
  return (
    <section className={styles.section}>
      <div className={styles.container}>
        <div className={styles.header}>
          <FadeUp>
            <span className="section-subtitle">Academic Wings</span>
            <h2 className={styles.title}>Foundational Learning to High-School Board Excellence</h2>
            <p className={styles.subtitle}>
              Our curriculum is structured to support every developmental milestone from joyful early playway learning to rigorous high school board examination readiness.
            </p>
          </FadeUp>
        </div>

        <div className={styles.wingsGrid}>
          {ACADEMIC_WINGS.map((wing, idx) => (
            <FadeUp key={wing.id} delay={0.1 * (idx + 1)} fullHeight>
              <div className={styles.wingCard}>
                <div className={styles.cardMedia}>
                  <img
                    src={WING_IMAGES[wing.id] || "/images/hero_meditation.png"}
                    alt={wing.title}
                    className={styles.cardImage}
                  />
                  <div className={styles.gradeBadgeOverlay}>
                    {wing.grades}
                  </div>
                </div>

                <div className={styles.cardBody}>
                  <div className={styles.cardTop}>
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
