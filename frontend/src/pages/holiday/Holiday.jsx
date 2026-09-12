import { Calendar, Sun, Palmtree, Flag } from "lucide-react";
import styles from "./holiday.module.css";
import FadeUp from "@/components/motion/FadeUp";
import useDocumentTitle from "@/hooks/useDocumentTitle";
import { HOLIDAYS_DATA } from "@/data/holidayData";

export default function HolidayPage() {
  useDocumentTitle("School Holiday Calendar | Glorious Public School");

  return (
    <div className={styles.pageWrapper}>
      {/* Hero Header */}
      <section className={styles.heroHeader}>
        <div className={styles.container}>
          <FadeUp>
            <span className="section-subtitle">Academic Session 2026 - 2027</span>
            <h1 className={styles.title}>School Holiday Calendar</h1>
            <p className={styles.subtitle}>
              Official vacation list and festive holidays for students and faculty of Glorious Public School, Jhajha.
            </p>
          </FadeUp>
        </div>
      </section>

      {/* Holiday Table Section */}
      <section className={styles.section}>
        <div className={styles.container}>
          <div className="tableScroll">
            <table className={styles.holidayTable}>
              <thead>
                <tr>
                  <th>Occasion / Festival</th>
                  <th>Date & Period</th>
                  <th>No. of Days</th>
                  <th>Category</th>
                </tr>
              </thead>
              <tbody>
                {HOLIDAYS_DATA.map((h, idx) => (
                  <tr key={idx} className={h.days > 3 ? styles.majorBreak : ""}>
                    <td className={styles.occasionCell}>
                      <strong>{h.occasion}</strong>
                    </td>
                    <td className={styles.dateCell}>
                      <Calendar size={15} style={{ display: "inline", marginRight: "6px" }} />
                      {h.date}
                    </td>
                    <td>
                      <span className={styles.dayBadge}>
                        {h.days} {h.days === 1 ? "Day" : "Days"}
                      </span>
                    </td>
                    <td>
                      <span className={styles.typeBadge}>{h.type}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className={styles.noteBox}>
            <p>
              * <em>Note:</em> Dates of religious festivals (such as Eid, Holi, and Chhath Puja) are subject to the appearance of the moon and state government gazette notifications. Any changes will be officially notified on the school notice board and website.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
