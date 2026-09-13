import { useState, useMemo } from "react";
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Clock,
  MapPin,
  Users,
  X,
  Sparkles,
  Printer,
  CalendarCheck2,
  GraduationCap,
  Info,
} from "lucide-react";
import { AnimatePresence, m } from "framer-motion";
import styles from "./calendar.module.css";
import FadeUp from "@/components/motion/FadeUp";
import useDocumentTitle from "@/hooks/useDocumentTitle";
import {
  ACADEMIC_MONTHS,
  CALENDAR_CATEGORIES,
  SCHOOL_CALENDAR_EVENTS,
} from "@/data/calendarData";

export default function CalendarPage() {
  useDocumentTitle("School Calendar (2026-2027) | Glorious Public School");

  const [currentMonthIndex, setCurrentMonthIndex] = useState(0); // 0 = April 2026
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedEvent, setSelectedEvent] = useState(null);

  const activeMonthObj = ACADEMIC_MONTHS[currentMonthIndex];

  const handlePrevMonth = () => {
    setCurrentMonthIndex((prev) => (prev > 0 ? prev - 1 : ACADEMIC_MONTHS.length - 1));
  };

  const handleNextMonth = () => {
    setCurrentMonthIndex((prev) => (prev < ACADEMIC_MONTHS.length - 1 ? prev + 1 : 0));
  };

  // Filter events by selected category and active month
  const monthEvents = useMemo(() => {
    return SCHOOL_CALENDAR_EVENTS.filter((ev) => {
      const matchesMonth =
        ev.month === activeMonthObj.index && ev.year === activeMonthObj.year;
      const matchesCategory =
        selectedCategory === "all" || ev.category === selectedCategory;
      return matchesMonth && matchesCategory;
    });
  }, [activeMonthObj, selectedCategory]);

  // Generate day cells for the calendar matrix
  const calendarCells = useMemo(() => {
    const year = activeMonthObj.year;
    const month = activeMonthObj.index;
    const firstDayIndex = new Date(year, month, 1).getDay();
    // In JS: Sunday = 0, Monday = 1, ... Saturday = 6
    // We want Monday as start of week: 0 = Mon, ..., 6 = Sun
    const startDayOffset = (firstDayIndex + 6) % 7;
    const totalDaysInMonth = new Date(year, month + 1, 0).getDate();

    const cells = [];

    // Empty lead cells
    for (let i = 0; i < startDayOffset; i++) {
      cells.push({ isBlank: true, id: `blank-${i}` });
    }

    // Days of current month
    for (let day = 1; day <= totalDaysInMonth; day++) {
      const cellDate = new Date(year, month, day);
      const isSunday = cellDate.getDay() === 0;

      // Find events on this day
      const dayEvents = SCHOOL_CALENDAR_EVENTS.filter((ev) => {
        const matchesDate =
          ev.month === month &&
          ev.year === year &&
          (ev.day === day ||
            (ev.endDay && day >= ev.day && day <= ev.endDay));
        const matchesCategory =
          selectedCategory === "all" || ev.category === selectedCategory;
        return matchesDate && matchesCategory;
      });

      cells.push({
        isBlank: false,
        day,
        isSunday,
        events: dayEvents,
        id: `day-${day}`,
      });
    }

    return cells;
  }, [activeMonthObj, selectedCategory]);

  const categoryColorMap = {
    holiday: { bg: "#fee2e2", text: "#991b1b", border: "#fca5a5" },
    exam: { bg: "#dbeafe", text: "#1e40af", border: "#93c5fd" },
    celebration: { bg: "#d1fae5", text: "#065f46", border: "#6ee7b7" },
    ptm: { bg: "#fef3c7", text: "#92400e", border: "#fcd34d" },
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className={styles.pageWrapper}>
      {/* Hero Header */}
      <section className={styles.heroHeader}>
        <div className={styles.container}>
          <FadeUp>
            <div className={styles.sessionBadge}>
              <CalendarCheck2 size={16} />
              <span>Academic Session 2026 - 2027</span>
            </div>
            <h1 className={styles.title}>School Academic Calendar</h1>
            <p className={styles.subtitle}>
              Keep track of key academic milestones, examination schedules, festival holidays, sports meets, and parent-teacher meetings for Glorious Public School, Jhajha.
            </p>
          </FadeUp>

          <FadeUp delay={0.15}>
            <div className={styles.heroActions}>
              <button
                type="button"
                onClick={() => setCurrentMonthIndex(0)}
                className="btn btn-gold btn-sm"
              >
                <CalendarIcon size={15} />
                <span>Session Opening (April 2026)</span>
              </button>
              <button
                type="button"
                onClick={handlePrint}
                className="btn btn-secondary btn-sm"
              >
                <Printer size={15} />
                <span>Print Monthly Calendar</span>
              </button>
            </div>
          </FadeUp>
        </div>
      </section>

      {/* Main Calendar Workspace */}
      <section className={styles.calendarSection}>
        <div className={styles.container}>
          {/* Category Filter Tabs */}
          <div className={styles.filterBar}>
            <span className={styles.filterLabel}>Filter by Category:</span>
            <div className={styles.categoryPills}>
              {CALENDAR_CATEGORIES.map((cat) => {
                const isActive = selectedCategory === cat.id;
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setSelectedCategory(cat.id)}
                    className={`${styles.filterPill} ${isActive ? styles.activeFilterPill : ""}`}
                  >
                    <span>{cat.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Month Jump Carousel Bar */}
          <div className={styles.monthSelectorBar}>
            <div className={styles.monthScroll}>
              {ACADEMIC_MONTHS.map((mObj, idx) => (
                <button
                  key={mObj.fullName}
                  type="button"
                  onClick={() => setCurrentMonthIndex(idx)}
                  className={`${styles.monthTab} ${idx === currentMonthIndex ? styles.activeMonthTab : ""}`}
                >
                  <span>{mObj.name}</span>
                  <small>{mObj.year}</small>
                </button>
              ))}
            </div>
          </div>

          {/* Calendar Header Navigator */}
          <div className={styles.calendarCard}>
            <div className={styles.cardNavHeader}>
              <button
                type="button"
                onClick={handlePrevMonth}
                className={styles.navArrowBtn}
                aria-label="Previous month"
              >
                <ChevronLeft size={20} />
              </button>

              <div className={styles.currentMonthTitle}>
                <h2>{activeMonthObj.fullName}</h2>
                <span className={styles.eventsCountBadge}>
                  {monthEvents.length} {monthEvents.length === 1 ? "Event" : "Events"} Scheduled
                </span>
              </div>

              <button
                type="button"
                onClick={handleNextMonth}
                className={styles.navArrowBtn}
                aria-label="Next month"
              >
                <ChevronRight size={20} />
              </button>
            </div>

            {/* Weekdays Header */}
            <div className={styles.weekdaysGrid}>
              <span>Mon</span>
              <span>Tue</span>
              <span>Wed</span>
              <span>Thu</span>
              <span>Fri</span>
              <span>Sat</span>
              <span className={styles.sundayCol}>Sun</span>
            </div>

            {/* Day Matrix */}
            <div className={styles.matrixGrid}>
              {calendarCells.map((cell) => {
                if (cell.isBlank) {
                  return <div key={cell.id} className={styles.blankCell} />;
                }

                const hasEvents = cell.events && cell.events.length > 0;

                return (
                  <div
                    key={cell.id}
                    className={`${styles.dayCell} ${cell.isSunday ? styles.sundayCell : ""} ${hasEvents ? styles.hasEventsCell : ""}`}
                    onClick={() => {
                      if (hasEvents) {
                        setSelectedEvent(cell.events[0]);
                      }
                    }}
                  >
                    <div className={styles.cellHeader}>
                      <span className={styles.dayNumber}>{cell.day}</span>
                      {cell.isSunday && (
                        <span className={styles.sundayTag}>Holiday</span>
                      )}
                    </div>

                    <div className={styles.eventsStack}>
                      {cell.events.map((ev) => {
                        const styleInfo = categoryColorMap[ev.category] || {
                          bg: "#f1f5f9",
                          text: "#0f172a",
                          border: "#cbd5e1",
                        };

                        return (
                          <div
                            key={ev.id}
                            className={styles.eventPill}
                            style={{
                              backgroundColor: styleInfo.bg,
                              color: styleInfo.text,
                              borderColor: styleInfo.border,
                            }}
                            title={`${ev.title} (${ev.categoryLabel})`}
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedEvent(ev);
                            }}
                          >
                            <span className={styles.eventDot} />
                            <span className={styles.pillText}>{ev.title}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Month Agenda Listing */}
          <div className={styles.agendaSection}>
            <div className={styles.agendaHeader}>
              <CalendarIcon size={20} className={styles.agendaIcon} />
              <h3>Events & Schedules for {activeMonthObj.fullName}</h3>
            </div>

            {monthEvents.length === 0 ? (
              <div className={styles.emptyAgenda}>
                <Info size={24} />
                <p>No special scheduled events or holidays in this category for {activeMonthObj.fullName}. Regular classes continue as per standard school routine.</p>
              </div>
            ) : (
              <div className={styles.agendaGrid}>
                {monthEvents.map((ev) => {
                  const styleInfo = categoryColorMap[ev.category] || {
                    bg: "#f1f5f9",
                    text: "#0f172a",
                    border: "#cbd5e1",
                  };

                  return (
                    <div
                      key={ev.id}
                      className={styles.agendaCard}
                      onClick={() => setSelectedEvent(ev)}
                    >
                      <div className={styles.agendaCardTop}>
                        <span
                          className={styles.catBadge}
                          style={{
                            backgroundColor: styleInfo.bg,
                            color: styleInfo.text,
                            borderColor: styleInfo.border,
                          }}
                        >
                          {ev.categoryLabel}
                        </span>
                        <span className={styles.agendaDateText}>{ev.date}</span>
                      </div>

                      <h4 className={styles.agendaTitle}>{ev.title}</h4>
                      <p className={styles.agendaDesc}>{ev.description}</p>

                      <div className={styles.agendaMeta}>
                        <span className={styles.metaItem}>
                          <Clock size={14} /> {ev.time}
                        </span>
                        <span className={styles.metaItem}>
                          <Users size={14} /> {ev.grades}
                        </span>
                        <span className={styles.metaItem}>
                          <MapPin size={14} /> {ev.venue}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Interactive Event Detail Modal */}
      <AnimatePresence>
        {selectedEvent && (
          <div className={styles.modalOverlay} onClick={() => setSelectedEvent(null)}>
            <m.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.2 }}
              className={styles.modalContent}
              onClick={(e) => e.stopPropagation()}
            >
              <div className={styles.modalHeader}>
                <span
                  className={styles.modalCatBadge}
                  style={{
                    backgroundColor:
                      categoryColorMap[selectedEvent.category]?.bg || "#f1f5f9",
                    color:
                      categoryColorMap[selectedEvent.category]?.text || "#0f172a",
                  }}
                >
                  {selectedEvent.categoryLabel}
                </span>

                <button
                  type="button"
                  onClick={() => setSelectedEvent(null)}
                  className={styles.modalCloseBtn}
                  aria-label="Close details"
                >
                  <X size={20} />
                </button>
              </div>

              <h3 className={styles.modalTitle}>{selectedEvent.title}</h3>

              <div className={styles.modalMetaList}>
                <div className={styles.modalMetaRow}>
                  <CalendarIcon size={16} className={styles.modalMetaIcon} />
                  <div>
                    <strong>Date:</strong>
                    <span>{selectedEvent.date}</span>
                  </div>
                </div>

                <div className={styles.modalMetaRow}>
                  <Clock size={16} className={styles.modalMetaIcon} />
                  <div>
                    <strong>Timing:</strong>
                    <span>{selectedEvent.time}</span>
                  </div>
                </div>

                <div className={styles.modalMetaRow}>
                  <Users size={16} className={styles.modalMetaIcon} />
                  <div>
                    <strong>Target Classes:</strong>
                    <span>{selectedEvent.grades}</span>
                  </div>
                </div>

                <div className={styles.modalMetaRow}>
                  <MapPin size={16} className={styles.modalMetaIcon} />
                  <div>
                    <strong>Venue / Location:</strong>
                    <span>{selectedEvent.venue}</span>
                  </div>
                </div>
              </div>

              <div className={styles.modalBody}>
                <h4>Event Guidance & Details</h4>
                <p>{selectedEvent.description}</p>
              </div>

              <div className={styles.modalFooter}>
                <button
                  type="button"
                  onClick={() => setSelectedEvent(null)}
                  className="btn btn-primary"
                  style={{ width: "100%" }}
                >
                  <span>Close Details</span>
                </button>
              </div>
            </m.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
