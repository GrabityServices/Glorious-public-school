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
    try {
      // Remove any existing print frame
      const oldFrame = document.getElementById("gps-calendar-print-frame");
      if (oldFrame && oldFrame.parentNode) {
        oldFrame.parentNode.removeChild(oldFrame);
      }

      // Create an isolated hidden iframe for fast, conflict-free printing
      const printFrame = document.createElement("iframe");
      printFrame.id = "gps-calendar-print-frame";
      printFrame.style.position = "fixed";
      printFrame.style.right = "0";
      printFrame.style.bottom = "0";
      printFrame.style.width = "0";
      printFrame.style.height = "0";
      printFrame.style.border = "0";
      printFrame.style.visibility = "hidden";
      document.body.appendChild(printFrame);

      // Build grid cells HTML
      let cellsHtml = "";
      calendarCells.forEach((cell) => {
        if (cell.isBlank) {
          cellsHtml += `<div class="blank-cell"></div>`;
        } else {
          const eventsList = (cell.events || [])
            .map((ev) => {
              const catClass = `cat-${ev.category || "celebration"}`;
              return `<div class="event-pill ${catClass}"><strong>${ev.title}</strong></div>`;
            })
            .join("");

          const sundayClass = cell.isSunday ? "is-sunday" : "";
          const sundayTag = cell.isSunday ? `<span class="sunday-tag">Holiday</span>` : "";

          cellsHtml += `
            <div class="day-cell ${sundayClass}">
              <div class="day-header">
                <span class="day-num">${cell.day}</span>
                ${sundayTag}
              </div>
              <div class="events-list">
                ${eventsList}
              </div>
            </div>
          `;
        }
      });

      // Build Agenda table rows HTML
      let agendaRowsHtml = "";
      if (monthEvents.length === 0) {
        agendaRowsHtml = `
          <tr>
            <td colspan="5" style="text-align: center; padding: 12px; color: #64748b;">
              No special holidays or scheduled events in this category. Regular classes continue as per standard school routine.
            </td>
          </tr>
        `;
      } else {
        monthEvents.forEach((ev) => {
          const catClass = `cat-${ev.category || "celebration"}`;
          agendaRowsHtml += `
            <tr>
              <td class="agenda-date"><strong>${ev.date}</strong></td>
              <td class="agenda-title">
                <span class="pill-badge ${catClass}">${ev.categoryLabel}</span>
                <strong>${ev.title}</strong>
              </td>
              <td class="agenda-grades">${ev.grades || "All Classes"}</td>
              <td class="agenda-meta">${ev.time || "School Hours"}<br/><small style="color: #64748b;">${ev.venue || "Campus"}</small></td>
              <td class="agenda-desc">${ev.description || "—"}</td>
            </tr>
          `;
        });
      }

      const printableHtml = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Glorious Public School - Academic Calendar - ${activeMonthObj.fullName}</title>
  <style>
    @page {
      size: portrait;
      margin: 8mm 10mm 10mm 10mm;
    }
    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
    }
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      color: #0f172a;
      background: #ffffff;
      padding: 4px;
      font-size: 11px;
      line-height: 1.3;
    }
    .print-header {
      text-align: center;
      padding-bottom: 8px;
      margin-bottom: 8px;
      border-bottom: 2px solid #0f172a;
    }
    .school-title {
      font-size: 20px;
      font-weight: 800;
      color: #0f172a;
      letter-spacing: -0.01em;
      text-transform: uppercase;
      margin-bottom: 2px;
    }
    .school-subtitle {
      font-size: 10px;
      color: #475569;
      margin-bottom: 6px;
    }
    .meta-bar {
      display: flex;
      justify-content: space-between;
      align-items: center;
      background: #f1f5f9;
      padding: 6px 10px;
      border-radius: 4px;
      border: 1px solid #cbd5e1;
      font-size: 11px;
    }
    .meta-month {
      font-size: 13px;
      font-weight: 700;
      color: #0f172a;
    }
    .meta-info {
      color: #334155;
      font-size: 10.5px;
    }

    /* Weekdays header */
    .weekdays-grid {
      display: grid;
      grid-template-columns: repeat(7, 1fr);
      background: #0f172a;
      color: #ffffff;
      font-weight: 700;
      font-size: 10px;
      text-align: center;
      margin-top: 8px;
      border-radius: 4px 4px 0 0;
      overflow: hidden;
    }
    .weekday-col {
      padding: 5px 2px;
      border-right: 1px solid #334155;
    }
    .weekday-col:last-child {
      border-right: none;
      background: #dc2626;
    }

    /* Days Matrix */
    .matrix-grid {
      display: grid;
      grid-template-columns: repeat(7, 1fr);
      border: 1px solid #cbd5e1;
      border-top: none;
      background: #e2e8f0;
      gap: 1px;
      margin-bottom: 12px;
    }
    .blank-cell {
      background: #f8fafc;
      min-height: 52px;
    }
    .day-cell {
      background: #ffffff;
      min-height: 52px;
      padding: 3px 4px;
      display: flex;
      flex-direction: column;
    }
    .day-cell.is-sunday {
      background: #fff5f5;
    }
    .day-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 2px;
    }
    .day-num {
      font-weight: 700;
      font-size: 10px;
      color: #0f172a;
    }
    .day-cell.is-sunday .day-num {
      color: #dc2626;
    }
    .sunday-tag {
      font-size: 8px;
      font-weight: 700;
      color: #dc2626;
      background: #fee2e2;
      padding: 1px 3px;
      border-radius: 2px;
      line-height: 1;
    }
    .events-list {
      display: flex;
      flex-direction: column;
      gap: 2px;
    }
    .event-pill {
      font-size: 8.5px;
      padding: 1.5px 3px;
      border-radius: 2px;
      line-height: 1.15;
      border: 1px solid transparent;
      white-space: normal;
      word-break: break-word;
    }

    /* Category colors matching school theme */
    .cat-holiday {
      background: #fee2e2 !important;
      color: #991b1b !important;
      border-color: #fca5a5 !important;
    }
    .cat-exam {
      background: #dbeafe !important;
      color: #1e40af !important;
      border-color: #93c5fd !important;
    }
    .cat-celebration {
      background: #d1fae5 !important;
      color: #065f46 !important;
      border-color: #6ee7b7 !important;
    }
    .cat-ptm {
      background: #fef3c7 !important;
      color: #92400e !important;
      border-color: #fcd34d !important;
    }

    /* Agenda Table */
    .agenda-title-bar {
      font-size: 12px;
      font-weight: 700;
      color: #0f172a;
      margin-bottom: 6px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-bottom: 1px solid #cbd5e1;
      padding-bottom: 4px;
    }
    table.agenda-table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 12px;
      font-size: 10px;
    }
    table.agenda-table th {
      background: #f1f5f9;
      color: #0f172a;
      font-weight: 700;
      padding: 5px 6px;
      border: 1px solid #cbd5e1;
      text-align: left;
    }
    table.agenda-table td {
      padding: 4px 6px;
      border: 1px solid #cbd5e1;
      vertical-align: top;
    }
    .agenda-date {
      white-space: nowrap;
      width: 85px;
    }
    .agenda-title {
      width: 170px;
    }
    .agenda-grades {
      width: 90px;
      color: #334155;
    }
    .agenda-meta {
      width: 130px;
      color: #334155;
    }
    .pill-badge {
      display: inline-block;
      font-size: 8px;
      font-weight: 700;
      padding: 1px 4px;
      border-radius: 3px;
      margin-right: 4px;
    }
    .agenda-desc {
      color: #475569;
      font-size: 9.5px;
    }

    /* Print Footer */
    .print-footer {
      display: flex;
      justify-content: space-between;
      align-items: flex-end;
      border-top: 1px solid #cbd5e1;
      padding-top: 6px;
      font-size: 9px;
      color: #64748b;
      margin-top: 10px;
      page-break-inside: avoid;
    }
    .signature-area {
      text-align: right;
    }
    .sig-line {
      width: 140px;
      border-top: 1px solid #0f172a;
      margin-top: 22px;
      margin-bottom: 3px;
      display: inline-block;
    }
  </style>
