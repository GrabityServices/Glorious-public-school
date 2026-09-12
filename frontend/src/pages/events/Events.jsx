import { useState } from "react";
import { Link } from "react-router-dom";
import { Calendar, MapPin, Clock, ArrowRight, Tag } from "lucide-react";
import styles from "./events.module.css";
import FadeUp from "@/components/motion/FadeUp";
import useDocumentTitle from "@/hooks/useDocumentTitle";
import { EVENTS_DATA } from "@/data/eventsData";

export default function EventsPage() {
  useDocumentTitle("School Events & Competitions | Glorious Public School");
  const [activeCategory, setActiveCategory] = useState("All");

  const categories = ["All", "Cultural", "Competition", "Sports", "Academic"];

  const filteredEvents =
    activeCategory === "All"
      ? EVENTS_DATA
      : EVENTS_DATA.filter((e) => e.category === activeCategory);

  return (
    <div className={styles.pageWrapper}>
      {/* Hero Header */}
      <section className={styles.heroHeader}>
        <div className={styles.container}>
          <FadeUp>
            <span className="section-subtitle">School Celebrations</span>
            <h1 className={styles.title}>Events & Inter-School Competitions</h1>
            <p className={styles.subtitle}>
              Celebrating youth talent, arts, athletics, and cultural heritage at Jhajha Town Hall and on our campus grounds.
            </p>
          </FadeUp>
        </div>
      </section>

      {/* Filter Tabs */}
      <section className={styles.section}>
        <div className={styles.container}>
          <div className={styles.filterTabs}>
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`${styles.filterBtn} ${
                  activeCategory === cat ? styles.filterBtnActive : ""
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Events Grid */}
          <div className={styles.eventsGrid}>
            {filteredEvents.map((event, idx) => (
              <FadeUp key={event.id} delay={0.08 * (idx + 1)}>
                <div className={styles.eventCard}>
                  <div className={styles.cardTop}>
                    <span className={styles.catBadge}>{event.category}</span>
                    <span className={styles.yearTag}>{event.year}</span>
                  </div>

                  <h2 className={styles.eventTitle}>
                    <Link to={`/events/${event.id}`}>{event.title}</Link>
                  </h2>

                  <p className={styles.eventDesc}>{event.shortDesc}</p>

                  <div className={styles.eventDetails}>
                    <div className={styles.detailRow}>
                      <Calendar size={15} className={styles.icon} />
                      <span>{event.date}</span>
                    </div>
                    <div className={styles.detailRow}>
                      <Clock size={15} className={styles.icon} />
                      <span>{event.time}</span>
                    </div>
                    <div className={styles.detailRow}>
                      <MapPin size={15} className={styles.icon} />
                      <span>{event.venue}</span>
                    </div>
                  </div>

                  <div className={styles.cardFooter}>
                    <Link to={`/events/${event.id}`} className={styles.readMoreLink}>
                      <span>Read Event Details</span>
                      <ArrowRight size={14} />
                    </Link>
                  </div>
                </div>
              </FadeUp>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
