import { Link } from "react-router-dom";
import {
  Phone,
  Mail,
  MapPin,
  Clock,
  GraduationCap,
  ArrowRight,
  ShieldCheck,
  Send,
  Heart,
} from "lucide-react";
import styles from "./Footer.module.css";
import { SCHOOL_INFO } from "@/data/schoolData";

export default function Footer() {
  return (
    <footer className={styles.footer}>
      {/* Top Banner inside Footer */}
      <div className={styles.admissionBanner}>
        <div className={styles.container}>
          <div className={styles.bannerFlex}>
            <div>
              <span className={styles.bannerTag}>Session 2026 - 2027</span>
              <h3 className={styles.bannerTitle}>Admissions Open for the New Academic Session</h3>
              <p className={styles.bannerDesc}>
                Empower your child with strong academic roots, leadership skills, and character building.
              </p>
            </div>
            <div className={styles.bannerBtnGroup}>
              <Link to="/admissions" className="btn btn-gold">
                <span>Apply Online Now</span>
                <ArrowRight size={16} />
              </Link>
              <a href={`tel:${SCHOOL_INFO.phone}`} className="btn btn-secondary">
                <Phone size={16} />
                <span>Call {SCHOOL_INFO.phone}</span>
              </a>
            </div>
          </div>
        </div>
      </div>

      <div className={styles.container}>
        <div className={styles.grid}>
          {/* Col 1: About School */}
          <div className={styles.aboutCol}>
            <div className={styles.brand}>
              <img
                src="/images/glorious-public-school-logo.png"
                alt="Glorious Public School Crest"
                className={styles.footerLogoImg}
              />
              <div>
                <h4 className={styles.brandTitle}>Glorious Public School</h4>
                <p className={styles.brandSub}>KNOWLEDGE • LEADERSHIP • INTEGRITY</p>
              </div>
            </div>
            <p className={styles.aboutText}>
              Glorious is dedicated to create erudite, upright leaders of tomorrow's world. We strive to develop an all-rounded personality, nurturing creative thinking and leadership in every child.
            </p>
            <div className={styles.certifiedBadge}>
              <ShieldCheck size={18} color="var(--accent-gold)" />
              <span>Recognized English Medium Co-Educational Institution</span>
            </div>
          </div>

          {/* Col 2: Quick Links */}
          <div className={styles.linksCol}>
            <h4 className={styles.colTitle}>Quick Links</h4>
            <ul className={styles.linksList}>
              <li><Link to="/admissions">Online Admission</Link></li>
              <li><Link to="/academics">Academic Curriculum</Link></li>
              <li><Link to="/facilities">School Facilities & Hostel</Link></li>
              <li><Link to="/events">Events & Competitions</Link></li>
              <li><Link to="/calendar">School Calendar</Link></li>
              <li><Link to="/news">News & Notice Board</Link></li>
              <li><Link to="/gallery">Photo Gallery</Link></li>
              <li><Link to="/holiday">Holiday Calendar</Link></li>
              <li><Link to="/staff">Faculty & Staff</Link></li>
              <li><Link to="/contact">Contact Us</Link></li>
            </ul>
          </div>

          {/* Col 3: Opening Hours */}
          <div className={styles.hoursCol}>
            <h4 className={styles.colTitle}>
              <Clock size={16} style={{ display: "inline", marginRight: "6px" }} />
              School Hours
            </h4>
            <ul className={styles.hoursList}>
              <li>
                <span>Monday - Friday:</span>
                <strong>8:00 AM - 2:30 PM</strong>
              </li>
              <li>
                <span>Saturday:</span>
                <strong>8:00 AM - 1:00 PM</strong>
              </li>
              <li>
                <span>Sunday:</span>
                <span className={styles.closedTag}>Closed</span>
              </li>
            </ul>
            <div className={styles.officeNote}>
              <span>* Administrative office remains open till 4:00 PM on weekdays.</span>
            </div>
          </div>

          {/* Col 4: Get in Touch */}
          <div className={styles.contactCol}>
            <h4 className={styles.colTitle}>Get In Touch</h4>
            <div className={styles.contactCards}>
              <div className={styles.contactItem}>
                <MapPin size={20} className={styles.contactIcon} />
                <div>
                  <strong>Campus Address:</strong>
                  <p>Glorious Public School, Koltex, Petrol Pump, Jhajha, Jamui, Bihar 811308</p>
                </div>
              </div>

              <div className={styles.contactItem}>
                <Phone size={18} className={styles.contactIcon} />
                <div>
                  <strong>Direct Helpline:</strong>
                  <p><a href={`tel:${SCHOOL_INFO.phone}`}>{SCHOOL_INFO.phone}</a></p>
                </div>
              </div>

              <div className={styles.contactItem}>
                <Mail size={18} className={styles.contactIcon} />
                <div>
                  <strong>Email Correspondence:</strong>
                  <p><a href={`mailto:${SCHOOL_INFO.email}`}>{SCHOOL_INFO.email}</a></p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className={styles.bottomBar}>
          <p className={styles.copyright}>
            Copyright &copy; 2023-2026 <strong>Glorious Public School</strong>. All rights reserved.
          </p>
          <div className={styles.legalLinks}>
            <Link to="/privacy">Privacy Policy</Link>
            <span>•</span>
            <Link to="/terms">Code of Conduct & Terms</Link>
            <span>•</span>
            <Link to="/contact">Locate Us in Jhajha</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
