import { useState } from "react";
import { Link } from "react-router-dom";
import { BookOpen, Clock, CheckCircle, Award, Sparkles, FileText, ArrowRight } from "lucide-react";
import styles from "./academics.module.css";
import FadeUp from "@/components/motion/FadeUp";
import useDocumentTitle from "@/hooks/useDocumentTitle";
import { ACADEMIC_WINGS, SCHOOL_ROUTINE } from "@/data/academicsData";
import { useData } from "@/context/DataContext";

export default function AcademicsPage() {
  useDocumentTitle("Academics, Curriculum & Bell Schedule (Nursery to 10th) | Glorious Public School", {
    path: "/academics",
    description:
      "Explore the CBSE/NCERT curriculum from Nursery to Class 10th at Glorious Public School, Jhajha, including Pre-Primary, Primary, Middle, and Secondary wings, daily Bell Schedule (8:00 AM - 2:30 PM), and CCE assessment.",
    keywords:
      "Glorious Public School academics, CBSE curriculum Jhajha, school timetable Jhajha, bell schedule Glorious Public School, Nursery to 10th syllabus Jamui",
    aeoSummary:
      "Glorious Public School follows an English-medium CBSE/NCERT curriculum divided into Pre-Primary (Nursery–UKG), Primary (Class 1–5), Middle (Class 6–8), and Secondary (Class 9–10) wings, running daily from 7:50 AM Morning Assembly to 2:30 PM Dispersal.",
    faqs: [
      {
        question: "What curriculum does Glorious Public School follow?",
        answer:
          "Glorious Public School follows the CBSE pattern with an NCERT-integrated English-medium curriculum from Nursery to Class 10th, utilizing Continuous & Comprehensive Evaluation (CCE).",
      },
      {
        question: "What is the daily timetable and bell schedule at Glorious Public School?",
        answer:
          "Morning Assembly starts at 7:50 AM, 1st to 4th periods run from 8:15 AM to 11:00 AM, Mid-Day Recess is from 11:00 AM to 11:30 AM, 5th to 8th periods run from 11:30 AM to 2:20 PM, and Dispersal is at 2:30 PM.",
      },
    ],
  });
  const { schoolInfo } = useData();
  const [activeWing, setActiveWing] = useState(ACADEMIC_WINGS[0].id);

  const selectedWing = ACADEMIC_WINGS.find((w) => w.id === activeWing) || ACADEMIC_WINGS[0];
  const bellSchedule =
    Array.isArray(schoolInfo?.bellSchedule) && schoolInfo.bellSchedule.length > 0
      ? schoolInfo.bellSchedule
      : SCHOOL_ROUTINE;

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
                {bellSchedule.map((item, idx) => (
                  <tr key={idx} className={String(item.activity || "").toLowerCase().includes("recess") || String(item.activity || "").toLowerCase().includes("break") ? styles.recessRow : ""}>
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
