import { m } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowLeft, ShieldCheck } from "lucide-react";
import styles from "./privacy.module.css";
import FadeUp from "@/components/motion/FadeUp";
import StaggerContainer from "@/components/motion/StaggerContainer";
import { varStaggerItem } from "@/lib/motion/stagger";
import useDocumentTitle from "@/hooks/useDocumentTitle";
import { SCHOOL_INFO } from "@/data/schoolData";

export default function PrivacyPage() {
  useDocumentTitle("Privacy & Student Records Policy | Glorious Public School");

  return (
    <div className={styles.pageWrapper}>
      {/* Hero Header */}
      <section className={styles.heroHeader}>
        <div className={styles.container}>
          <FadeUp>
            <span className="section-subtitle">Student Data Protection</span>
            <h1>Privacy & Student Records Policy</h1>
          </FadeUp>
          <FadeUp delay={0.15}>
            <p className={styles.subtitle}>
              How Glorious Public School protects student information, academic records, and parent communication data.
            </p>
          </FadeUp>
        </div>
      </section>

      {/* Policy Details Container */}
      <section className={styles.container}>
        <FadeUp delay={0.25}>
          <div className={styles.contentBox}>
            <span className={styles.lastUpdated}>Academic Session 2026 - 2027</span>

            <StaggerContainer staggerVal={0.1}>
              <m.div variants={varStaggerItem} className={styles.section}>
                <h2 className={styles.sectionTitle}>1. Commitment to Student Privacy</h2>
                <p className={styles.text}>
                  Glorious Public School ("we," "our," or "the School") recognizes the sensitive nature of student admission records, grades, and parent contact information. This Privacy Policy governs the management, confidentiality, and security of data submitted via our website and school administration office.
                </p>
              </m.div>

              <m.div variants={varStaggerItem} className={styles.section}>
                <h2 className={styles.sectionTitle}>2. Information Collected</h2>
                <p className={styles.text}>
                  During admission applications, online inquiry submissions, and student portal logins, we collect:
                </p>
                <ul className={styles.list}>
                  <li className={styles.listItem}>
                    <strong>Student Information:</strong> Full name, date of birth, gender, previous school details, and academic performance history.
                  </li>
                  <li className={styles.listItem}>
                    <strong>Parent / Guardian Information:</strong> Names, contact phone numbers, email addresses, and residential addresses in Jhajha, Jamui, and surrounding areas.
                  </li>
                  <li className={styles.listItem}>
                    <strong>Transportation & Hostel Logistics:</strong> Bus stops, pickup coordinates, hostel room allocations, and emergency guardian contacts.
                  </li>
                </ul>
              </m.div>

              <m.div variants={varStaggerItem} className={styles.section}>
                <h2 className={styles.sectionTitle}>3. Use of Information</h2>
                <p className={styles.text}>
                  Student data is exclusively utilized for educational and administrative purposes:
                </p>
                <ul className={styles.list}>
                  <li className={styles.listItem}>Processing student admission applications from Nursery to Class 10th.</li>
                  <li className={styles.listItem}>Maintaining official school attendance registers and examination grade books.</li>
                  <li className={styles.listItem}>Sending SMS alerts regarding emergency school closures, holiday notifications, and bus routes.</li>
                  <li className={styles.listItem}>Complying with statutory board examination registration requirements.</li>
                </ul>
              </m.div>

              <m.div variants={varStaggerItem} className={styles.section}>
                <h2 className={styles.sectionTitle}>4. Contact School Office</h2>
                <p className={styles.text}>
                  For queries regarding student records or updating parent contact numbers:
                </p>
                <p className={styles.text}>
                  📍 Address: {SCHOOL_INFO.address}<br />
                  📞 Phone: <strong>{SCHOOL_INFO.phone}</strong><br />
                  ✉️ Email: <strong>{SCHOOL_INFO.email}</strong>
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
