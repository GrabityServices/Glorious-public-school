import { Link } from "react-router-dom";
import {
  GraduationCap,
  Bus,
  Home,
  BookOpen,
  Monitor,
  Trophy,
  CheckCircle2,
  Phone,
  ArrowRight,
} from "lucide-react";
import styles from "./facilities.module.css";
import FadeUp from "@/components/motion/FadeUp";
import useDocumentTitle from "@/hooks/useDocumentTitle";
import { FACILITIES_DATA } from "@/data/facilitiesData";
import { SCHOOL_INFO } from "@/data/schoolData";

export default function FacilitiesPage() {
  useDocumentTitle("Our Facilities | Glorious Public School, Jhajha");

  const iconMap = {
    GraduationCap: <GraduationCap size={32} />,
    Bus: <Bus size={32} />,
    Home: <Home size={32} />,
    BookOpen: <BookOpen size={32} />,
    Monitor: <Monitor size={32} />,
    Trophy: <Trophy size={32} />,
  };

  return (
    <div className={styles.pageWrapper}>
      {/* Hero Header */}
      <section className={styles.heroHeader}>
        <div className={styles.container}>
          <FadeUp>
            <span className="section-subtitle">World-Class Infrastructure</span>
            <h1 className={styles.title}>School Facilities & Campus Amenities</h1>
            <p className={styles.subtitle}>
              Providing safe school bus transport, secure residential hostel boarding, qualified teachers, modern digital library, science and IT laboratories, and expansive sports grounds in Jhajha.
            </p>
          </FadeUp>
        </div>
      </section>

      {/* Facilities Detailed List */}
      <section className={styles.section}>
        <div className={styles.container}>
          <div className={styles.facilitiesList}>
            {FACILITIES_DATA.map((facility, index) => (
              <FadeUp key={facility.id} delay={0.1}>
                <div
                  className={`${styles.facilityBlock} ${
                    index % 2 === 1 ? styles.reversed : ""
                  }`}
                  id={facility.id}
                >
                  <div className={styles.facilityContent}>
                    <div className={styles.iconCircle}>
                      {iconMap[facility.icon] || <BookOpen size={32} />}
                    </div>
                    <h2>{facility.title}</h2>
                    <p className={styles.lead}>{facility.shortDesc}</p>
                    <p className={styles.fullDesc}>{facility.fullDesc}</p>

                    <div className={styles.highlightsBox}>
                      <h4>Key Features & Highlights:</h4>
                      <ul className={styles.hlList}>
                        {facility.highlights.map((hl, i) => (
                          <li key={i}>
                            <CheckCircle2 size={16} />
                            <span>{hl}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  <div className={styles.facilityCardSide}>
                    <div className={styles.sideCard}>
                      <h3>Facility Spotlight</h3>
                      <div className={styles.spotlightBadge}>Glorious Campus</div>
                      <p>
                        Supervised under strict child safety protocols with 24/7 CCTV surveillance, clean drinking water, and backup power generator.
                      </p>
                      <Link to="/admissions" className="btn btn-gold btn-sm" style={{ width: "100%", marginTop: "16px" }}>
                        <span>Apply for Admission</span>
                        <ArrowRight size={14} />
                      </Link>
                    </div>
                  </div>
                </div>
              </FadeUp>
            ))}
          </div>
        </div>
      </section>

      {/* Quick CTA */}
      <section className={styles.ctaSection}>
        <div className={styles.container}>
          <div className={styles.ctaCard}>
            <h2>Ready to experience our campus firsthand?</h2>
            <p>
              Schedule a campus tour, inspect our hostel and laboratory facilities, or talk directly with our admission team at Koltex, Petrol Pump, Jhajha.
            </p>
            <div className={styles.btnGroup}>
              <Link to="/contact" className="btn btn-gold">
                <span>Book a Campus Visit</span>
              </Link>
              <a href={`tel:${SCHOOL_INFO.phone}`} className="btn btn-secondary">
                <Phone size={16} />
                <span>Call Helpline: {SCHOOL_INFO.phone}</span>
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
