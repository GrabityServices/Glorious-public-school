import { Link } from "react-router-dom";
import { ShieldCheck, Target, Heart, Compass, CheckCircle2, ArrowRight } from "lucide-react";
import styles from "./about.module.css";
import FadeUp from "@/components/motion/FadeUp";
import useDocumentTitle from "@/hooks/useDocumentTitle";
import { SCHOOL_INFO } from "@/data/schoolData";

export default function AboutPage() {
  useDocumentTitle("About Us | Glorious Public School, Jhajha");

  return (
    <div className={styles.pageWrapper}>
      {/* Header */}
      <section className={styles.heroHeader}>
        <div className={styles.container}>
          <FadeUp>
            <span className="section-subtitle">Our Heritage & Mission</span>
            <h1 className={styles.title}>About Glorious Public School</h1>
            <p className={styles.subtitle}>
              Nurturing creative minds, building character, and developing upright leaders from Nursery to Class 10th in Jhajha, Jamui, Bihar.
            </p>
          </FadeUp>
        </div>
      </section>

      {/* Main Philosophy Section */}
      <section className={styles.section}>
        <div className={styles.container}>
          <div className={styles.twoCol}>
            <FadeUp>
              <span className={styles.subHeading}>Welcome to Our Sanctuary of Learning</span>
              <h2 className={styles.heading2}>Dedication to Character, Integrity & Academic Excellence</h2>
              <p className={styles.paragraph}>
                {SCHOOL_INFO.aboutText}
              </p>
              <p className={styles.paragraph}>
                Located at <strong>Koltex, Petrol Pump, Jhajha, Jamui (Bihar 811308)</strong>, our institution was established to deliver world-standard, English-medium education accessible to every family in the region. We synthesize the timeless values of Indian moral ethics with modern technological and pedagogical innovations.
              </p>
            </FadeUp>

            <FadeUp delay={0.15}>
              <div className={styles.visionMissionCard}>
                <div className={styles.vmBlock}>
                  <div className={styles.vmIcon}><Target size={24} /></div>
                  <div>
                    <h3>Our Vision</h3>
                    <p>{SCHOOL_INFO.vision}</p>
                  </div>
                </div>

                <div className={styles.vmBlock}>
                  <div className={styles.vmIcon}><Compass size={24} /></div>
                  <div>
                    <h3>Our Mission</h3>
                    <p>{SCHOOL_INFO.mission}</p>
                  </div>
                </div>
              </div>
            </FadeUp>
          </div>
        </div>
      </section>

      {/* Core Principles */}
      <section className={styles.valuesSection}>
        <div className={styles.container}>
          <FadeUp>
            <div className={styles.centeredHeader}>
              <span className="section-subtitle">What Guides Us</span>
              <h2>The Four Pillars of Glorious Public School</h2>
            </div>
          </FadeUp>

          <div className={styles.valuesGrid}>
            <FadeUp delay={0.1} fullHeight>
              <div className={styles.pillarCard}>
                <div className={styles.pillarNumber}>01</div>
                <h3>Erudite Scholarship</h3>
                <p>Curriculum designed to instill deep understanding, scientific inquisitiveness, bilingual command, and rigorous analytical skills.</p>
              </div>
            </FadeUp>

            <FadeUp delay={0.15} fullHeight>
              <div className={styles.pillarCard}>
                <div className={styles.pillarNumber}>02</div>
                <h3>Character & Integrity</h3>
                <p>Firm emphasis on moral honesty, empathy, respect for elders, civic responsibility, and environmental stewardship.</p>
              </div>
            </FadeUp>

            <FadeUp delay={0.2} fullHeight>
              <div className={styles.pillarCard}>
                <div className={styles.pillarNumber}>03</div>
                <h3>Creative & Independent Thinking</h3>
                <p>Nurturing originality and problem-solving through arts, science projects, elocution, debates, and interactive exhibitions.</p>
              </div>
            </FadeUp>

            <FadeUp delay={0.25} fullHeight>
              <div className={styles.pillarCard}>
                <div className={styles.pillarNumber}>04</div>
                <h3>All-Rounded Personality</h3>
                <p>Harmonizing academics with physical athletics, yoga, sports tournaments, cultural stage events, and self-confidence.</p>
              </div>
            </FadeUp>
          </div>
        </div>
      </section>

      {/* Leadership & Campus Facts */}
      <section className={styles.section}>
        <div className={styles.container}>
          <div className={styles.statsBanner}>
            <div className={styles.statsFlex}>
              <div>
                <span className={styles.statsTag}>Key Highlights</span>
                <h3>Why Parents in Jhajha Choose Glorious</h3>
                <ul className={styles.checkList}>
                  <li><CheckCircle2 size={16} /> Continuous education pathway from Nursery to Class 10th</li>
                  <li><CheckCircle2 size={16} /> 100% Board Pass Result with top distinctions in Jamui district</li>
                  <li><CheckCircle2 size={16} /> Safe bus & van fleet covering Jhajha, Sono, Gidhaur, and surrounding areas</li>
                  <li><CheckCircle2 size={16} /> Secure residential hostel with nutritious dining and evening faculty study</li>
                  <li><CheckCircle2 size={16} /> Modern science apparatus, computer coding lab, and expansive playground</li>
                </ul>
              </div>
              <div className={styles.statsCta}>
                <Link to="/admissions" className="btn btn-gold">
                  <span>Apply for Admission</span>
                  <ArrowRight size={16} />
                </Link>
                <Link to="/contact" className="btn btn-secondary" style={{ marginTop: "12px" }}>
                  <span>Contact School Office</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
