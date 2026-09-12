import { m } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import styles from "./terms.module.css";
import FadeUp from "@/components/motion/FadeUp";
import StaggerContainer from "@/components/motion/StaggerContainer";
import { varStaggerItem } from "@/lib/motion/stagger";
import useDocumentTitle from "@/hooks/useDocumentTitle";
import { SCHOOL_INFO } from "@/data/schoolData";

export default function TermsPage() {
  useDocumentTitle("Student Code of Conduct & School Rules | Glorious Public School");

  return (
    <div className={styles.pageWrapper}>
      {/* Hero Header */}
      <section className={styles.heroHeader}>
        <div className={styles.container}>
          <FadeUp>
            <span className="section-subtitle">Discipline & Guidelines</span>
            <h1>Student Code of Conduct & School Rules</h1>
          </FadeUp>
          <FadeUp delay={0.15}>
            <p className={styles.subtitle}>
              Standards of discipline, academic integrity, punctuality, and mutual respect expected at Glorious Public School, Jhajha.
            </p>
          </FadeUp>
        </div>
      </section>

      {/* Terms Details Container */}
      <section className={styles.container}>
        <FadeUp delay={0.25}>
          <div className={styles.contentBox}>
            <span className={styles.lastUpdated}>Academic Session 2026 - 2027</span>

            <StaggerContainer staggerVal={0.1}>
              <m.div variants={varStaggerItem} className={styles.section}>
                <h2 className={styles.sectionTitle}>1. School Attendance & Punctuality</h2>
                <p className={styles.text}>
                  Students are expected to arrive at the campus before 08:00 AM for the morning assembly. Minimum 75% attendance is mandatory for appearing in the Half-Yearly and Annual examinations. Leave applications must be countersigned by parents or legal guardians.
                </p>
              </m.div>

              <m.div variants={varStaggerItem} className={styles.section}>
                <h2 className={styles.sectionTitle}>2. Uniform & Personal Hygiene</h2>
                <p className={styles.text}>
                  Every student must wear the prescribed school uniform in neat and tidy condition with polished shoes, school tie, and official identity card. Sports attire is required on designated PT and activity days.
                </p>
              </m.div>

              <m.div variants={varStaggerItem} className={styles.section}>
                <h2 className={styles.sectionTitle}>3. Code of Discipline & Mutual Respect</h2>
                <p className={styles.text}>
                  Glorious Public School strictly enforces zero-tolerance towards bullying, rough behavior, damage to school property, or disrespectful conduct towards teachers and peers. We nurture upright, ethical citizens of character and integrity.
                </p>
              </m.div>

              <m.div variants={varStaggerItem} className={styles.section}>
                <h2 className={styles.sectionTitle}>4. School Bus & Hostel Regulations</h2>
                <p className={styles.text}>
                  Students using the school transport fleet must maintain decorum on board, follow the instructions of the bus driver and lady attendants, and board/de-board only at allotted stops. Hostel residents must strictly adhere to study hours, meal timings, and hostel gate curfew rules.
                </p>
              </m.div>

              <m.div variants={varStaggerItem} className={styles.section}>
                <h2 className={styles.sectionTitle}>5. Fee Guidelines & Dues Clearance</h2>
                <p className={styles.text}>
                  Tuition, transport, and hostel fees must be deposited before the 10th of each calendar month. Progress reports and examination admit cards will be issued upon clearance of all outstanding dues.
                </p>
              </m.div>

              <m.div variants={varStaggerItem} style={{ marginTop: "36px", paddingTop: "24px", borderTop: "1px solid var(--border-color)" }}>
                <Link to="/" className="btn btn-primary">
                  <ArrowLeft size={16} />
                  <span>Return to Homepage</span>
                </Link>
              </m.div>
            </StaggerContainer>
          </div>
        </FadeUp>
      </section>
    </div>
  );
}
