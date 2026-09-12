import { Link } from "react-router-dom";
import { Award, ArrowRight, Phone, ShieldCheck, Bus, Home, BookOpen } from "lucide-react";
import { m } from "framer-motion";
import styles from "./Hero.module.css";
import FadeUp from "@/components/motion/FadeUp";
import { SCHOOL_INFO } from "@/data/schoolData";

export default function Hero() {
  return (
    <section className={styles.heroSection}>
      {/* Subtle background glow */}
      <div className={styles.bgOverlay} />

      <div className={styles.container}>
        <div className={styles.heroGrid}>
          {/* Left Content */}
          <div className={styles.heroContent}>
            <FadeUp>
              <div className={styles.admissionBadge}>
                <span className={styles.pulseDot} />
                <span>🎓 ADMISSION IS GOING ON (NURSERY TO CLASS 10TH) 🎓</span>
              </div>
            </FadeUp>

            <FadeUp delay={0.1}>
              <h1 className={styles.heroTitle}>
                Welcome to <span className={styles.highlightText}>Glorious</span> Public School
              </h1>
            </FadeUp>

            <FadeUp delay={0.2}>
              <p className={styles.heroSubtitle}>
                Dedicated to create <strong>erudite, upright leaders of tomorrow's world</strong>. We nurture the creative, independent thinking of every child, fostering all-rounded personality, ethics, and unwavering integrity.
              </p>
            </FadeUp>

            {/* Quick Feature Pills */}
            <FadeUp delay={0.25}>
              <div className={styles.featurePills}>
                <span className={styles.pill}><BookOpen size={14} /> Nursery to Class 10th</span>
                <span className={styles.pill}><Bus size={14} /> Safe Transport</span>
                <span className={styles.pill}><Home size={14} /> Hostel Facility</span>
                <span className={styles.pill}><ShieldCheck size={14} /> Quality Education</span>
              </div>
            </FadeUp>

            {/* CTA Buttons */}
            <FadeUp delay={0.3}>
              <div className={styles.btnGroup}>
                <Link to="/admissions" className="btn btn-gold">
                  <span>Apply Now for Your Kids</span>
                  <ArrowRight size={16} />
                </Link>
                <Link to="/academics" className="btn btn-secondary">
                  <span>Explore Academics</span>
                </Link>
                <a href={`tel:${SCHOOL_INFO.phone}`} className={styles.phoneLink}>
                  <div className={styles.phoneIconCircle}>
                    <Phone size={15} />
                  </div>
                  <div>
                    <span className={styles.phoneLabel}>Have questions? Call</span>
                    <span className={styles.phoneNumber}>{SCHOOL_INFO.phone}</span>
                  </div>
                </a>
              </div>
            </FadeUp>
          </div>

          {/* Right Card / Visual Showcase */}
          <FadeUp delay={0.2} className={styles.visualCol}>
            <div className={styles.visualCard}>
              <div className={styles.cardHeader}>
                <div className={styles.cardBadge}>Jhajha, Jamui (Bihar)</div>
                <h3>Academic Session 2026-27</h3>
              </div>

              <div className={styles.cardHighlights}>
                <div className={styles.highlightItem}>
                  <div className={styles.iconBox}><Award size={20} /></div>
                  <div>
                    <h4>100% Board Success</h4>
                    <p>Dedicated mentorship for Class 9th & 10th with continuous testing.</p>
                  </div>
                </div>

                <div className={styles.highlightItem}>
                  <div className={styles.iconBox}><BookOpen size={20} /></div>
                  <div>
                    <h4>Pre-Primary to Secondary</h4>
                    <p>Play-way toddler learning to high-school scientific rigour.</p>
                  </div>
                </div>

                <div className={styles.highlightItem}>
                  <div className={styles.iconBox}><Bus size={20} /></div>
                  <div>
                    <h4>Extensive Transport & Hostel</h4>
                    <p>Daily bus fleet covering Jhajha & Jamui with caring boarding facility.</p>
                  </div>
                </div>
              </div>

              <div className={styles.cardFooter}>
                <div className={styles.locationTag}>
                  📍 Koltex, Petrol Pump, Jhajha
                </div>
                <Link to="/contact" className={styles.visitLink}>
                  Visit Campus &rarr;
                </Link>
              </div>
            </div>
          </FadeUp>
        </div>
      </div>
    </section>
  );
}
