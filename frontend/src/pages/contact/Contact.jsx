import { useState, useEffect } from "react";
import {
  MapPin,
  Phone,
  Mail,
  Clock,
  Send,
  CheckCircle,
  Building,
  Navigation,
  ExternalLink,
  Car,
  Share2,
} from "lucide-react";
import { m } from "framer-motion";
import styles from "./contact.module.css";
import FadeUp from "@/components/motion/FadeUp";
import useDocumentTitle from "@/hooks/useDocumentTitle";
import { useData, DEFAULT_SOCIAL_LINKS } from "@/context/DataContext";
import {
  sanitizePhoneInput,
  validateIndianPhone,
  validateEmail,
  validateName,
  validateText,
} from "@/utils/validation";

export default function ContactPage() {
  useDocumentTitle("Contact Us & Official School Timings | Glorious Public School, Jhajha", {
    path: "/contact",
    schemaType: "ContactPage",
    description:
      "Contact Glorious Public School, Jamui Road, Jhajha, District Jamui, Bihar - 811308. Call +91 9534105012, check live school open/closed status (8:00 AM - 2:30 PM), view campus map, or submit an online inquiry.",
    keywords:
      "Contact Glorious Public School Jhajha, Glorious Public School phone number, Jamui Road Jhajha school address, Glorious Public School timings, school map Jhajha",
    aeoSummary:
      "Glorious Public School is located on Jamui Road, Jhajha, District Jamui, Bihar - 811308. Phone: +91 9534105012, Email: gloriouspublicschool@gmail.com. Academic hours: 8:00 AM – 2:30 PM (Mon–Sat); Admin Office: 8:00 AM – 4:00 PM.",
    faqs: [
      {
        question: "What is the contact number and address of Glorious Public School, Jhajha?",
        answer:
          "Glorious Public School is located at Jamui Road, Jhajha, District Jamui, Bihar - 811308. You can call the school reception at +91 9534105012 or email gloriouspublicschool@gmail.com.",
      },
      {
        question: "What are the visiting and office hours at Glorious Public School?",
        answer:
          "Academic school hours are 8:00 AM to 2:30 PM (Monday to Saturday). The Administrative & Admission Office is open from 8:00 AM to 4:00 PM, and Principal visiting hours are 9:30 AM to 12:30 PM.",
      },
    ],
  });
  const { addInquiry, schoolInfo } = useData();

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("Admission Inquiry");
  const [message, setMessage] = useState("");
  const [isSent, setIsSent] = useState(false);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  // Live clock to check if current time is between 8:00 AM and 2:30 PM
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 30000);
    return () => clearInterval(timer);
  }, []);

  const currentDayIndex = now.getDay(); // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
  const weekdayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  const todayName = weekdayNames[currentDayIndex];
  const currentMinutes = now.getHours() * 60 + now.getMinutes();
  // 8:00 AM = 480 mins, 2:30 PM (14:30) = 870 mins
  const isWithinSchoolHours = currentMinutes >= 8 * 60 && currentMinutes <= 14 * 60 + 30;
  const isSchoolOpenNow = currentDayIndex !== 0 && isWithinSchoolHours;
  // Admin office open 8:00 AM to 4:00 PM (960 mins) Mon-Sat
  const isAdminOfficeOpenNow = currentDayIndex !== 0 && currentMinutes >= 8 * 60 && currentMinutes <= 16 * 60;

  const socialLinks = {
    ...DEFAULT_SOCIAL_LINKS,
    ...(schoolInfo?.socialLinks || {}),
  };

  const handlePhoneChange = (e) => {
    const cleaned = sanitizePhoneInput(e.target.value);
    setPhone(cleaned);
    if (touched.phone) {
      const res = validateIndianPhone(cleaned, true);
      setErrors((prev) => ({ ...prev, phone: res.error }));
    }
  };

  const handlePhoneBlur = () => {
    setTouched((prev) => ({ ...prev, phone: true }));
    const res = validateIndianPhone(phone, true);
    setErrors((prev) => ({ ...prev, phone: res.error }));
  };

  const handleNameBlur = () => {
    setTouched((prev) => ({ ...prev, name: true }));
    const res = validateName(name, "Full Name");
    setErrors((prev) => ({ ...prev, name: res.error }));
  };

  const handleEmailBlur = () => {
    if (!email) return;
    setTouched((prev) => ({ ...prev, email: true }));
    const res = validateEmail(email, false);
    setErrors((prev) => ({ ...prev, email: res.error }));
  };

  const handleMessageBlur = () => {
    setTouched((prev) => ({ ...prev, message: true }));
    const res = validateText(message, "Message", 5);
    setErrors((prev) => ({ ...prev, message: res.error }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const nameRes = validateName(name, "Full Name");
    const phoneRes = validateIndianPhone(phone, true);
    const emailRes = validateEmail(email, false);
    const msgRes = validateText(message, "Message", 5);

    const newErrors = {};
    if (!nameRes.isValid) newErrors.name = nameRes.error;
    if (!phoneRes.isValid) newErrors.phone = phoneRes.error;
    if (!emailRes.isValid) newErrors.email = emailRes.error;
    if (!msgRes.isValid) newErrors.message = msgRes.error;

    setErrors(newErrors);
    setTouched({ name: true, phone: true, email: true, message: true });

    if (Object.keys(newErrors).length > 0) {
      return;
    }

    await addInquiry({
      name: name.trim(),
      phone: phone.trim(),
      email: email.trim() || "inquiry@gloriouspublicschool.com",
      gradeApplying: subject,
      message: message.trim(),
      type: "Contact Inquiry",
    });

    setIsSent(true);
    setErrors({});
    setTouched({});
    setTimeout(() => {
      setName("");
      setPhone("");
      setEmail("");
      setMessage("");
      setSubject("Admission Inquiry");
      setIsSent(false);
    }, 5000);
  };

  const contactInfos = [
    {
      icon: <MapPin size={22} />,
      title: "Campus Location",
      desc: schoolInfo?.address || "Koltex, Petrol Pump, Jhajha, Jamui, Bihar 811308",
      note: "Near Koltex, Petrol Pump, Jhajha",
    },
    {
      icon: <Phone size={22} />,
      title: "Direct Phone Helpline",
      desc: schoolInfo?.phone || "9534105012",
      note: "Available Mon - Sat: 8:00 AM - 4:00 PM",
      isPhone: true,
    },
    {
      icon: <Mail size={22} />,
      title: "Email Correspondence",
      desc: schoolInfo?.email || "gpsjhajha@gmail.com",
      note: "Admissions & administrative queries",
      isEmail: true,
    },
    {
      icon: <Clock size={22} />,
      title: "School Operating Hours",
      desc: "Mon - Fri: 8:00 AM - 2:30 PM | Sat: 8:00 AM - 1:00 PM",
      note: isSchoolOpenNow
        ? "Live Status: Currently Open (8:00 AM - 2:30 PM)"
        : "Live Status: Currently Closed (Opens 8:00 AM)",
    },
  ];

  const openingHours = [
    { day: "Monday", time: "8:00 AM - 2:30 PM" },
    { day: "Tuesday", time: "8:00 AM - 2:30 PM" },
    { day: "Wednesday", time: "8:00 AM - 2:30 PM" },
    { day: "Thursday", time: "8:00 AM - 2:30 PM" },
    { day: "Friday", time: "8:00 AM - 2:30 PM" },
    { day: "Saturday", time: "8:00 AM - 1:00 PM (Half Day)" },
    { day: "Sunday", time: "Weekly Holiday", isSunday: true },
  ];

  return (
    <div className={styles.pageWrapper}>
      {/* Hero Header */}
      <section className={styles.heroHeader}>
        <div className={styles.container}>
          <FadeUp>
            <span className="section-subtitle">Get in Touch</span>
            <h1 className={styles.title}>Contact Glorious Public School</h1>
            <p className={styles.subtitle}>
              Have questions regarding admissions for Nursery to Class 10th, school transport routes, or hostel boarding? We are here to help.
            </p>
          </FadeUp>
        </div>
      </section>

      {/* Main Grid: 2x2 Equal-Height Aligned Blocks */}
      <section className={styles.section}>
        <div className={styles.container}>
          <div className={styles.grid}>
            {/* Row 1, Left: School Desk & Coordinates */}
            <div className={styles.deskBlock}>
              <FadeUp>
                <h2 className={styles.sectionTitle}>School Desk & Coordinates</h2>
                <p className={styles.sectionDesc}>
                  Visit our campus or contact our administration directly for prospectus, fee structures, and campus walk-throughs.
                </p>
              </FadeUp>

              <div className={styles.cardsList}>
                {contactInfos.map((info, idx) => (
                  <FadeUp key={idx} delay={0.06 * (idx + 1)} className={styles.cardItemWrap} fullHeight>
                    <div className={styles.infoCard}>
                      <div className={styles.iconCircle}>{info.icon}</div>
                      <div>
                        <h3>{info.title}</h3>
                        {info.isPhone ? (
                          <p className={styles.highlightLink}>
                            <a href={`tel:${info.desc}`}>{info.desc}</a>
                          </p>
                        ) : info.isEmail ? (
                          <p className={styles.highlightLink}>
                            <a href={`mailto:${info.desc}`}>{info.desc}</a>
                          </p>
                        ) : (
                          <p className={styles.mainDesc}>{info.desc}</p>
                        )}
                        <span className={styles.noteText}>{info.note}</span>
                      </div>
                    </div>
                  </FadeUp>
                ))}
              </div>
            </div>

            {/* Row 1, Right: Send Us an Inquiry */}
            <div className={styles.inquiryBlock}>
              <FadeUp delay={0.12} fullHeight>
                <div className={styles.formContainer}>
                  <div>
                    <h2>Send Us an Inquiry</h2>
                    <p className={styles.formSub}>
                      Fill out the form below and our admissions team will respond promptly.
                    </p>
                  </div>

                  {isSent ? (
                    <m.div
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className={styles.successBlock}
                    >
                      <CheckCircle size={48} className={styles.successIcon} />
                      <h3>Inquiry Received!</h3>
                      <p>
                        Thank you for reaching out, <strong>{name}</strong>. An administrative coordinator will call you at{" "}
                        <strong>{phone}</strong> shortly.
                      </p>
                    </m.div>
                  ) : (
                    <form onSubmit={handleSubmit} className={styles.form} noValidate>
                      <div className={styles.formGroup}>
                        <label>Your Full Name *</label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. Ramesh Kumar"
                          value={name}
                          onChange={(e) => {
                            setName(e.target.value);
                            if (touched.name) {
                              const res = validateName(e.target.value, "Full Name");
                              setErrors((p) => ({ ...p, name: res.error }));
                            }
                          }}
                          onBlur={handleNameBlur}
                          className={`${styles.input} ${errors.name ? styles.inputError : ""}`}
                        />
                        {errors.name && <div className={styles.errorMessage}>{errors.name}</div>}
                      </div>

                      <div className={styles.twoCols}>
                        <div className={styles.formGroup}>
                          <label>Phone Number *</label>
                          <div className={styles.phoneInputWrapper}>
                            <span className={styles.phonePrefix}>+91</span>
                            <input
                              type="tel"
                              required
                              inputMode="numeric"
                              autoComplete="tel"
                              maxLength={10}
                              placeholder="9534105012"
                              value={phone}
                              onChange={handlePhoneChange}
                              onBlur={handlePhoneBlur}
                              className={`${styles.input} ${styles.phoneInputWithPrefix} ${
                                errors.phone ? styles.inputError : ""
                              }`}
                            />
                            <span
                              className={`${styles.charCounter} ${
                                phone.length === 10 ? styles.charCounterValid : ""
                              }`}
                            >
                              {phone.length}/10
                            </span>
                          </div>
                          {errors.phone && (
                            <div className={styles.errorMessage}>{errors.phone}</div>
                          )}
                        </div>

                        <div className={styles.formGroup}>
                          <label>Email Address</label>
                          <input
                            type="email"
                            placeholder="name@example.com"
                            value={email}
                            onChange={(e) => {
                              setEmail(e.target.value);
                              if (touched.email && e.target.value) {
                                const res = validateEmail(e.target.value, false);
                                setErrors((p) => ({ ...p, email: res.error }));
                              }
                            }}
                            onBlur={handleEmailBlur}
                            className={`${styles.input} ${errors.email ? styles.inputError : ""}`}
                          />
                          {errors.email && (
                            <div className={styles.errorMessage}>{errors.email}</div>
                          )}
                        </div>
                      </div>

                      <div className={styles.formGroup}>
                        <label>Inquiry Subject</label>
                        <select
                          value={subject}
                          onChange={(e) => setSubject(e.target.value)}
                          className={styles.select}
                        >
                          <option value="Admission Inquiry">Admission Inquiry (Nursery to 10th)</option>
                          <option value="Hostel & Boarding Facility">Hostel & Boarding Facility</option>
                          <option value="Transport & Bus Routes">Transport & Bus Routes</option>
                          <option value="Fee Structure & Guidelines">Fee Structure & Guidelines</option>
                          <option value="Career & Faculty Opportunities">Career & Faculty Opportunities</option>
                          <option value="Other Query">Other General Query</option>
                        </select>
                      </div>

                      <div className={`${styles.formGroup} ${styles.messageGroup}`}>
                        <label>Your Message / Details *</label>
                        <textarea
                          required
                          placeholder="Tell us about the student, class applying for, or your query (min 5 characters)..."
                          rows={4}
                          value={message}
                          onChange={(e) => {
                            setMessage(e.target.value);
                            if (touched.message) {
                              const res = validateText(e.target.value, "Message", 5);
                              setErrors((p) => ({ ...p, message: res.error }));
                            }
                          }}
                          onBlur={handleMessageBlur}
                          className={`${styles.textarea} ${errors.message ? styles.inputError : ""}`}
                        />
                        {errors.message && (
                          <div className={styles.errorMessage}>{errors.message}</div>
                        )}
                      </div>

                      <button type="submit" className={`btn btn-gold ${styles.submitBtn}`}>
                        <Send size={16} />
                        <span>Send Message</span>
                      </button>
                    </form>
                  )}
                </div>
              </FadeUp>
            </div>

            {/* Row 2, Left: Official School Timings */}
            <div className={styles.timingsBlock}>
              <FadeUp delay={0.2} fullHeight>
                <div className={styles.hoursCard}>
                  <div className={styles.hoursCardHeader}>
                    <div>
                      <h3>Official School Timings</h3>
                      <p className={styles.hoursLiveSub}>
                        Live status updates automatically based on school hours (8:00 AM – 2:30 PM)
                      </p>
                    </div>
                    <span className={isSchoolOpenNow ? styles.liveStatusOpen : styles.liveStatusClosed}>
                      <span className={isSchoolOpenNow ? styles.pulseDotGreen : styles.pulseDotRed} />
                      {isSchoolOpenNow ? "Open Now" : "Closed"}
                    </span>
                  </div>

                  <table className={styles.hoursTable}>
                    <tbody>
                      {openingHours.map((oh, i) => {
                        const isToday = oh.day === todayName;
                        const rowIsOpen = !oh.isSunday && isWithinSchoolHours;
                        return (
                          <tr key={i} className={isToday ? styles.todayRow : ""}>
                            <td>
                              <strong>{oh.day}</strong>
                              {isToday && <span className={styles.todayTag}>Today</span>}
                            </td>
                            <td>{oh.time}</td>
                            <td style={{ textAlign: "right" }}>
                              <span className={rowIsOpen ? styles.openBadge : styles.closedBadge}>
                                {rowIsOpen ? "Open" : "Closed"}
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </FadeUp>
            </div>

            {/* Row 2, Right: Connect on Official Social Media */}
            <div className={styles.socialBlock}>
              <FadeUp delay={0.25} fullHeight>
                <div className={styles.socialConnectCard}>
                  <div>
                    <div className={styles.socialConnectHeader}>
                      <Share2 size={18} color="var(--accent-red)" />
                      <h3>Connect on Official Social Media</h3>
                    </div>
                    <p className={styles.socialConnectDesc}>
                      Follow Glorious Public School for live event highlights, celebration videos, and student achievements.
                    </p>
                  </div>

                  <div className={styles.socialButtonsGrid}>
                    <a
                      href={socialLinks.instagram}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`${styles.socialBtn} ${styles.socialInstagram}`}
                      aria-label="Follow us on Instagram"
                    >
                      <div className={styles.socialBtnIconWrap}>
                        <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
                          <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                          <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
                        </svg>
                      </div>
                      <div className={styles.socialBtnText}>
                        <strong>Instagram</strong>
                        <span>Campus Photos & Reels</span>
                      </div>
                    </a>

                    <a
                      href={socialLinks.facebook}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`${styles.socialBtn} ${styles.socialFacebook}`}
                      aria-label="Follow us on Facebook"
                    >
                      <div className={styles.socialBtnIconWrap}>
                        <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
                        </svg>
                      </div>
                      <div className={styles.socialBtnText}>
                        <strong>Facebook</strong>
                        <span>Community & Updates</span>
                      </div>
                    </a>

                    <a
                      href={socialLinks.youtube}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`${styles.socialBtn} ${styles.socialYoutube}`}
                      aria-label="Subscribe on YouTube"
                    >
                      <div className={styles.socialBtnIconWrap}>
                        <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M2.5 17a24.12 24.12 0 0 1 0-10 2 2 0 0 1 1.4-1.4 49.56 49.56 0 0 1 16.2 0A2 2 0 0 1 21.5 7a24.12 24.12 0 0 1 0 10 2 2 0 0 1-1.4 1.4 49.55 49.55 0 0 1-16.2 0A2 2 0 0 1 2.5 17" />
                          <path d="m10 15 5-3-5-3z" />
                        </svg>
                      </div>
                      <div className={styles.socialBtnText}>
                        <strong>YouTube</strong>
                        <span>Event & Annual Videos</span>
                      </div>
                    </a>

                    <a
                      href={socialLinks.x}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`${styles.socialBtn} ${styles.socialX}`}
                      aria-label="Follow us on X"
                    >
                      <div className={styles.socialBtnIconWrap}>
                        <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
                          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                        </svg>
                      </div>
                      <div className={styles.socialBtnText}>
                        <strong>X (Twitter)</strong>
                        <span>Instant School Alerts</span>
                      </div>
                    </a>
                  </div>
                </div>
              </FadeUp>
            </div>
          </div>
        </div>
      </section>

      {/* Interactive Location & Google Map Section */}
      <section className={styles.mapSection}>
        <div className={styles.container}>
          <FadeUp>
            <div className={styles.mapHeader}>
              <div>
                <span className="section-subtitle">Campus Navigation</span>
                <h2 className={styles.mapTitle}>Find Glorious Public School</h2>
                <p className={styles.mapSubtitle}>
                  Conveniently situated in Jhajha, Jamui (Bihar) near Koltex Petrol Pump. Easily accessible via road and rail networks with ample parking and bus drop-off points.
                </p>
              </div>
              <div className={styles.mapActionBtns}>
                <a
                  href="https://www.google.com/maps/place/GLORIOUS+PUBLIC+SCHOOL/@24.7894414,86.3606226,924m/data=!3m2!1e3!4b1!4m6!3m5!1s0x39f1799161588b47:0x346c18dae33527a9!8m2!3d24.7894414!4d86.3631975!16s%2Fg%2F11qby1bx8v?entry=ttu&g_ep=EgoyMDI2MDkyMy4wIKXMDSoASAFQAw%3D%3D"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-gold"
                >
                  <MapPin size={16} />
                  <span>Open in Google Maps</span>
                  <ExternalLink size={14} />
                </a>
                <a
                  href="https://www.google.com/maps/dir/?api=1&destination=24.7894414,86.3631975"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-secondary"
                >
                  <Navigation size={16} />
                  <span>Get Driving Directions</span>
                </a>
              </div>
            </div>
          </FadeUp>

          {/* Travel / Landmark Highlights */}
          <div className={styles.landmarkGrid}>
            <FadeUp delay={0.08}>
              <div className={styles.landmarkCard}>
                <div className={styles.landmarkIconWrap}>
                  <MapPin size={22} />
                </div>
                <div>
                  <h4 className={styles.landmarkTitle}>Prime Landmark</h4>
                  <p className={styles.landmarkDesc}>Adjacent to Koltex Petrol Pump, Main Road, Jhajha</p>
                </div>
              </div>
            </FadeUp>

            <FadeUp delay={0.16}>
              <div className={styles.landmarkCard}>
                <div className={styles.landmarkIconWrap}>
                  <Car size={22} />
                </div>
                <div>
                  <h4 className={styles.landmarkTitle}>Rail & Transit</h4>
                  <p className={styles.landmarkDesc}>2.5 km (~7 mins) from Jhajha Railway Station (JAJ)</p>
                </div>
              </div>
            </FadeUp>

            <FadeUp delay={0.24}>
              <div className={styles.landmarkCard}>
                <div className={styles.landmarkIconWrap}>
                  <Building size={22} />
                </div>
                <div>
                  <h4 className={styles.landmarkTitle}>School Bus Coverage</h4>
                  <p className={styles.landmarkDesc}>Dedicated daily bus routes connecting all major neighborhoods</p>
                </div>
              </div>
            </FadeUp>
          </div>

          {/* Interactive Map Frame */}
          <FadeUp delay={0.3}>
            <div className={styles.mapContainer}>
              <iframe
                title="Glorious Public School Campus Google Map"
                src="https://maps.google.com/maps?q=24.7894414,86.3631975+(GLORIOUS+PUBLIC+SCHOOL)&t=&z=16&ie=UTF8&iwloc=B&output=embed"
                className={styles.mapIframe}
                allowFullScreen=""
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
              <div className={styles.mapOverlayPill}>
                <span className={styles.mapLiveDot} />
                <span>Glorious Public School • Koltex, Jhajha</span>
              </div>
            </div>
          </FadeUp>
        </div>
      </section>
    </div>
  );
}
