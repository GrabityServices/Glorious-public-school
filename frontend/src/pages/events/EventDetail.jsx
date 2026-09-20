import { useParams, Link } from "react-router-dom";
import { Calendar, MapPin, Clock, ArrowLeft, CheckCircle2, Award } from "lucide-react";
import styles from "./events.module.css";
import FadeUp from "@/components/motion/FadeUp";
import useDocumentTitle from "@/hooks/useDocumentTitle";
import { useData } from "@/context/DataContext";

export default function EventDetailPage() {
  const { id } = useParams();
  const { events } = useData();
  const event = events.find((e) => e.id === id) || events[0] || {};

  useDocumentTitle(`${event.title || "Event Details"} | Glorious Public School`);

  return (
    <div className={styles.pageWrapper}>
      <section className={styles.heroHeader}>
        <div className={styles.container}>
          <FadeUp>
            <Link to="/events" className={styles.backLink}>
              <ArrowLeft size={16} />
              <span>Back to All Events</span>
            </Link>
            <span className={styles.catBadge} style={{ marginTop: "16px" }}>{event.category}</span>
            <h1 className={styles.title} style={{ marginTop: "8px" }}>{event.title}</h1>
            <div className={styles.metaRow}>
              <span><Calendar size={15} /> {event.date}</span>
              <span><Clock size={15} /> {event.time}</span>
              <span><MapPin size={15} /> {event.venue}</span>
            </div>
          </FadeUp>
        </div>
      </section>

      <section className={styles.section}>
        <div className={styles.container}>
          <div className={styles.detailCard}>
            <h2>About this Event</h2>
            <p className={styles.fullParagraph}>{event.fullDesc}</p>

            <div className={styles.highlightsContainer}>
              <h3>Key Highlights & Results:</h3>
              <ul className={styles.highlightsList}>
                {event.highlights.map((hl, i) => (
                  <li key={i}>
                    <CheckCircle2 size={18} className={styles.checkIcon} />
                    <span>{hl}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className={styles.actionBanner}>
              <div>
                <h4>Interested in participating or learning more?</h4>
                <p>Contact the cultural & extracurricular coordinator at Glorious Public School, Jhajha.</p>
              </div>
              <Link to="/contact" className="btn btn-gold">
                <span>Contact Event Coordinator</span>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
