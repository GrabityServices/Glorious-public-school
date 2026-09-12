import { useState } from "react";
import { Link } from "react-router-dom";
import { Lock, User, GraduationCap, ArrowRight, ShieldCheck } from "lucide-react";
import styles from "./login.module.css";
import FadeUp from "@/components/motion/FadeUp";
import useDocumentTitle from "@/hooks/useDocumentTitle";
import { SCHOOL_INFO } from "@/data/schoolData";

export default function LoginPage() {
  useDocumentTitle("Student & Parent Portal Login | Glorious Public School");
  const [role, setRole] = useState("student");
  const [regNo, setRegNo] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");

  const handleLogin = (e) => {
    e.preventDefault();
    if (regNo && password) {
      setMessage("Connecting to School ERP Portal... Redirecting to dashboard.");
      setTimeout(() => {
        setMessage("Portal authentication active. Welcome to Glorious ERP!");
      }, 1500);
    }
  };

  return (
    <div className={styles.pageWrapper}>
      <section className={styles.section}>
        <div className={styles.container}>
          <FadeUp>
            <div className={styles.loginCard}>
              <div className={styles.headerArea}>
                <div className={styles.logoBadge}>
                  <GraduationCap size={28} color="#fef08a" />
                </div>
                <h2>Glorious Public School</h2>
                <p>Student & Parent Management System</p>
              </div>

              {/* Role Toggle */}
              <div className={styles.roleToggle}>
                <button
                  type="button"
                  onClick={() => setRole("student")}
                  className={`${styles.roleBtn} ${
                    role === "student" ? styles.roleActive : ""
                  }`}
                >
                  Student Portal
                </button>
                <button
                  type="button"
                  onClick={() => setRole("parent")}
                  className={`${styles.roleBtn} ${
                    role === "parent" ? styles.roleActive : ""
                  }`}
                >
                  Parent Portal
                </button>
                <button
                  type="button"
                  onClick={() => setRole("staff")}
                  className={`${styles.roleBtn} ${
                    role === "staff" ? styles.roleActive : ""
                  }`}
                >
                  Staff Login
                </button>
              </div>

              {message && <div className={styles.infoBanner}>{message}</div>}

              <form onSubmit={handleLogin} className={styles.form}>
                <div className={styles.formGroup}>
                  <label>
                    {role === "student"
                      ? "Admission / Registration No. *"
                      : role === "parent"
                      ? "Registered Mobile No. / Parent ID *"
                      : "Staff Employee Code *"}
                  </label>
                  <div className={styles.inputWrap}>
                    <User size={18} className={styles.inputIcon} />
                    <input
                      type="text"
                      required
                      placeholder={
                        role === "student"
                          ? "e.g. GPS/2026/042"
                          : role === "parent"
                          ? "10-digit mobile number"
                          : "EMP-014"
                      }
                      value={regNo}
                      onChange={(e) => setRegNo(e.target.value)}
                      className={styles.input}
                    />
                  </div>
                </div>

                <div className={styles.formGroup}>
                  <label>Password / Date of Birth *</label>
                  <div className={styles.inputWrap}>
                    <Lock size={18} className={styles.inputIcon} />
                    <input
                      type="password"
                      required
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className={styles.input}
                    />
                  </div>
                </div>

                <div className={styles.formRow}>
                  <label className={styles.rememberMe}>
                    <input type="checkbox" defaultChecked />
                    <span>Remember credentials</span>
                  </label>
                  <a href={`tel:${SCHOOL_INFO.phone}`} className={styles.forgotLink}>
                    Forgot Password?
                  </a>
                </div>

                <button type="submit" className="btn btn-primary" style={{ width: "100%", marginTop: "8px" }}>
                  <span>Sign In to Dashboard</span>
                  <ArrowRight size={16} />
                </button>
              </form>

              <div className={styles.footerNote}>
                <ShieldCheck size={16} />
                <span>Need admission registration? <Link to="/admissions">Apply Online Here</Link></span>
              </div>
            </div>
          </FadeUp>
        </div>
      </section>
    </div>
  );
}
