import { useState, useEffect } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import {
  Lock,
  Mail,
  ArrowRight,
  Eye,
  EyeOff,
  AlertCircle,
  AlertTriangle,
  ShieldAlert,
  ArrowLeft,
  CheckCircle2,
  XCircle,
  Clock,
} from "lucide-react";
import styles from "./AdminLogin.module.css";
import { useAuth } from "@/context/AuthContext";
import useDocumentTitle from "@/hooks/useDocumentTitle";

export default function AdminLogin() {
  useDocumentTitle("Admin Portal Sign In | Glorious Public School");
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [popup, setPopup] = useState({
    show: false,
    type: "success",
    title: "",
    message: "",
    warning: "",
  });

  // Rate Limiter & Lockout state
  const [failedAttempts, setFailedAttempts] = useState(0);
  const [warningMessage, setWarningMessage] = useState("");
  const [isLocked, setIsLocked] = useState(false);
  const [lockedUntil, setLockedUntil] = useState(0);
  const [lockoutCountdown, setLockoutCountdown] = useState(0); // in seconds

  const { login, checkLoginStatus, authError, setAuthError, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || "/admin";

  // If already authenticated, redirect
  if (isAuthenticated && !popup.show) {
    navigate("/admin", { replace: true });
  }

  // Check login status on page mount (checks if current IP is already locked or has warnings)
  useEffect(() => {
    let mounted = true;
    if (typeof checkLoginStatus === "function") {
      checkLoginStatus().then((status) => {
        if (!mounted || !status) return;
        if (status.isLocked) {
          setIsLocked(true);
          setLockedUntil(status.lockedUntil || 0);
          setLockoutCountdown(
            status.remainingSeconds || Math.max(0, Math.ceil(((status.lockedUntil || 0) - Date.now()) / 1000))
          );
          setFailedAttempts(status.failedAttempts || 5);
        } else {
          setIsLocked(false);
          setFailedAttempts(status.failedAttempts || 0);
          if (status.warning) {
            setWarningMessage(status.warning);
          }
        }
      });
    }
    return () => {
      mounted = false;
    };
  }, [checkLoginStatus]);

  // Live countdown timer for active lockout
  useEffect(() => {
    if (!isLocked || lockedUntil <= 0) return;

    const tick = () => {
      const remaining = Math.max(0, Math.ceil((lockedUntil - Date.now()) / 1000));
      setLockoutCountdown(remaining);
      if (remaining <= 0) {
        setIsLocked(false);
        setLockedUntil(0);
        setFailedAttempts(0);
        setWarningMessage("");
      }
    };

    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [isLocked, lockedUntil]);

  // Format seconds to mm:ss
  const formatCountdown = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isLocked) {
      setPopup({
        show: true,
        type: "blocked",
        title: "Access Temporarily Blocked",
        message: `Your IP has been locked due to exceeding 4 failed login attempts. Please wait ${formatCountdown(
          lockoutCountdown
        )} before attempting to sign in again.`,
        warning: "",
      });
      return;
    }

    setLoading(true);
    setAuthError("");

    try {
      const res = await login(identifier, password);
      setLoading(false);

      if (res.success) {
        setFailedAttempts(0);
        setWarningMessage("");
        setIsLocked(false);
        setPopup({
          show: true,
          type: "success",
          title: "Access Granted",
          message: "Welcome back, Administrator. Redirecting to your dashboard...",
          warning: "",
        });
        setTimeout(() => {
          navigate(from, { replace: true });
        }, 1200);
      } else {
        const attempts = res.failedAttempts || failedAttempts + 1;
        setFailedAttempts(attempts);

        if (res.isLocked) {
          // Blocked! User entered more than 4 times
          setIsLocked(true);
          const until = res.lockedUntil || Date.now() + 15 * 60 * 1000;
          setLockedUntil(until);
          const secs = res.remainingSeconds || Math.max(0, Math.ceil((until - Date.now()) / 1000));
          setLockoutCountdown(secs);
          setWarningMessage("");

          setPopup({
            show: true,
            type: "blocked",
            title: "Access Blocked (Rate Limit Exceeded)",
            message:
              res.error ||
              "You have entered incorrect credentials more than 4 times. For security, your IP has been temporarily locked for 15 minutes.",
            warning: "",
          });
        } else if (attempts >= 2) {
          // Warning triggered after entering 2 times!
          const warnText =
            res.warning ||
            `Warning: ${attempts} failed login attempts. If you fail more than 4 times, your IP will be temporarily blocked. (${Math.max(
              0,
              4 - attempts
            )} attempt${4 - attempts === 1 ? "" : "s"} remaining)`;
          setWarningMessage(warnText);

          setPopup({
            show: true,
            type: "warning",
            title: `Security Warning (Attempt ${attempts} of 4)`,
            message: res.error || "Invalid username/email or password.",
            warning: warnText,
          });
        } else {
          // Normal error (attempt 1)
          setPopup({
            show: true,
            type: "error",
            title: "Authentication Failed",
            message:
              res.error || "The email/username or password you entered is incorrect. Please verify and try again.",
            warning: "",
          });
        }
      }
    } catch (err) {
      setLoading(false);
      setPopup({
        show: true,
        type: "error",
        title: "Connection Error",
        message: "Unable to reach the server. Please check your network and try again.",
        warning: "",
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

        {/* Lockout Banner */}
        {isLocked && (
          <div className={styles.lockedBanner}>
            <div className={styles.lockedHeader}>
              <ShieldAlert size={19} />
              <span>Access Temporarily Blocked</span>
            </div>
            <p className={styles.lockedText}>
              You have entered incorrect credentials more than 4 times. For security, sign-in is locked from your IP.
            </p>
            <div className={styles.lockedTimerRow}>
              <Clock size={15} />
              <span>Cooldown Remaining: </span>
              <strong className={styles.lockedTimer}>{formatCountdown(lockoutCountdown)}</strong>
            </div>
          </div>
        )}

        {/* Warning Banner (Triggers after entering 2 times) */}
        {!isLocked && warningMessage && (
          <div className={styles.warningBanner}>
            <AlertTriangle size={18} className={styles.warningIconInline} />
            <div>
              <strong>Security Warning:</strong> {warningMessage}
            </div>
          </div>
        )}

        {/* Standard Auth Error (if not already in warning or locked) */}
        {!isLocked && !warningMessage && authError && (
          <div className={styles.errorBanner}>
            <AlertCircle size={16} />
            <span>{authError}</span>
          </div>
        )}

        {/* Attempt tracker info pill */}
        {!isLocked && failedAttempts > 0 && (
          <div className={styles.attemptTracker}>
            <span>
              Failed Attempts: <strong>{failedAttempts} / 4</strong>
            </span>
            <span className={styles.attemptSub}>(Blocked if &gt; 4)</span>
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
                disabled={isLocked}
                placeholder="Enter email or username"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                className={`${styles.input} ${isLocked ? styles.inputDisabled : ""}`}
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
                disabled={isLocked}
                placeholder="Enter password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={`${styles.input} ${isLocked ? styles.inputDisabled : ""}`}
              />
              <button
                type="button"
                className={styles.togglePassBtn}
                onClick={() => setShowPassword(!showPassword)}
                tabIndex={-1}
                disabled={isLocked}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <div className={styles.formRow}>
            <label className={styles.rememberMe}>
              <input type="checkbox" defaultChecked disabled={isLocked} />
              <span>Keep me signed in</span>
            </label>
          </div>

          <button
            type="submit"
            disabled={loading || isLocked}
            className={`${styles.submitBtn} ${isLocked ? styles.submitBtnLocked : ""}`}
          >
            {isLocked ? (
              <>
                <Lock size={18} />
                <span>Access Blocked ({formatCountdown(lockoutCountdown)})</span>
              </>
            ) : (
              <>
                <span>{loading ? "Authenticating..." : "Sign In to Admin Panel"}</span>
                <ArrowRight size={18} />
              </>
            )}
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
              popup.type === "success"
                ? styles.popupSuccess
                : popup.type === "warning"
                ? styles.popupWarning
                : popup.type === "blocked"
                ? styles.popupBlocked
                : styles.popupError
            }`}
          >
            <div
              className={`${styles.popupIconWrap} ${
                popup.type === "success"
                  ? styles.successIcon
                  : popup.type === "warning"
                  ? styles.warningIcon
                  : popup.type === "blocked"
                  ? styles.blockedIcon
                  : styles.errorIcon
              }`}
            >
              {popup.type === "success" ? (
                <CheckCircle2 size={36} />
              ) : popup.type === "warning" ? (
                <AlertTriangle size={36} />
              ) : popup.type === "blocked" ? (
                <ShieldAlert size={36} />
              ) : (
                <XCircle size={36} />
              )}
            </div>

            <h3 className={styles.popupTitle}>{popup.title}</h3>
            <p className={styles.popupDesc}>{popup.message}</p>

            {popup.warning && (
              <div className={styles.popupWarningBox}>
                <div style={{ display: "flex", gap: "8px", alignItems: "flex-start" }}>
                  <AlertTriangle size={16} style={{ flexShrink: 0, marginTop: "2px" }} />
                  <span>{popup.warning}</span>
                </div>
              </div>
            )}

            {popup.type === "success" ? (
              <div className={styles.loaderBar}>
                <div className={styles.loaderProgress} />
              </div>
            ) : popup.type === "warning" ? (
              <div className={styles.popupActions}>
                <button
                  type="button"
                  className={styles.warningActionBtn}
                  onClick={() => setPopup({ ...popup, show: false })}
                >
                  Understood & Try Again
                </button>
              </div>
            ) : popup.type === "blocked" ? (
              <div className={styles.popupActions}>
                <button
                  type="button"
                  className={styles.secondaryActionBtn}
                  onClick={() => setPopup({ ...popup, show: false })}
                >
                  Close Notification
                </button>
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
