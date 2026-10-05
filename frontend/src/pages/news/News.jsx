import { useState, useRef } from "react";
import { Link } from "react-router-dom";
import {
  Bell,
  Calendar,
  User,
  FileText,
  ArrowRight,
  Sparkles,
  Phone,
  Mail,
  Download,
  Paperclip,
  Eye,
  Image as ImageIcon,
} from "lucide-react";
import styles from "./news.module.css";
import FadeUp from "@/components/motion/FadeUp";
import useDocumentTitle from "@/hooks/useDocumentTitle";
import { useData } from "@/context/DataContext";
import EmptyState from "@/components/common/EmptyState";

export default function NewsPage() {
  useDocumentTitle("News & Notice Board | Glorious Public School");
  const { notices } = useData();
  const [selectedNoticeId, setSelectedNoticeId] = useState(null);
  const readerRef = useRef(null);

  const activeNotice =
    notices.find((n) => n.id === selectedNoticeId) || notices[0] || null;

  const handleNoticeSelect = (id) => {
    setSelectedNoticeId(id);
    if (typeof window !== "undefined" && window.innerWidth <= 992 && readerRef.current) {
      readerRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  const getAttachmentUrl = (notice) => {
    return notice?.attachmentUrl || notice?.pdfUrl || "";
  };

  const isAttachmentPdf = (notice) => {
    const url = getAttachmentUrl(notice);
    return notice?.attachmentType === "pdf" || url.toLowerCase().endsWith(".pdf");
  };

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

      {/* Main Two-Column View or Empty State */}
      <section className={styles.section}>
        <div className={styles.container}>
          {notices.length > 0 ? (
            <div className={styles.grid}>
              {/* Notices List */}
              <div className={styles.listCol}>
                <h2 className={styles.colHeading}>Current Circulars</h2>
                <div className={styles.noticesList}>
                  {notices.map((notice) => {
                    const isSelected = activeNotice && activeNotice.id === notice.id;
                    const hasAttachment = Boolean(getAttachmentUrl(notice));
                    const isPdf = isAttachmentPdf(notice);
                    return (
                      <div
                        key={notice.id}
                        onClick={() => handleNoticeSelect(notice.id)}
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
                          {hasAttachment && (
                            <span className={styles.attachChip}>
                              <Paperclip size={10} />
                              <span>{isPdf ? "PDF Circular" : "Photo"}</span>
                            </span>
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
                  <div className={styles.readerBox} ref={readerRef}>
                    <div className={styles.readerHeader}>
                      <div className={styles.metaBadgeRow}>
                        <span className={styles.catTag}>{activeNotice.category}</span>
                        <span className={styles.dateRow}>
                          <Calendar size={14} /> {activeNotice.date}
                        </span>
                        <span className={styles.authorRow}>
                          <User size={14} /> By: {activeNotice.author}
                        </span>
                        {getAttachmentUrl(activeNotice) && (
                          <span className={styles.attachChip}>
                            <Paperclip size={11} />
                            <span>
                              {isAttachmentPdf(activeNotice) ? "PDF Document Attached" : "Photo Attached"}
                            </span>
                          </span>
                        )}
                      </div>
                      <h2>{activeNotice.title}</h2>
                    </div>

                    <div className={styles.readerBody}>
                      <p className={styles.summaryHighlight}>{activeNotice.summary}</p>
                      <p className={styles.fullContent}>{activeNotice.fullContent}</p>
                    </div>

                    {/* Official Attachment Preview & Download */}
                    {getAttachmentUrl(activeNotice) && (
                      <div className={styles.noticeAttachmentCard}>
                        <div className={styles.attachmentCardHeader}>
                          <span className={styles.attachmentCardTitle}>
                            <Paperclip size={16} color="#dc2626" />
                            <span>Official Notice Attachment</span>
                          </span>
                          <span className={styles.attachmentTypeTag}>
                            {isAttachmentPdf(activeNotice) ? "PDF Document" : "Official Notice Photo"}
                          </span>
                        </div>

                        {!isAttachmentPdf(activeNotice) ? (
                          <div className={styles.imagePreviewWrap}>
                            <img
                              src={getAttachmentUrl(activeNotice)}
                              alt={activeNotice.title}
                              className={styles.attachedImage}
                            />
                          </div>
                        ) : (
                          <div className={styles.pdfDocBanner}>
                            <div className={styles.pdfDocIconBox}>
                              <FileText size={28} color="#dc2626" />
                            </div>
                            <div className={styles.pdfDocInfo}>
                              <h4>
                                {activeNotice.attachmentName || `${activeNotice.title}.pdf`}
                              </h4>
                              <p>Official School Circular Document</p>
                            </div>
                          </div>
                        )}

                        <div className={styles.attachmentCardActions}>
                          <a
                            href={`/api/download?file=${encodeURIComponent(
                              getAttachmentUrl(activeNotice)
                            )}&name=${encodeURIComponent(
                              activeNotice.attachmentName ||
                                `${activeNotice.title}${isAttachmentPdf(activeNotice) ? ".pdf" : ".jpg"}`
                            )}`}
                            download={
                              activeNotice.attachmentName ||
                              `${activeNotice.title}${isAttachmentPdf(activeNotice) ? ".pdf" : ".jpg"}`
                            }
                            className={styles.downloadDocBtn}
                          >
                            <Download size={16} />
                            <span>
                              {isAttachmentPdf(activeNotice) ? "Download PDF" : "Download Photo"}
                            </span>
                          </a>

                          <a
                            href={getAttachmentUrl(activeNotice)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={styles.viewOnlineBtn}
                          >
                            <Eye size={16} />
                            <span>
                              {isAttachmentPdf(activeNotice) ? "Preview PDF" : "View Full Screen"}
                            </span>
                          </a>
                        </div>
                      </div>
                    )}

                    <div className={styles.readerFooter}>
                      <p>For inquiries regarding this circular, please contact the administrative desk:</p>
                      <div className={styles.contactFooter}>
                        <span style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}>
                          <Phone size={14} /> Helpline: 9534105012
                        </span>
                        <span style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}>
                          <Mail size={14} /> Email: gpsjhajha@gmail.com
                        </span>
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
          ) : (
            <FadeUp>
              <EmptyState
                icon={Bell}
                title="No Announcements Published"
                description="There are currently no active notices or announcements on the notice board. When new circulars are released by the school administration, they will appear here."
              />
            </FadeUp>
          )}
        </div>
      </section>
    </div>
  );
}