</head>
<body>
  <div class="print-header">
    <div class="school-title">Glorious Public School</div>
    <div class="school-subtitle">
      Recognized English Medium Co-Educational Institution (Nursery to Class 10th) • Koltex, Petrol Pump, Jhajha, Jamui, Bihar
    </div>
    <div class="meta-bar">
      <div class="meta-month">Official Academic Calendar: ${activeMonthObj.fullName}</div>
      <div class="meta-info">Academic Session 2026 - 2027 • Printed: ${new Date().toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</div>
    </div>
  </div>

  <div class="weekdays-grid">
    <div class="weekday-col">Monday</div>
    <div class="weekday-col">Tuesday</div>
    <div class="weekday-col">Wednesday</div>
    <div class="weekday-col">Thursday</div>
    <div class="weekday-col">Friday</div>
    <div class="weekday-col">Saturday</div>
    <div class="weekday-col">Sunday</div>
  </div>

  <div class="matrix-grid">
    ${cellsHtml}
  </div>

  <div class="agenda-title-bar">
    <span>Events, Examinations & Holidays Schedule (${activeMonthObj.fullName})</span>
    <span style="font-size: 10px; font-weight: normal; color: #64748b;">${monthEvents.length} Event(s) Registered</span>
  </div>

  <table class="agenda-table">
    <thead>
      <tr>
        <th style="width: 85px;">Date</th>
        <th style="width: 170px;">Event Title & Category</th>
        <th style="width: 90px;">Classes</th>
        <th style="width: 130px;">Timing & Venue</th>
        <th>Event Guidance & Details</th>
      </tr>
    </thead>
    <tbody>
      ${agendaRowsHtml}
    </tbody>
  </table>

  <div class="print-footer">
    <div>
      <strong>Glorious Public School Administrative Desk</strong><br />
      Address: Koltex, Petrol Pump, Jhajha • Helpline: 9534105012 • Email: gpsjhajha@gmail.com
    </div>
    <div class="signature-area">
      <div class="sig-line"></div><br />
      <strong>Principal / Examination In-Charge</strong>
    </div>
  </div>
</body>
</html>
      `;

      const frameDoc = printFrame.contentWindow.document;
      frameDoc.open();
      frameDoc.write(printableHtml);
      frameDoc.close();

      // Trigger print after iframe renders
      setTimeout(() => {
        try {
          printFrame.contentWindow.focus();
          printFrame.contentWindow.print();
        } catch (err) {
          console.error("Iframe print error, falling back to window.print():", err);
          window.print();
        } finally {
          // Cleanup iframe after print dialog completes
          setTimeout(() => {
            const el = document.getElementById("gps-calendar-print-frame");
            if (el && el.parentNode) {
              el.parentNode.removeChild(el);
            }
          }, 30000);
        }
      }, 150);
    } catch (e) {
      console.error("Print generation error, fallback to window.print():", e);
      window.print();
    }
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
          {/* Print-Only School & Calendar Header */}
          <div className={styles.printHeader}>
            <div className={styles.printHeaderTop}>
              <h1 className={styles.printSchoolTitle}>Glorious Public School</h1>
              <p className={styles.printSchoolSubtitle}>
                Recognized Co-Educational English Medium School (Nursery to Class 10th) • Jhajha, Jamui, Bihar
              </p>
            </div>
            <div className={styles.printHeaderMeta}>
              <div className={styles.printMetaLeft}>
                <strong>School Academic Calendar:</strong> {activeMonthObj.fullName}
              </div>
              <div className={styles.printMetaRight}>
                <span>Academic Session 2026 - 2027</span>
                <span className={styles.printDateText}>
                  Printed: {new Date().toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                </span>
              </div>
            </div>
          </div>

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
