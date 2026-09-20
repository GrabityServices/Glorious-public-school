import { Link } from "react-router-dom";
import { Calendar, MapPin, ArrowRight, Bell, Clock, ChevronRight } from "lucide-react";
import styles from "./NoticeEventsSection.module.css";
import FadeUp from "@/components/motion/FadeUp";
import { EVENTS_DATA } from "@/data/eventsData";
import { NEWS_NOTICES } from "@/data/newsData";
import { useData } from "@/context/DataContext";

export default function NoticeEventsSection() {
  const { notices: liveNotices, events: liveEvents } = useData();
  const displayEvents = liveEvents || EVENTS_DATA;
  const displayNotices = liveNotices || NEWS_NOTICES;

  return (
    <section className={styles.section}>
      <div className={styles.container}>
        <div className={styles.grid}>
          {/* Left Column: Latest Events */}
          <div className={styles.eventsCol}>
            <div className={styles.colHeader}>
              <div>
                <span className="section-subtitle">Calendar & Stages</span>
                <h2 className={styles.colTitle}>Latest Events</h2>
              </div>
              <Link to="/events" className={styles.viewAllLink}>
                <span>View All Events</span>
                <ArrowRight size={14} />
              </Link>
            </div>

            <div className={styles.eventsList}>
              {displayEvents.slice(0, 2).map((ev, i) => (
                <FadeUp key={ev.id} delay={0.1 * (i + 1)} fullHeight>
                  <div className={styles.eventCard}>
                    <div className={styles.dateBadge}>
                      <span className={styles.dateDays}>{ev.date.split(" ")[0]}</span>
                      <span className={styles.dateMonth}>{ev.date.split(" ").slice(1).join(" ")}</span>
                    </div>

                    <div className={styles.eventBody}>
                      <span className={styles.eventCat}>{ev.category}</span>
                      <h3 className={styles.eventTitle}>
                        <Link to={`/events/${ev.id}`}>{ev.title}</Link>
                      </h3>
                      <p className={styles.eventDesc}>{ev.shortDesc}</p>

                      <div className={styles.eventMeta}>
                        <span className={styles.metaItem}>
                          <MapPin size={14} /> {ev.venue}
                        </span>
                        <span className={styles.metaItem}>
                          <Clock size={14} /> {ev.time}
                        </span>
                      </div>
                    </div>
                  </div>
                </FadeUp>
              ))}
            </div>
          </div>

          {/* Right Column: Notice Board */}
          <div className={styles.noticesCol}>
            <div className={styles.colHeader}>
              <div>
                <span className="section-subtitle">Official Circulars</span>
                <h2 className={styles.colTitle}>Notice Board</h2>
              </div>
              <Link to="/news" className={styles.viewAllLink}>
                <span>View All Notices</span>
                <ArrowRight size={14} />
              </Link>
            </div>

            <div className={styles.noticeBoardCard}>
              <div className={styles.noticeBoardTop}>
                <Bell size={18} className={styles.bellIcon} />
                <span>Current Announcements & Circulars</span>
              </div>

              <div className={styles.noticesList} data-lenis-prevent="true">
                {displayNotices.slice(0, 4).map((notice, idx) => (
                  <div key={notice.id} className={styles.noticeItem}>
                    <div className={styles.noticeHeader}>
                      <span className={styles.noticeDate}>{notice.date}</span>
                      {notice.isImportant && (
                        <span className={styles.importantTag}>Important</span>
                      )}
                    </div>
                    <h4 className={styles.noticeHeading}>
                      <Link to="/news">{notice.title}</Link>
                    </h4>
                    <p className={styles.noticeSummary}>{notice.summary}</p>
                  </div>
                ))}
              </div>

              <div className={styles.noticeFooter}>
                <Link to="/admissions" className="btn btn-gold btn-sm" style={{ width: "100%" }}>
                  <span>Enroll for the New Academic Session</span>
                  <ChevronRight size={16} />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
