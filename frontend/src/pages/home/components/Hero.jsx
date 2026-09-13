import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Award, ArrowRight, Phone, ShieldCheck, Bus, Home, BookOpen, Sparkles } from "lucide-react";
import { AnimatePresence, m } from "framer-motion";
import styles from "./Hero.module.css";
import FadeUp from "@/components/motion/FadeUp";
import HeroSlider from "./HeroSlider";
import { SCHOOL_INFO } from "@/data/schoolData";

const PRESTIGE_HIGHLIGHTS = [
  {
    id: "pedagogy",
    icon: <Sparkles size={14} className={styles.premiumIcon} />,
    text: "EMPOWERING FUTURE LEADERS WITH CRITICAL & ETHICAL THINKING",
  },
  {
    id: "motto",
    icon: <Award size={14} className={styles.premiumIcon} />,
    text: "KNOWLEDGE • LEADERSHIP • INTEGRITY • JHAJHA",
  },
  {
    id: "facilities",
    icon: <ShieldCheck size={14} className={styles.premiumIcon} />,
    text: "SMART CLASSROOMS, MODERN LABS & DEDICATED FACULTY",
  },
  {
    id: "holistic",
    icon: <Sparkles size={14} className={styles.premiumIcon} />,
    text: "BALANCING SCHOLARLY RIGOR, SPORTS & MORAL CHARACTER",
  },
];

export default function Hero() {
  const [highlightIdx, setHighlightIdx] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setHighlightIdx((prev) => (prev + 1) % PRESTIGE_HIGHLIGHTS.length);
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  const currentHighlight = PRESTIGE_HIGHLIGHTS[highlightIdx];

  return (
    <section className={styles.heroSection}>
      {/* Subtle background glow */}
      <div className={styles.bgOverlay} />

      <div className={styles.container}>
        <div className={styles.heroGrid}>
          {/* Left Content */}
          <div className={styles.heroContent}>
            {/* Dynamic Prestige & Accreditation Badge */}
            <FadeUp>
              <div className={styles.prestigeBadge}>
                <span className={styles.pulseDot} />
                <div className={styles.badgeRotator}>
                  <AnimatePresence mode="wait">
                    <m.div
                      key={currentHighlight.id}
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -5 }}
                      transition={{ duration: 0.3 }}
                      className={styles.badgeItem}
                    >
                      {currentHighlight.icon}
                      <span>{currentHighlight.text}</span>
                    </m.div>
                  </AnimatePresence>
                </div>
              </div>
            </FadeUp>

            <FadeUp delay={0.1}>
              <h1 className={styles.heroTitle}>
                Empowering Young Minds at <span className={styles.highlightText}>Glorious</span> Public School
              </h1>
            </FadeUp>

            <FadeUp delay={0.16}>
              <p className={styles.heroSubtitle}>
                <strong>Glorious Public School</strong> provides a vibrant, values-driven sanctuary of learning in Jhajha — dedicated to academic excellence, creative curiosity, and character leadership from Nursery to Class 10th.
              </p>
            </FadeUp>

            {/* Quick Feature Pills */}
            <FadeUp delay={0.24}>
              <div className={styles.featurePills}>
                <span className={styles.pill}><BookOpen size={14} /> Concept-Based Curriculum</span>
                <span className={styles.pill}><Bus size={14} /> Safe Transport</span>
                <span className={styles.pill}><Home size={14} /> Hostel Facility</span>
                <span className={styles.pill}><ShieldCheck size={14} /> Holistic Growth</span>
              </div>
            </FadeUp>

            {/* CTA Buttons */}
            <FadeUp delay={0.3}>
              <div className={styles.btnGroup}>
                <Link to="/admissions" className="btn btn-gold">
                  <span>Apply for Admission</span>
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
                    <span className={styles.phoneLabel}>Helpline</span>
                    <span className={styles.phoneNumber}>{SCHOOL_INFO.phone}</span>
                  </div>
                </a>
              </div>
            </FadeUp>
          </div>

          {/* Right Visual Slider */}
          <FadeUp delay={0.2} className={styles.sliderCol}>
            <HeroSlider />
          </FadeUp>
        </div>
      </div>
    </section>
  );
}
