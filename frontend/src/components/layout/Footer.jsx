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
  ExternalLink,
} from "lucide-react";
import styles from "./Footer.module.css";
import { useData, DEFAULT_SOCIAL_LINKS } from "@/context/DataContext";
import { getAcademicSession } from "@/utils/academicYear";

export default function Footer() {
  const { schoolInfo } = useData();
  const phone = schoolInfo?.phone || "9534105012";
  const address = schoolInfo?.address || "Koltex, Petrol Pump, Jhajha, Jamui, Bihar 811308";
  const email = schoolInfo?.email || "gpsjhajha@gmail.com";
  const isAdmissionsOpen = schoolInfo?.isAdmissionsOpen !== false;
  const socialLinks = {
    ...DEFAULT_SOCIAL_LINKS,
    ...(schoolInfo?.socialLinks || {}),
  };

  const now = new Date();
  const dayIdx = now.getDay();
  const mins = now.getHours() * 60 + now.getMinutes();
  const isSchoolOpenNow = dayIdx !== 0 && mins >= 8 * 60 && mins <= 14 * 60 + 30;

  return (
    <footer className={styles.footer}>
      {/* Top Banner inside Footer - Always visible, dynamically switches between Admissions Open and Campus Inquiries */}
      <div className={styles.admissionBanner}>
        <div className={styles.container}>
          <div className={styles.bannerFlex}>
            {isAdmissionsOpen ? (
              <>
                <div>
                  <span className={styles.bannerTag}>Session {getAcademicSession()}</span>
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
                  <a href={`tel:${phone}`} className="btn btn-secondary">
                    <Phone size={16} />
                    <span>Call {phone}</span>
                  </a>
                </div>
              </>
            ) : (
              <>
                <div>
                  <span className={styles.bannerTag}>Session {getAcademicSession()} • Glorious Campus</span>
                  <h3 className={styles.bannerTitle}>Have Inquiries or Want to Visit Our Campus?</h3>
                  <p className={styles.bannerDesc}>
                    Connect with our administration desk for curriculum information, campus tours, fee structure, and student guidance.
                  </p>
                </div>
                <div className={styles.bannerBtnGroup}>
                  <Link to="/contact" className="btn btn-gold">
                    <span>Send Inquiry / Message</span>
                    <ArrowRight size={16} />
                  </Link>
                  <a href={`tel:${phone}`} className="btn btn-secondary">
                    <Phone size={16} />
                    <span>Call {phone}</span>
                  </a>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      <div className={styles.container}>
        <div className={styles.grid}>
          {/* Col 1: About School & Social Links */}
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

            {/* Social Media Links: Instagram, Facebook, YouTube, X */}
            <div className={styles.socialRow} aria-label="Official Social Media Profiles">
              <a
                href={socialLinks.instagram}
                target="_blank"
                rel="noopener noreferrer"
                className={styles.socialIconBtn}
                aria-label="Instagram"
                title="Follow us on Instagram"
              >
                <svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                  <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
                </svg>
              </a>
              <a
                href={socialLinks.facebook}
                target="_blank"
                rel="noopener noreferrer"
                className={styles.socialIconBtn}
                aria-label="Facebook"
                title="Follow us on Facebook"
              >
                <svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
                </svg>
              </a>
              <a
                href={socialLinks.youtube}
                target="_blank"
                rel="noopener noreferrer"
                className={styles.socialIconBtn}
                aria-label="YouTube"
                title="Subscribe on YouTube"
              >
                <svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M2.5 17a24.12 24.12 0 0 1 0-10 2 2 0 0 1 1.4-1.4 49.56 49.56 0 0 1 16.2 0A2 2 0 0 1 21.5 7a24.12 24.12 0 0 1 0 10 2 2 0 0 1-1.4 1.4 49.55 49.55 0 0 1-16.2 0A2 2 0 0 1 2.5 17" />
                  <path d="m10 15 5-3-5-3z" />
                </svg>
              </a>
              <a
                href={socialLinks.x}
                target="_blank"
                rel="noopener noreferrer"
                className={styles.socialIconBtn}
                aria-label="X (Twitter)"
                title="Follow us on X"
              >
                <svg viewBox="0 0 24 24" width="15" height="15" fill="currentColor">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
              </a>
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
              <li><Link to="/gallery">Photo & Video Gallery</Link></li>
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
                <span>Live Status:</span>
                <span className={isSchoolOpenNow ? styles.footerOpenTag : styles.closedTag}>
                  {isSchoolOpenNow ? "● Open (8:00 AM - 2:30 PM)" : "● Closed"}
                </span>
              </li>
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
              <span>* Morning Reporting: 7:50 AM. Administrative office remains open till 4:00 PM (Mon–Sat).</span>
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
                  <p>{address}</p>
                </div>
              </div>

              <div className={styles.contactItem}>
                <Phone size={18} className={styles.contactIcon} />
                <div>
                  <strong>Direct Helpline:</strong>
                  <p><a href={`tel:${phone}`}>{phone}</a></p>
                </div>
              </div>

              <div className={styles.contactItem}>
                <Mail size={18} className={styles.contactIcon} />
                <div>
                  <strong>Email Correspondence:</strong>
                  <p><a href={`mailto:${email}`}>{email}</a></p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className={styles.bottomBar}>
          <p className={styles.copyright}>
            Copyright &copy; 2019-2026 <strong>Glorious Public School</strong>. All rights reserved.
          </p>

          <div className={styles.developerCredit}>
            <span className={styles.creditText}>Crafted with</span>
            <Heart size={13} className={styles.creditHeart} />
            <span className={styles.creditText}>by</span>
            <a
              href="https://gravityservices.netlify.app/"
              target="_blank"
              rel="noopener noreferrer"
              className={styles.creditBadge}
              title="Gravity Services — Web Development & Digital Solutions"
            >
              <span className={styles.creditDot} />
              <span className={styles.companyName}>Gravity Services</span>
              <ExternalLink size={12} className={styles.creditArrow} />
            </a>
          </div>

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
