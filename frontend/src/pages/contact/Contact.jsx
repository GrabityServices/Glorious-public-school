import { useState } from "react";
import {
  MapPin,
  Phone,
  Mail,
  Clock,
  Send,
  CheckCircle,
  Building,
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
                      {SCHOOL_INFO.openingHours.map((oh, i) => (
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
    </div>
  );
}
