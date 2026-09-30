import { useEffect, useRef, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import { Calendar, MapPin, ArrowRight, Bell, Clock, ChevronRight, FileText, Image as ImageIcon } from "lucide-react";
import Lenis from "lenis";
import styles from "./NoticeEventsSection.module.css";
import FadeUp from "@/components/motion/FadeUp";
import { useData } from "@/context/DataContext";
import EmptyState from "@/components/common/EmptyState";

export default function NoticeEventsSection() {
  const { notices, events } = useData();
  const displayEvents = events || [];
  const displayNotices = notices || [];

  const listRef = useRef(null);
  const contentRef = useRef(null);
  const railRef = useRef(null);

  const [thumbHeight, setThumbHeight] = useState(52);
  const [thumbTop, setThumbTop] = useState(0);
  const [hasOverflow, setHasOverflow] = useState(true);
  const [isDragging, setIsDragging] = useState(false);
  const dragStartY = useRef(0);
  const dragStartScrollTop = useRef(0);

  // Sync thumb size and position based on list scroll
  const updateThumb = useCallback(() => {
    const list = listRef.current;
    if (!list) return;

    const clientHeight = list.clientHeight;
    const scrollHeight = list.scrollHeight;
    const rail = railRef.current;
    const railHeight =
      rail && rail.clientHeight > 0 ? rail.clientHeight : Math.max(clientHeight - 24, 80);

    const hasScroll = scrollHeight > clientHeight + 4;
    setHasOverflow(hasScroll);

    const calculatedThumbHeight = Math.max(
      Math.round((clientHeight / Math.max(scrollHeight, 1)) * railHeight),
      44
    );
    setThumbHeight(calculatedThumbHeight);

    const maxScroll = Math.max(scrollHeight - clientHeight, 1);
    const maxThumbTravel = Math.max(railHeight - calculatedThumbHeight, 1);
    const currentScrollRatio = Math.min(Math.max(list.scrollTop / maxScroll, 0), 1);
    setThumbTop(currentScrollRatio * maxThumbTravel);
  }, []);

  // Initialize nested Lenis for smooth inertia scrolling
  useEffect(() => {
    if (!listRef.current || !contentRef.current) return;

    const innerLenis = new Lenis({
      wrapper: listRef.current,
      content: contentRef.current,
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: "vertical",
      gestureOrientation: "vertical",
      smoothWheel: true,
      wheelMultiplier: 1.0,
      touchMultiplier: 1.5,
    });

    innerLenis.on("scroll", updateThumb);

    let animId;
    function raf(time) {
      innerLenis.raf(time);
      animId = requestAnimationFrame(raf);
    }
    animId = requestAnimationFrame(raf);

    // Resize observer to update thumb whenever content or list resizes
    const ro = new ResizeObserver(() => {
      innerLenis.resize();
      updateThumb();
    });

    if (listRef.current) ro.observe(listRef.current);
    if (contentRef.current) ro.observe(contentRef.current);

    return () => {
      cancelAnimationFrame(animId);
      ro.disconnect();
      innerLenis.destroy();
    };
  }, [displayNotices, updateThumb]);

  // Initial calculation
  useEffect(() => {
    updateThumb();
  }, [displayNotices, updateThumb]);

  // Handle thumb dragging
  const handleThumbMouseDown = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
    dragStartY.current = e.clientY;
    dragStartScrollTop.current = listRef.current ? listRef.current.scrollTop : 0;
  };

  useEffect(() => {
    if (!isDragging) return;

    const handleMouseMove = (e) => {
      const list = listRef.current;
      const rail = railRef.current;
      if (!list || !rail) return;

      const deltaY = e.clientY - dragStartY.current;
      const railHeight = rail.clientHeight;
      const maxThumbTravel = railHeight - thumbHeight;
      const maxScroll = list.scrollHeight - list.clientHeight;

      if (maxThumbTravel > 0) {
        const scrollDelta = (deltaY / maxThumbTravel) * maxScroll;
        list.scrollTop = dragStartScrollTop.current + scrollDelta;
      }
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isDragging, thumbHeight]);

  // Click on rail track to smoothly jump to that scroll position
  const handleRailClick = (e) => {
    if (e.target.closest(`.${styles.modernScrollThumb}`)) return;
    const rail = railRef.current;
    const list = listRef.current;
    if (!rail || !list) return;

    const rect = rail.getBoundingClientRect();
    const clickY = e.clientY - rect.top;
    const railHeight = rail.clientHeight;
    const targetRatio = Math.min(
      Math.max((clickY - thumbHeight / 2) / (railHeight - thumbHeight), 0),
      1
    );
    const maxScroll = list.scrollHeight - list.clientHeight;

    list.scrollTo({
      top: targetRatio * maxScroll,
      behavior: "smooth",
    });
  };

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

            {displayEvents.length > 0 ? (
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
            ) : (
              <EmptyState
                icon={Calendar}
                title="No Upcoming Events"
                description="New school events and competitions will be scheduled and displayed here."
                compact
              />
            )}
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

              <div className={styles.noticesWrapper}>
                {displayNotices.length > 0 ? (
                  <>
                    <div
                      ref={listRef}
                      className={styles.noticesList}
                      data-lenis-prevent="true"
                      onScroll={updateThumb}
                    >
                      <div ref={contentRef} className={styles.noticesInner}>
                        {displayNotices.map((notice, idx) => (
                          <div key={notice.id || notice._id || idx} className={styles.noticeItem}>
                            <div className={styles.noticeHeader}>
                              <div className={styles.noticeHeaderLeft}>
                                <span className={styles.noticeDate}>{notice.date}</span>
                                {notice.attachmentUrl && (
                                  <span
                                    className={styles.attachmentBadge}
                                    title={notice.attachmentName || "Attachment available"}
                                  >
                                    {notice.attachmentType === "pdf" ? (
                                      <>
                                        <FileText size={11} className={styles.attachIcon} /> PDF
                                      </>
                                    ) : (
                                      <>
                                        <ImageIcon size={11} className={styles.attachIcon} /> Image
                                      </>
                                    )}
                                  </span>
                                )}
                              </div>
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
                    </div>

                    {/* Modern Custom Floating Scrollbar */}
                    <div
                      ref={railRef}
                      className={`${styles.modernScrollRail} ${isDragging ? styles.railActive : ""} ${!hasOverflow ? styles.railHidden : ""}`}
                      onClick={handleRailClick}
                      title="Drag or click to scroll announcements"
                    >
                      <div
                        className={`${styles.modernScrollThumb} ${isDragging ? styles.isDragging : ""}`}
                        style={{
                          height: `${thumbHeight}px`,
                          transform: `translateY(${thumbTop}px)`,
                        }}
                        onMouseDown={handleThumbMouseDown}
                      >
                        <span className={styles.thumbGripLines} />
                      </div>
                    </div>
                  </>
                ) : (
                  <div style={{ padding: "32px 16px" }}>
                    <EmptyState
                      icon={Bell}
                      title="Notice Board Clear"
                      description="No circulars or notices published at this moment."
                      compact
                    />
                  </div>
                )}
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
