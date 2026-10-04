import { Link } from "react-router-dom";
import { Award, ArrowRight, Phone, CheckCircle } from "lucide-react";
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
          <div className={styles.cardContent}>
            <FadeUp>
              <span className={styles.subTag}>
                {isAdmissionsOpen
                  ? `Admissions ${getAcademicSession()}`
                  : `Session ${getAcademicSession()} • Excellence in Education`}
              </span>
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
                  <CheckCircle size={16} /> {isAdmissionsOpen ? "Online Simple Application" : "Comprehensive CBSE Curriculum"}
                </span>
                <span className={styles.checkItem}><CheckCircle size={16} /> Qualified & Caring Teachers</span>
                <span className={styles.checkItem}><CheckCircle size={16} /> Transport & Hostel Available</span>
                <span className={styles.checkItem}><CheckCircle size={16} /> Affordable Fee Structure</span>
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
                <a href={`tel:${phone}`} className="btn btn-outline" style={{ borderColor: "#ffffff", color: "#ffffff" }}>
                  <Phone size={16} />
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
