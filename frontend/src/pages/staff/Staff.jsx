import { useState } from "react";
import { Link } from "react-router-dom";
import { GraduationCap, Award, Mail, Phone, BookOpen } from "lucide-react";
import styles from "./staff.module.css";
import FadeUp from "@/components/motion/FadeUp";
import Image from "@/components/common/Image";
import useDocumentTitle from "@/hooks/useDocumentTitle";
import { SCHOOL_INFO } from "@/data/schoolData";
import { useData } from "@/context/DataContext";

export default function StaffPage() {
  useDocumentTitle("Our Teachers & Staff | Glorious Public School");
  const { staff } = useData();
  const [filterWing, setFilterWing] = useState("All");

  const wings = ["All", "Administration", "Secondary", "Primary", "Pre-Primary", "Sports"];

  const filteredStaff =
    filterWing === "All"
      ? staff
      : staff.filter((s) => s.wing === filterWing);

  return (
    <div className={styles.pageWrapper}>
      {/* Hero Header */}
      <section className={styles.heroHeader}>
        <div className={styles.container}>
          <FadeUp>
            <span className="section-subtitle">Dedicated Mentors</span>
            <h1 className={styles.title}>Our Faculty & Administrative Staff</h1>
            <p className={styles.subtitle}>
              Meet the 18+ qualified, compassionate educators shaping the character, intellectual curiosity, and discipline of our students from Nursery to Class 10th.
            </p>
          </FadeUp>
        </div>
      </section>

      {/* Staff Directory */}
      <section className={styles.section}>
        <div className={styles.container}>
          {/* Wings Filter */}
          <div className={styles.filterTabs}>
            {wings.map((w) => (
              <button
                key={w}
                onClick={() => setFilterWing(w)}
                className={`${styles.tabBtn} ${
                  filterWing === w ? styles.tabBtnActive : ""
                }`}
              >
                {w}
              </button>
            ))}
          </div>

          <div className={styles.staffGrid}>
            {filteredStaff.map((member, idx) => (
              <FadeUp key={member.id} delay={0.08 * (idx + 1)}>
                <div className={styles.staffCard}>
                  <div className={styles.imageWrap}>
                    <Image
                      src={member.image}
                      alt={member.name}
                      className={styles.avatarImg}
                    />
                    <span className={styles.wingTag}>{member.wing}</span>
                  </div>

                  <div className={styles.cardContent}>
                    <h2 className={styles.memberName}>{member.name}</h2>
                    <p className={styles.memberRole}>{member.role}</p>

                    <div className={styles.metaBox}>
                      <span className={styles.qual}>{member.qualification}</span>
                      <span className={styles.exp}>{member.experience}</span>
                    </div>

                    <p className={styles.memberBio}>{member.bio}</p>
                  </div>
                </div>
              </FadeUp>
            ))}
          </div>
        </div>
      </section>

      {/* Teacher Recruitment Banner */}
      <section className={styles.recruitSection}>
        <div className={styles.container}>
          <div className={styles.recruitCard}>
            <h3>Passionate about teaching and shaping future leaders?</h3>
            <p>
              Glorious Public School regularly invites applications from qualified, B.Ed. certified educators in English, Mathematics, Science, and Pre-Primary training.
            </p>
            <a href={`mailto:${SCHOOL_INFO.email}`} className="btn btn-gold">
              <span>Send CV to {SCHOOL_INFO.email}</span>
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
