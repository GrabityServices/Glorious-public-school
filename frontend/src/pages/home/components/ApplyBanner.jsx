import { Link } from "react-router-dom";
import { Award, ArrowRight, Phone, CheckCircle } from "lucide-react";
import styles from "./ApplyBanner.module.css";
import FadeUp from "@/components/motion/FadeUp";
import { SCHOOL_INFO } from "@/data/schoolData";

export default function ApplyBanner() {
  return (
    <section className={styles.section}>
      <div className={styles.container}>
        <div className={styles.bannerCard}>
          <div className={styles.cardContent}>
            <FadeUp>
              <span className={styles.subTag}>Admissions 2026 - 2027</span>
              <h2 className={styles.bannerTitle}>Apply Now for Your Kids</h2>
            </FadeUp>

            <FadeUp delay={0.1}>
              <p className={styles.bannerText}>
                Glorious is dedicated to create erudite, upright leaders of tomorrow's world. Glorious strives to develop an all-rounded personality in its students. The school nurtures the creative and independent thinking of every child, providing safe transport, boarding hostel, and experienced faculty from Nursery to Class 10th.
              </p>
            </FadeUp>

            <FadeUp delay={0.15}>
              <div className={styles.checklist}>
                <span className={styles.checkItem}><CheckCircle size={16} /> Online Simple Application</span>
                <span className={styles.checkItem}><CheckCircle size={16} /> Nursery to Class 10th</span>
                <span className={styles.checkItem}><CheckCircle size={16} /> Transport & Hostel Available</span>
                <span className={styles.checkItem}><CheckCircle size={16} /> Affordable Fee Structure</span>
              </div>
            </FadeUp>

            <FadeUp delay={0.2}>
              <div className={styles.btnGroup}>
                <Link to="/admissions" className="btn btn-gold">
                  <span>Apply Online Now</span>
                  <ArrowRight size={16} />
                </Link>
                <a href={`tel:${SCHOOL_INFO.phone}`} className="btn btn-outline" style={{ borderColor: "#ffffff", color: "#ffffff" }}>
                  <Phone size={16} />
                  <span>Call {SCHOOL_INFO.phone}</span>
                </a>
              </div>
            </FadeUp>
          </div>
        </div>
      </div>
    </section>
  );
}
