import { Phone, Mail, GraduationCap, User } from "lucide-react";
import { Link } from "react-router-dom";
import styles from "./TopHeader.module.css";
import { SCHOOL_INFO } from "@/data/schoolData";

export default function TopHeader() {
  return (
    <div className={styles.topBar}>
      <div className={styles.container}>
        {/* Contact info */}
        <div className={styles.contactGroup}>
          <a href={`tel:${SCHOOL_INFO.phone}`} className={styles.contactItem}>
            <Phone size={14} className={styles.icon} />
            <span>{SCHOOL_INFO.phone}</span>
          </a>
          <span className={styles.divider}>|</span>
          <a href={`mailto:${SCHOOL_INFO.email}`} className={styles.contactItem}>
            <Mail size={14} className={styles.icon} />
            <span>{SCHOOL_INFO.email}</span>
          </a>
        </div>

        {/* Marquee Ticker
        <div className={styles.tickerWrapper}>
          <div className={styles.tickerContent}>
            <span className={styles.tickerBadge}>ADMISSION OPEN</span>
            <span className={styles.tickerText}>
               Admissions are going on for Nursery to Class 10th (Session 2026-2027). Enroll your child today!
            </span>
          </div>
        </div> */}

        {/* Quick Action Links */}
        <div className={styles.actionGroup}>
          <Link to="/admissions" className={styles.actionLink}>
            <GraduationCap size={14} />
            <span>Online Admission</span>
          </Link>
          <span className={styles.divider}>|</span>
          <Link to="/login" className={styles.actionLink}>
            <User size={14} />
            <span>Student / Parent Login</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
