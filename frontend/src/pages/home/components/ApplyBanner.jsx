import { Link } from "react-router-dom";
import { ArrowRight, Phone, CheckCircle } from "lucide-react";
import styles from "./ApplyBanner.module.css";
import FadeUp from "@/components/motion/FadeUp";
import { useData } from "@/context/DataContext";
import { getAcademicSession } from "@/utils/academicYear";
import { SCHOOL_INFO } from "@/data/schoolData";

export default function ApplyBanner() {
  const { schoolInfo } = useData();
  const isAdmissionsOpen = schoolInfo?.isAdmissionsOpen !== false;
  const phone = schoolInfo?.phone || SCHOOL_INFO.phone;

  return (
    <section className={styles.section}>
      <div className={styles.container}>
        <div className={styles.bannerCard}>
          {/* Subtle Ambient Red Glow & Academic Crest Watermark in Background */}
          <div className={styles.ambientGlow} aria-hidden="true" />
          <div className={styles.watermarkEmblem} aria-hidden="true">
            <svg viewBox="0 0 240 240" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="120" cy="120" r="105" stroke="currentColor" strokeWidth="1.5" strokeDasharray="5 5" />
              <circle cx="120" cy="120" r="92" stroke="currentColor" strokeWidth="1.2" />
              <path d="M120 38 L172 62 V122 C172 158 149 189 120 202 C91 189 68 158 68 122 V62 L120 38 Z" stroke="currentColor" strokeWidth="2" />
              <path d="M120 134 C111 127 96 125 85 127 V160 C96 158 111 160 120 167 C129 160 144 158 155 160 V127 C144 125 129 127 120 134 Z" stroke="currentColor" strokeWidth="1.6" />
              <path d="M120 134 V167" stroke="currentColor" strokeWidth="1.6" />
              <polygon points="120,74 124,86 136,86 126,94 130,106 120,98 110,106 114,94 104,86 116,86" fill="currentColor" opacity="0.75" />
            </svg>
          </div>

          <div className={styles.cardContent}>
            <FadeUp>
              <div className={styles.subTagWrapper}>
                <span className={styles.subTag}>
                  <span className={styles.subTagDot} />
                  {isAdmissionsOpen
                    ? `Admissions Open • Session ${getAcademicSession()}`
                    : `Session ${getAcademicSession()} • Excellence in Education`}
                </span>
              </div>
              <h2 className={styles.bannerTitle}>
                {isAdmissionsOpen ? "Apply Now for Your Kids" : "Shape Your Child's Future with Glorious"}
              </h2>
            </FadeUp>

            <FadeUp delay={0.1}>
              <p className={styles.bannerText}>
                Glorious is dedicated to create erudite, upright leaders of tomorrow's world. Glorious strives to develop an all-rounded personality in its students. The school nurtures the creative and independent thinking of every child, providing safe transport, boarding hostel, and experienced faculty with individual student care.
              </p>
            </FadeUp>

            <FadeUp delay={0.15}>
              <div className={styles.checklist}>
                <span className={styles.checkItem}>
                  <CheckCircle size={16} className={styles.checkIcon} />
                  <span>{isAdmissionsOpen ? "Online Simple Application" : "Comprehensive CBSE Curriculum"}</span>
                </span>
                <span className={styles.checkItem}>
                  <CheckCircle size={16} className={styles.checkIcon} />
                  <span>Qualified & Caring Teachers</span>
                </span>
                <span className={styles.checkItem}>
                  <CheckCircle size={16} className={styles.checkIcon} />
                  <span>Transport & Hostel Available</span>
                </span>
                <span className={styles.checkItem}>
                  <CheckCircle size={16} className={styles.checkIcon} />
                  <span>Affordable Fee Structure</span>
                </span>
              </div>
            </FadeUp>

            <FadeUp delay={0.2}>
              <div className={styles.btnGroup}>
                {isAdmissionsOpen ? (
                  <Link to="/admissions" className="btn btn-gold">
                    <span>Apply Online Now</span>
                    <ArrowRight size={18} strokeWidth={2.2} />
                  </Link>
                ) : (
                  <Link to="/contact" className="btn btn-gold">
                    <span>Contact School Desk</span>
                    <ArrowRight size={18} strokeWidth={2.2} />
                  </Link>
                )}
                <a
                  href={`tel:${phone}`}
                  className={styles.callBtn}
                >
                  <Phone size={15} className={styles.phoneIcon} />
                  <span>Call {phone}</span>
                </a>
              </div>
            </FadeUp>
          </div>
        </div>
      </div>
    </section>
  );
}
