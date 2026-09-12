import { useState } from "react";
import { Link } from "react-router-dom";
import { Bell, Calendar, User, FileText, ArrowRight, Sparkles } from "lucide-react";
import styles from "./news.module.css";
import FadeUp from "@/components/motion/FadeUp";
import useDocumentTitle from "@/hooks/useDocumentTitle";
import { NEWS_NOTICES } from "@/data/newsData";

export default function NewsPage() {
  useDocumentTitle("News & Notice Board | Glorious Public School");
  const [selectedNotice, setSelectedNotice] = useState(NEWS_NOTICES[0]);

  return (
    <div className={styles.pageWrapper}>
      {/* Hero Header */}
      <section className={styles.heroHeader}>
        <div className={styles.container}>
          <FadeUp>
            <span className="section-subtitle">Official Announcements</span>
            <h1 className={styles.title}>School News & Notice Board</h1>
            <p className={styles.subtitle}>
              Stay informed with the latest updates on admissions, examination timetables, holiday schedules, and academic circulars.
            </p>
          </FadeUp>
        </div>
      </section>

      {/* Main Two-Column View */}
      <section className={styles.section}>
        <div className={styles.container}>
          <div className={styles.grid}>
            {/* Notices List */}
            <div className={styles.listCol}>
              <h2 className={styles.colHeading}>Current Circulars</h2>
              <div className={styles.noticesList}>
                {NEWS_NOTICES.map((notice) => {
                  const isSelected = selectedNotice.id === notice.id;
                  return (
                    <div
                      key={notice.id}
                      onClick={() => setSelectedNotice(notice)}
                      className={`${styles.noticeCard} ${
                        isSelected ? styles.selectedCard : ""
                      }`}
                    >
                      <div className={styles.cardMeta}>
                        <span className={styles.dateTag}>{notice.date}</span>
                        <span className={styles.catTag}>{notice.category}</span>
                        {notice.isImportant && (
                          <span className={styles.importantTag}>Important</span>
                        )}
                      </div>
                      <h3 className={styles.cardTitle}>{notice.title}</h3>
                      <p className={styles.cardSummary}>{notice.summary}</p>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Selected Notice Reader */}
            <div className={styles.detailCol}>
              <div className={styles.readerBox}>
                <div className={styles.readerHeader}>
                  <div className={styles.metaBadgeRow}>
                    <span className={styles.catTag}>{selectedNotice.category}</span>
                    <span className={styles.dateRow}>
                      <Calendar size={14} /> {selectedNotice.date}
                    </span>
                    <span className={styles.authorRow}>
                      <User size={14} /> By: {selectedNotice.author}
                    </span>
                  </div>
                  <h2>{selectedNotice.title}</h2>
                </div>

                <div className={styles.readerBody}>
                  <p className={styles.summaryHighlight}>{selectedNotice.summary}</p>
                  <p className={styles.fullContent}>{selectedNotice.fullContent}</p>
                </div>

                <div className={styles.readerFooter}>
                  <p>For inquiries regarding this circular, please contact the administrative desk:</p>
                  <div className={styles.contactFooter}>
                    <span>📞 Helpline: 9534105012</span>
                    <span>✉️ Email: gpsjhajha@gmail.com</span>
                  </div>
                  <Link to="/admissions" className="btn btn-gold btn-sm" style={{ marginTop: "14px" }}>
                    <span>Online Admission Open &rarr;</span>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
