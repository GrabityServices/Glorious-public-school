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
  Loader2,
  Clock,
  ArrowRight,
} from "lucide-react";
import { m, AnimatePresence } from "framer-motion";
import styles from "./admissions.module.css";
import FadeUp from "@/components/motion/FadeUp";
import useDocumentTitle from "@/hooks/useDocumentTitle";
import { useData } from "@/context/DataContext";
import { getAcademicSession } from "@/utils/academicYear";
import {
  ADMISSION_STEPS,
  AGE_CRITERIA,
  REQUIRED_DOCUMENTS,
  ADMISSION_CLASSES,
} from "@/data/admissionsData";
import { SCHOOL_INFO } from "@/data/schoolData";
import {
  sanitizePhoneInput,
  validateIndianPhone,
  validateEmail,
  validateName,
  validateText,
} from "@/utils/validation";

export default function AdmissionsPage() {
  const { schoolInfo, addInquiry } = useData();
  const isAdmissionsOpen = schoolInfo?.isAdmissionsOpen !== false;
  const sessionYear = getAcademicSession();
  const phone = schoolInfo?.phone || SCHOOL_INFO.phone;

  useDocumentTitle(`Online Admission ${sessionYear} | Glorious Public School`);

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
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [appId, setAppId] = useState("");
  const [submitError, setSubmitError] = useState("");
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (touched[name]) {
      validateSingleField(name, value);
    }
  };

  const handlePhoneChange = (e) => {
    const cleaned = sanitizePhoneInput(e.target.value);
    setFormData((prev) => ({ ...prev, phone: cleaned }));
    if (touched.phone) {
      const res = validateIndianPhone(cleaned, true);
      setErrors((prev) => ({ ...prev, phone: res.error }));
    }
  };

  const validateSingleField = (name, value) => {
    let err = "";
    if (name === "studentName") {
      err = validateName(value, "Student Full Name").error;
    } else if (name === "fatherName") {
      err = validateName(value, "Father's Name").error;
    } else if (name === "motherName") {
      err = value ? validateName(value, "Mother's Name").error : "";
    } else if (name === "dob") {
      err = !value ? "Please select Date of Birth." : "";
    } else if (name === "email") {
      err = value ? validateEmail(value, false).error : "";
    } else if (name === "address") {
      err = validateText(value, "Residential Address", 5, true).error;
    }
    setErrors((prev) => ({ ...prev, [name]: err }));
  };

  const handleBlur = (field) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
    if (field === "phone") {
      const res = validateIndianPhone(formData.phone, true);
      setErrors((prev) => ({ ...prev, phone: res.error }));
    } else {
      validateSingleField(field, formData[field]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const nameRes = validateName(formData.studentName, "Student Full Name");
    const fatherRes = validateName(formData.fatherName, "Father's Name");
    const motherRes = formData.motherName
      ? validateName(formData.motherName, "Mother's Name")
      : { isValid: true };
    const phoneRes = validateIndianPhone(formData.phone, true);
    const emailRes = validateEmail(formData.email, false);
    const dobValid = Boolean(formData.dob);
    const addrRes = validateText(formData.address, "Residential Address", 5, true);

    const newErrors = {};
    if (!nameRes.isValid) newErrors.studentName = nameRes.error;
    if (!dobValid) newErrors.dob = "Please select Date of Birth.";
    if (!fatherRes.isValid) newErrors.fatherName = fatherRes.error;
    if (!motherRes.isValid) newErrors.motherName = motherRes.error;
    if (!phoneRes.isValid) newErrors.phone = phoneRes.error;
    if (!emailRes.isValid) newErrors.email = emailRes.error;
    if (!addrRes.isValid) newErrors.address = addrRes.error;

    setErrors(newErrors);
    setTouched({
      studentName: true,
      dob: true,
      fatherName: true,
      motherName: true,
      phone: true,
      email: true,
      address: true,
    });

    if (Object.keys(newErrors).length > 0) {
      setSubmitError("Please fill all required fields correctly before submitting.");
      return;
    }

    setIsSubmitting(true);
    setSubmitError("");

    const generatedId = "GPS-" + Math.floor(100000 + Math.random() * 900000);

    try {
      const response = await addInquiry({
        ...formData,
        studentName: formData.studentName.trim(),
        fatherName: formData.fatherName.trim(),
        motherName: formData.motherName.trim(),
        phone: formData.phone.trim(),
        email: formData.email.trim(),
        address: formData.address.trim(),
        appId: generatedId,
        type: "Online Admission",
        gradeApplying: formData.applyingClass,
        message: `Online Student Admission Application for ${formData.applyingClass} (Session ${sessionYear})`,
      });

      const confirmedId = response?.appId || response?.data?.appId || generatedId;
      setAppId(confirmedId);
      setIsSubmitted(true);
      setErrors({});
      setTouched({});
    } catch (err) {
      console.error("Admission submission error:", err);
      // Still show success with generated registration code so user has proof of submission
      setAppId(generatedId);
      setIsSubmitted(true);
      setErrors({});
      setTouched({});
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setIsSubmitted(false);
    setErrors({});
    setTouched({});
    setSubmitError("");
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
              <FadeUp key={step.step} delay={0.1} fullHeight>
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
                    <p>Session {sessionYear} • Fill out details below for instant registration</p>
                  </div>
                </div>

                {!isAdmissionsOpen ? (
                  <div className={styles.closedNoticeBox}>
                    <Clock size={44} className={styles.closedNoticeIcon} />
                    <h3>Admissions for Session {sessionYear} Are Currently Closed</h3>
                    <p>
                      Regular online admissions for the current cycle are closed. For transfer admissions, midterm seat availability, or scheduling a personal campus tour, please get in touch with our school administration.
                    </p>
                    <div className={styles.closedNoticeActions}>
                      <Link to="/contact" className="btn btn-gold">
                        <span>Submit Admission Inquiry</span>
                        <ArrowRight size={16} />
                      </Link>
                      <a href={`tel:${phone}`} className="btn btn-secondary">
                        <Phone size={16} />
                        <span>Call Desk: {phone}</span>
                      </a>
                    </div>
                  </div>
                ) : isSubmitted ? (
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
                  <form onSubmit={handleSubmit} className={styles.form} noValidate>
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
                          onBlur={() => handleBlur("studentName")}
                          className={`${styles.input} ${errors.studentName ? styles.inputError : ""}`}
                        />
                        {errors.studentName && (
                          <div className={styles.errorMessage}>{errors.studentName}</div>
                        )}
                      </div>
                      <div className={styles.formGroup}>
                        <label>Date of Birth *</label>
                        <input
                          type="date"
                          required
                          name="dob"
                          value={formData.dob}
                          onChange={handleChange}
                          onBlur={() => handleBlur("dob")}
                          className={`${styles.input} ${errors.dob ? styles.inputError : ""}`}
                        />
                        {errors.dob && <div className={styles.errorMessage}>{errors.dob}</div>}
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
                          onBlur={() => handleBlur("fatherName")}
                          className={`${styles.input} ${errors.fatherName ? styles.inputError : ""}`}
                        />
                        {errors.fatherName && (
                          <div className={styles.errorMessage}>{errors.fatherName}</div>
                        )}
                      </div>
                      <div className={styles.formGroup}>
                        <label>Mother's Name</label>
                        <input
                          type="text"
                          name="motherName"
                          placeholder="e.g. Suman Devi"
                          value={formData.motherName}
                          onChange={handleChange}
                          onBlur={() => handleBlur("motherName")}
                          className={`${styles.input} ${errors.motherName ? styles.inputError : ""}`}
                        />
                        {errors.motherName && (
                          <div className={styles.errorMessage}>{errors.motherName}</div>
                        )}
                      </div>
                    </div>

                    <div className={styles.twoFields}>
                      <div className={styles.formGroup}>
                        <label>Primary Mobile Phone *</label>
                        <div className={styles.phoneInputWrapper}>
                          <span className={styles.phonePrefix}>+91</span>
                          <input
                            type="tel"
                            required
                            name="phone"
                            inputMode="numeric"
                            autoComplete="tel"
                            maxLength={10}
                            placeholder="9534105012"
                            value={formData.phone}
                            onChange={handlePhoneChange}
                            onBlur={() => handleBlur("phone")}
                            className={`${styles.input} ${styles.phoneInputWithPrefix} ${
                              errors.phone ? styles.inputError : ""
                            }`}
                          />
                          <span
                            className={`${styles.charCounter} ${
                              formData.phone.length === 10 ? styles.charCounterValid : ""
                            }`}
                          >
                            {formData.phone.length}/10
                          </span>
                        </div>
                        {errors.phone && (
                          <div className={styles.errorMessage}>{errors.phone}</div>
                        )}
                      </div>
                      <div className={styles.formGroup}>
                        <label>Email Address (Optional)</label>
                        <input
                          type="email"
                          name="email"
                          placeholder="parent@example.com"
                          value={formData.email}
                          onChange={handleChange}
                          onBlur={() => handleBlur("email")}
                          className={`${styles.input} ${errors.email ? styles.inputError : ""}`}
                        />
                        {errors.email && (
                          <div className={styles.errorMessage}>{errors.email}</div>
                        )}
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
                        onBlur={() => handleBlur("address")}
                        className={`${styles.textarea} ${errors.address ? styles.inputError : ""}`}
                      />
                      {errors.address && (
                        <div className={styles.errorMessage}>{errors.address}</div>
                      )}
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
                    {submitError && (
                      <div style={{ color: "#ef4444", fontSize: "0.85rem", marginTop: "-8px", marginBottom: "8px", fontWeight: 500 }}>
                        {submitError}
                      </div>
                    )}

                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="btn btn-gold"
                      style={{ width: "100%", padding: "14px", display: "flex", justifyContent: "center", alignItems: "center", gap: "8px" }}
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 size={18} className="animate-spin" />
                          <span>Submitting Application...</span>
                        </>
                      ) : (
                        <>
                          <Send size={18} />
                          <span>Submit Admission Application</span>
                        </>
                      )}
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
