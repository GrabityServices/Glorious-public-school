import { useState } from "react";
import { Link } from "react-router-dom";
import {
  CheckCircle,
  FileCheck,
  Send,
  HelpCircle,
  Phone,
  Calendar,
  User,
  MapPin,
  Sparkles,
  CheckCircle2,
} from "lucide-react";
import { m, AnimatePresence } from "framer-motion";
import styles from "./admissions.module.css";
import FadeUp from "@/components/motion/FadeUp";
import useDocumentTitle from "@/hooks/useDocumentTitle";
import {
  ADMISSION_STEPS,
  AGE_CRITERIA,
  REQUIRED_DOCUMENTS,
  ADMISSION_CLASSES,
} from "@/data/admissionsData";
import { SCHOOL_INFO } from "@/data/schoolData";

export default function AdmissionsPage() {
  useDocumentTitle("Online Admission 2026-27 | Glorious Public School");

  // Form State
  const [formData, setFormData] = useState({
    studentName: "",
    dob: "",
    gender: "Male",
    applyingClass: "Nursery",
    fatherName: "",
    motherName: "",
    phone: "",
    email: "",
    address: "",
    needTransport: "Yes",
    needHostel: "No",
    previousSchool: "",
  });

  const [isSubmitted, setIsSubmitted] = useState(false);
  const [appId, setAppId] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (formData.studentName && formData.phone && formData.fatherName) {
      const generatedId = "GPS-" + Math.floor(100000 + Math.random() * 900000);
      setAppId(generatedId);
      setIsSubmitted(true);
    }
  };

  const handleReset = () => {
    setIsSubmitted(false);
    setFormData({
      studentName: "",
      dob: "",
      gender: "Male",
      applyingClass: "Nursery",
      fatherName: "",
      motherName: "",
      phone: "",
      email: "",
      address: "",
      needTransport: "Yes",
      needHostel: "No",
      previousSchool: "",
    });
  };

  return (
    <div className={styles.pageWrapper}>
      {/* Hero Header */}
      <section className={styles.heroHeader}>
        <div className={styles.container}>
          <FadeUp>
            <div className="badge-admission" style={{ marginBottom: "16px" }}>
              ADMISSIONS OPEN (SESSION 2026-2027)
            </div>
            <h1 className={styles.title}>Admissions for Nursery to Class 10th</h1>
            <p className={styles.subtitle}>
              Take the first step towards your child's upright, erudite future. Apply online or visit our school admissions desk in Jhajha.
            </p>
          </FadeUp>
        </div>
      </section>

      {/* 4 Steps Section */}
      <section className={styles.section}>
        <div className={styles.container}>
          <div className={styles.centeredHeader}>
            <span className="section-subtitle">Simple 4-Step Process</span>
            <h2>How to Secure Admission</h2>
          </div>

          <div className={styles.stepsGrid}>
            {ADMISSION_STEPS.map((step) => (
              <FadeUp key={step.step} delay={0.1}>
                <div className={styles.stepCard}>
                  <div className={styles.stepNum}>{step.step}</div>
                  <h3 className={styles.stepTitle}>{step.title}</h3>
                  <p className={styles.stepDesc}>{step.desc}</p>
                </div>
              </FadeUp>
            ))}
          </div>
        </div>
      </section>

      {/* Main Grid: Application Form & Eligibility/Documents */}
      <section className={styles.formSection} id="apply-form">
        <div className={styles.container}>
          <div className={styles.grid}>
            {/* Left: Online Admission Form */}
            <div className={styles.formCol}>
              <div className={styles.formContainer}>
                <div className={styles.formHeader}>
                  <Sparkles className={styles.sparkleIcon} size={22} />
                  <div>
                    <h2>Online Student Admission Form</h2>
                    <p>Session 2026-2027 • Fill out details below for instant registration</p>
                  </div>
                </div>

                {isSubmitted ? (
                  <m.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className={styles.successBlock}
                  >
                    <CheckCircle size={56} className={styles.successIcon} />
                    <h3>Application Submitted Successfully!</h3>
                    <p>
                      Thank you for applying to <strong>Glorious Public School</strong> for{" "}
                      <strong>{formData.studentName}</strong> (Class: {formData.applyingClass}).
                    </p>
                    <div className={styles.appBadge}>
                      <span>Application Registration Code:</span>
                      <strong>{appId}</strong>
                    </div>
                    <p className={styles.instructions}>
                      Our admissions counselor will contact you on <strong>{formData.phone}</strong> within 24 hours to schedule the baseline interaction. Please keep the required documents ready.
                    </p>
                    <button onClick={handleReset} className="btn btn-secondary" style={{ marginTop: "16px" }}>
                      <span>Submit Another Application</span>
                    </button>
                  </m.div>
                ) : (
                  <form onSubmit={handleSubmit} className={styles.form}>
                    {/* Student Info */}
                    <div className={styles.sectionDivider}>Student Particulars</div>
                    <div className={styles.twoFields}>
                      <div className={styles.formGroup}>
                        <label>Student Full Name *</label>
                        <input
                          type="text"
                          required
                          name="studentName"
                          placeholder="e.g. Aryan Kumar"
                          value={formData.studentName}
                          onChange={handleChange}
                          className={styles.input}
                        />
                      </div>
                      <div className={styles.formGroup}>
                        <label>Date of Birth *</label>
                        <input
                          type="date"
                          required
                          name="dob"
                          value={formData.dob}
                          onChange={handleChange}
                          className={styles.input}
                        />
                      </div>
                    </div>

                    <div className={styles.twoFields}>
                      <div className={styles.formGroup}>
                        <label>Gender *</label>
                        <select
                          name="gender"
                          value={formData.gender}
                          onChange={handleChange}
                          className={styles.select}
                        >
                          <option value="Male">Male</option>
                          <option value="Female">Female</option>
                          <option value="Other">Other</option>
                        </select>
                      </div>
                      <div className={styles.formGroup}>
                        <label>Class Applying For *</label>
                        <select
                          name="applyingClass"
                          value={formData.applyingClass}
                          onChange={handleChange}
                          className={styles.select}
                        >
                          {ADMISSION_CLASSES.map((cls) => (
                            <option key={cls} value={cls}>
                              {cls}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    {/* Parents Info */}
                    <div className={styles.sectionDivider}>Parent / Guardian Details</div>
                    <div className={styles.twoFields}>
                      <div className={styles.formGroup}>
                        <label>Father's Name *</label>
                        <input
                          type="text"
                          required
                          name="fatherName"
                          placeholder="e.g. Rajesh Kumar"
                          value={formData.fatherName}
                          onChange={handleChange}
                          className={styles.input}
                        />
                      </div>
                      <div className={styles.formGroup}>
                        <label>Mother's Name *</label>
                        <input
                          type="text"
                          required
                          name="motherName"
                          placeholder="e.g. Suman Devi"
                          value={formData.motherName}
                          onChange={handleChange}
                          className={styles.input}
                        />
                      </div>
                    </div>

                    <div className={styles.twoFields}>
                      <div className={styles.formGroup}>
                        <label>Primary Mobile Phone *</label>
                        <input
                          type="tel"
                          required
                          name="phone"
                          placeholder="10-digit phone number"
                          value={formData.phone}
                          onChange={handleChange}
                          className={styles.input}
                        />
                      </div>
                      <div className={styles.formGroup}>
                        <label>Email Address (Optional)</label>
                        <input
                          type="email"
                          name="email"
                          placeholder="parent@example.com"
                          value={formData.email}
                          onChange={handleChange}
                          className={styles.input}
                        />
                      </div>
                    </div>

                    {/* Facilities & Address */}
                    <div className={styles.sectionDivider}>Facilities & Address</div>
                    <div className={styles.twoFields}>
                      <div className={styles.formGroup}>
                        <label>School Bus / Transport Required?</label>
                        <select
                          name="needTransport"
                          value={formData.needTransport}
                          onChange={handleChange}
                          className={styles.select}
                        >
                          <option value="Yes">Yes (Jhajha / Jamui Route)</option>
                          <option value="No">No (Self Conveyance)</option>
                        </select>
                      </div>
                      <div className={styles.formGroup}>
                        <label>Hostel / Boarding Required?</label>
                        <select
                          name="needHostel"
                          value={formData.needHostel}
                          onChange={handleChange}
                          className={styles.select}
                        >
                          <option value="No">No (Day Scholar)</option>
                          <option value="Yes">Yes (Hostel Boarding)</option>
                        </select>
                      </div>
                    </div>

                    <div className={styles.formGroup}>
                      <label>Residential Address *</label>
                      <textarea
                        required
                        name="address"
                        placeholder="Village / Ward / Landmark, Post, Jhajha, Jamui, Bihar"
                        rows={3}
                        value={formData.address}
                        onChange={handleChange}
                        className={styles.textarea}
                      />
                    </div>

                    <div className={styles.formGroup}>
                      <label>Previous School Attended (If Any)</label>
                      <input
                        type="text"
                        name="previousSchool"
                        placeholder="School name and last class passed"
                        value={formData.previousSchool}
                        onChange={handleChange}
                        className={styles.input}
                      />
                    </div>

                    <button type="submit" className="btn btn-gold" style={{ width: "100%", padding: "14px" }}>
                      <Send size={18} />
                      <span>Submit Admission Application</span>
                    </button>
                  </form>
                )}
              </div>
            </div>

            {/* Right: Age Matrix & Required Documents */}
            <div className={styles.infoCol}>
              {/* Age Eligibility Table */}
              <div className={styles.infoCard}>
                <h3>Age Eligibility Criteria</h3>
                <div className="tableScroll">
                  <table className={styles.criteriaTable}>
                    <thead>
                      <tr>
                        <th>Class</th>
                        <th>Recommended Age</th>
                        <th>Remarks</th>
                      </tr>
                    </thead>
                    <tbody>
                      {AGE_CRITERIA.map((crit, idx) => (
                        <tr key={idx}>
                          <td><strong>{crit.class}</strong></td>
                          <td>{crit.age}</td>
                          <td>{crit.asOn}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Required Documents Checklist */}
              <div className={styles.infoCard}>
                <h3>Required Documents Checklist</h3>
                <ul className={styles.docList}>
                  {REQUIRED_DOCUMENTS.map((doc, idx) => (
                    <li key={idx}>
                      <FileCheck size={18} className={styles.docIcon} />
                      <span>{doc}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Admission Helpline */}
              <div className={styles.helplineCard}>
                <h4>Need Assistance with Admission?</h4>
                <p>Call our admission counselors directly or visit the school office in Jhajha.</p>
                <div className={styles.helpContact}>
                  <Phone size={20} />
                  <a href={`tel:${SCHOOL_INFO.phone}`}>{SCHOOL_INFO.phone}</a>
                </div>
                <span className={styles.helpHours}>Office Hours: Mon - Fri: 8:00 AM - 2:30 PM, Sat: 8:00 AM - 1:00 PM</span>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
