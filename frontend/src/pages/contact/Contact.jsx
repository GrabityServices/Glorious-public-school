import { useState } from "react";
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
} from "lucide-react";
import { m } from "framer-motion";
import styles from "./contact.module.css";
import FadeUp from "@/components/motion/FadeUp";
import useDocumentTitle from "@/hooks/useDocumentTitle";
import { useData } from "@/context/DataContext";

export default function ContactPage() {
  useDocumentTitle("Contact Us | Glorious Public School, Jhajha");
  const { addInquiry, schoolInfo } = useData();

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("Admission Inquiry");
  const [message, setMessage] = useState("");
  const [isSent, setIsSent] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (name.trim() && message.trim()) {
      await addInquiry({
        name,
        studentName: name,
        phone,
        email: email || "inquiry@gloriouspublicschool.com",
        gradeApplying: subject,
        message,
      });
      setIsSent(true);
      setTimeout(() => {
        setName("");
        setPhone("");
        setEmail("");
        setMessage("");
        setSubject("Admission Inquiry");
        setIsSent(false);
      }, 5000);
    }
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
      note: "Sunday: Closed",
    },
  ];

  const openingHours = schoolInfo?.openingHours?.length
    ? schoolInfo.openingHours
    : [
        { day: "Monday", time: "8:00 AM - 2:30 PM", status: "Open" },
        { day: "Tuesday", time: "8:00 AM - 2:30 PM", status: "Open" },
        { day: "Wednesday", time: "8:00 AM - 2:30 PM", status: "Open" },
        { day: "Thursday", time: "8:00 AM - 2:30 PM", status: "Open" },
        { day: "Friday", time: "8:00 AM - 2:30 PM", status: "Open" },
        { day: "Saturday", time: "8:00 AM - 1:00 PM", status: "Half Day" },
        { day: "Sunday", time: "Closed", status: "Holiday" },
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

      {/* Main Grid: Info & Contact Form */}
      <section className={styles.section}>
        <div className={styles.container}>
          <div className={styles.grid}>
            {/* Left: Contact Info Cards & Hours */}
            <div className={styles.infoCol}>
              <FadeUp>
                <h2 className={styles.sectionTitle}>School Desk & Coordinates</h2>
                <p className={styles.sectionDesc}>
                  Visit our campus or contact our administration directly for prospectus, fee structures, and campus walk-throughs.
                </p>
              </FadeUp>

              <div className={styles.cardsList}>
                {contactInfos.map((info, idx) => (
                  <FadeUp key={idx} delay={0.08 * (idx + 1)}>
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

              {/* Hours Box */}
              <FadeUp delay={0.35}>
                <div className={styles.hoursCard}>
                  <h3>Official School Timings</h3>
                  <table className={styles.hoursTable}>
                    <tbody>
                      {openingHours.map((oh, i) => (
                        <tr key={i}>
                          <td><strong>{oh.day}</strong></td>
                          <td>{oh.time}</td>
                          <td>
                            <span className={oh.status === "Closed" ? styles.closedBadge : styles.openBadge}>
                              {oh.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </FadeUp>
            </div>

            {/* Right: Message Form */}
            <div className={styles.formCol}>
              <FadeUp delay={0.15}>
                <div className={styles.formContainer}>
                  <h2>Send Us an Inquiry</h2>
                  <p className={styles.formSub}>
                    Fill out the form below and our admissions team will respond promptly.
                  </p>

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
                    <form onSubmit={handleSubmit} className={styles.form}>
                      <div className={styles.formGroup}>
                        <label>Your Full Name *</label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. Ramesh Kumar"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          className={styles.input}
                        />
                      </div>

                      <div className={styles.twoCols}>
                        <div className={styles.formGroup}>
                          <label>Phone Number *</label>
                          <input
                            type="tel"
                            required
                            placeholder="10-digit mobile number"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            className={styles.input}
                          />
                        </div>

                        <div className={styles.formGroup}>
                          <label>Email Address</label>
                          <input
                            type="email"
                            placeholder="name@example.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className={styles.input}
                          />
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

                      <div className={styles.formGroup}>
                        <label>Your Message / Details *</label>
                        <textarea
                          required
                          placeholder="Tell us about the student, class applying for, or your query..."
                          rows={4}
                          value={message}
                          onChange={(e) => setMessage(e.target.value)}
                          className={styles.textarea}
                        />
                      </div>

                      <button type="submit" className="btn btn-gold" style={{ width: "100%" }}>
                        <Send size={16} />
                        <span>Send Message</span>
                      </button>
                    </form>
                  )}
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
