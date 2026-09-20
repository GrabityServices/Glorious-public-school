import { useState } from "react";
import { Link } from "react-router-dom";
import { Bell, Calendar, User, FileText, ArrowRight, Sparkles, Phone, Mail } from "lucide-react";
import styles from "./news.module.css";
import FadeUp from "@/components/motion/FadeUp";
import useDocumentTitle from "@/hooks/useDocumentTitle";
import { useData } from "@/context/DataContext";

export default function NewsPage() {
  useDocumentTitle("News & Notice Board | Glorious Public School");
  const { notices } = useData();
  const [selectedNoticeId, setSelectedNoticeId] = useState(null);

  const activeNotice =
    notices.find((n) => n.id === selectedNoticeId) || notices[0] || null;

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
                {notices.map((notice) => {
                  const isSelected = activeNotice && activeNotice.id === notice.id;
                  return (
                    <div
                      key={notice.id}
                      onClick={() => setSelectedNoticeId(notice.id)}
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
              {activeNotice ? (
                <div className={styles.readerBox}>
                  <div className={styles.readerHeader}>
                    <div className={styles.metaBadgeRow}>
                      <span className={styles.catTag}>{activeNotice.category}</span>
                      <span className={styles.dateRow}>
                        <Calendar size={14} /> {activeNotice.date}
                      </span>
                      <span className={styles.authorRow}>
                        <User size={14} /> By: {activeNotice.author}
                      </span>
                    </div>
                    <h2>{activeNotice.title}</h2>
                  </div>

                  <div className={styles.readerBody}>
                    <p className={styles.summaryHighlight}>{activeNotice.summary}</p>
                    <p className={styles.fullContent}>{activeNotice.fullContent}</p>
                  </div>

                  <div className={styles.readerFooter}>
                    <p>For inquiries regarding this circular, please contact the administrative desk:</p>
                    <div className={styles.contactFooter}>
                      <span style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}><Phone size={14} /> Helpline: 9534105012</span>
                      <span style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}><Mail size={14} /> Email: gpsjhajha@gmail.com</span>
                    </div>
                    <Link to="/admissions" className="btn btn-gold btn-sm" style={{ marginTop: "14px" }}>
                      <span>Online Admission Open &rarr;</span>
                    </Link>
                  </div>
                </div>
              ) : (
                <div className={styles.readerBox} style={{ textAlign: "center", padding: "60px 20px" }}>
                  <p style={{ color: "#94a3b8" }}>No circulars currently published.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
