import { useState } from "react";
import { Link } from "react-router-dom";
import { BookOpen, Clock, CheckCircle, Award, Sparkles, FileText, ArrowRight } from "lucide-react";
import styles from "./academics.module.css";
import FadeUp from "@/components/motion/FadeUp";
import useDocumentTitle from "@/hooks/useDocumentTitle";
import { ACADEMIC_WINGS, SCHOOL_ROUTINE } from "@/data/academicsData";

export default function AcademicsPage() {
  useDocumentTitle("Academics (Nursery to 10th) | Glorious Public School");
  const [activeWing, setActiveWing] = useState(ACADEMIC_WINGS[0].id);

  const selectedWing = ACADEMIC_WINGS.find((w) => w.id === activeWing) || ACADEMIC_WINGS[0];

  return (
    <div className={styles.pageWrapper}>
      {/* Hero Header */}
      <section className={styles.heroHeader}>
        <div className={styles.container}>
          <FadeUp>
            <span className="section-subtitle">Academic Excellence</span>
            <h1 className={styles.title}>Curriculum & Wings (Nursery to Class 10th)</h1>
            <p className={styles.subtitle}>
              A continuous, child-centric academic pathway delivering conceptual clarity, character building, and 100% board examination excellence.
            </p>
          </FadeUp>
        </div>
      </section>

      {/* Wings Interactive Tabs */}
      <section className={styles.section}>
        <div className={styles.container}>
          <div className={styles.tabButtons}>
            {ACADEMIC_WINGS.map((wing) => (
              <button
                key={wing.id}
                onClick={() => setActiveWing(wing.id)}
                className={`${styles.tabBtn} ${activeWing === wing.id ? styles.tabBtnActive : ""}`}
              >
                <span className={styles.tabGrade}>{wing.grades}</span>
                <span className={styles.tabTitle}>{wing.title.split("(")[0]}</span>
              </button>
            ))}
          </div>

          {/* Active Wing Detailed Card */}
          <FadeUp key={selectedWing.id}>
            <div className={styles.wingDetailCard}>
              <div className={styles.wingHeader}>
                <div>
                  <span className={styles.badge}>{selectedWing.grades}</span>
                  <span className={styles.ageBadge}>Age Group: {selectedWing.ageGroup}</span>
                  <h2>{selectedWing.title}</h2>
                  <p className={styles.wingTagline}>{selectedWing.tagline}</p>
                </div>
                <Link to="/admissions" className="btn btn-gold btn-sm">
                  <span>Enroll in {selectedWing.grades}</span>
                  <ArrowRight size={14} />
                </Link>
              </div>

              <p className={styles.wingDesc}>{selectedWing.description}</p>

              <div className={styles.twoColGrid}>
                {/* Subjects List */}
                <div className={styles.cardBlock}>
                  <h3>
                    <BookOpen size={18} /> Subjects & Key Learning Areas
                  </h3>
                  <div className={styles.subjectTags}>
                    {selectedWing.subjects.map((sub, i) => (
                      <span key={i} className={styles.subjectTag}>{sub}</span>
                    ))}
                  </div>
                </div>

                {/* Features & Methodology */}
                <div className={styles.cardBlock}>
                  <h3>
                    <Sparkles size={18} /> Pedagogical Highlights
                  </h3>
                  <ul className={styles.featuresList}>
                    {selectedWing.features.map((feat, i) => (
                      <li key={i}>
                        <CheckCircle size={16} />
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </FadeUp>
        </div>
      </section>

      {/* School Routine & Daily Schedule */}
      <section className={styles.routineSection}>
        <div className={styles.container}>
          <FadeUp>
            <div className={styles.centeredHeader}>
              <span className="section-subtitle">Daily Routine</span>
              <h2>School Timetable & Bell Schedule</h2>
              <p>A well-balanced day harmonizing prayer, academic periods, practical labs, and extracurriculars.</p>
            </div>
          </FadeUp>

          <div className="tableScroll">
            <table className={styles.routineTable}>
              <thead>
                <tr>
                  <th>Time Duration</th>
                  <th>Activity / Period</th>
                </tr>
              </thead>
              <tbody>
                {SCHOOL_ROUTINE.map((item, idx) => (
                  <tr key={idx} className={item.activity.includes("Recess") ? styles.recessRow : ""}>
                    <td className={styles.timeCell}>
                      <Clock size={15} style={{ display: "inline", marginRight: "6px" }} />
                      {item.time}
                    </td>
                    <td className={styles.activityCell}>{item.activity}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Assessment & Evaluation Policy */}
      <section className={styles.section}>
        <div className={styles.container}>
          <div className={styles.evaluationCard}>
            <div className={styles.evalContent}>
              <span className="section-subtitle">Evaluation Standard</span>
              <h2>Continuous & Comprehensive Assessment (CCE)</h2>
              <p>
                At Glorious Public School, we evaluate students' holistic development through regular classroom participation, notebook maintenance, laboratory practicals, periodic unit tests, and half-yearly/annual examinations.
              </p>
              <div className={styles.evalPills}>
                <span className={styles.evalPill}>Periodic Test 1 (July)</span>
                <span className={styles.evalPill}>Term-1 Half Yearly (September)</span>
                <span className={styles.evalPill}>Periodic Test 2 (December)</span>
                <span className={styles.evalPill}>Annual Board / Final Exam (February-March)</span>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
