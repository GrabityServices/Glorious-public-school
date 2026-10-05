import { useState } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { Lock, Mail, ArrowRight, Eye, EyeOff, AlertCircle, ArrowLeft, CheckCircle2, XCircle } from "lucide-react";
import styles from "./AdminLogin.module.css";
import { useAuth } from "@/context/AuthContext";
import useDocumentTitle from "@/hooks/useDocumentTitle";

export default function AdminLogin() {
  useDocumentTitle("Admin Portal Sign In | Glorious Public School");
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [popup, setPopup] = useState({ show: false, type: "success", title: "", message: "" });

  const { login, authError, setAuthError, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || "/admin";

  // If already authenticated, redirect
  if (isAuthenticated && !popup.show) {
    navigate("/admin", { replace: true });
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setAuthError("");

    try {
      const res = await login(identifier, password);
      setLoading(false);
      if (res.success) {
        setPopup({
          show: true,
          type: "success",
          title: "Access Granted",
          message: "Welcome back, Administrator. Redirecting to your dashboard..."
        });
        setTimeout(() => {
          navigate(from, { replace: true });
        }, 1200);
      } else {
        setPopup({
          show: true,
          type: "error",
          title: "Authentication Failed",
          message: res.error || "The email/username or password you entered is incorrect. Please verify and try again."
        });
      }
    } catch (err) {
      setLoading(false);
      setPopup({
        show: true,
        type: "error",
        title: "Connection Error",
        message: "Unable to reach the server. Please check your network and try again."
      });
    }
  };

  return (
    <div className={styles.loginPage}>
      <div className={styles.loginCard}>
        <div className={styles.cardHeader}>
          <div className={styles.logoWrap}>
            <img
              src="/images/glorious-public-school.png"
              alt="Glorious Public School Logo"
              className={styles.loginLogoImg}
            />
          </div>
          <h1 className={styles.title}>Admin Access</h1>
          <p className={styles.subtitle}>Glorious Public School Management Panel</p>
        </div>

        {authError && (
          <div className={styles.errorBanner}>
            <AlertCircle size={16} />
            <span>{authError}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.formGroup}>
            <label className={styles.label}>Admin Email or Username</label>
            <div className={styles.inputWrapper}>
              <Mail size={18} className={styles.inputIcon} />
              <input
                type="text"
                required
                placeholder="Enter email or username"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                className={styles.input}
              />
            </div>
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>Password</label>
            <div className={styles.inputWrapper}>
              <Lock size={18} className={styles.inputIcon} />
              <input
                type={showPassword ? "text" : "password"}
                required
                placeholder="Enter password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={styles.input}
              />
              <button
                type="button"
                className={styles.togglePassBtn}
                onClick={() => setShowPassword(!showPassword)}
                tabIndex={-1}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <div className={styles.formRow}>
            <label className={styles.rememberMe}>
              <input type="checkbox" defaultChecked />
              <span>Keep me signed in</span>
            </label>
          </div>

          <button type="submit" disabled={loading} className={styles.submitBtn}>
            <span>{loading ? "Authenticating..." : "Sign In to Admin Panel"}</span>
            <ArrowRight size={18} />
          </button>
        </form>

        <div className={styles.footerNote}>
          <Link to="/" className={styles.backLink}>
            <ArrowLeft size={16} />
            <span>Back to School Website</span>
          </Link>
        </div>
      </div>

      {/* Modern Animated Popup Modal */}
      {popup.show && (
        <div className={styles.popupBackdrop} data-lenis-prevent="true">
          <div
            className={`${styles.popupCard} ${
              popup.type === "success" ? styles.popupSuccess : styles.popupError
            }`}
          >
            <div
              className={`${styles.popupIconWrap} ${
                popup.type === "success" ? styles.successIcon : styles.errorIcon
              }`}
            >
              {popup.type === "success" ? (
                <CheckCircle2 size={36} />
              ) : (
                <XCircle size={36} />
              )}
            </div>

            <h3 className={styles.popupTitle}>{popup.title}</h3>
            <p className={styles.popupDesc}>{popup.message}</p>

            {popup.type === "success" ? (
              <div className={styles.loaderBar}>
                <div className={styles.loaderProgress} />
              </div>
            ) : (
              <div className={styles.popupActions}>
                <button
                  type="button"
                  className={styles.primaryActionBtn}
                  onClick={() => setPopup({ ...popup, show: false })}
                >
                  Try Again
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
