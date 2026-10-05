import { useState, useMemo } from "react";
import {
  ShieldCheck,
  Key,
  Lock,
  UserCheck,
  Eye,
  EyeOff,
  Server,
  Clock,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  ShieldAlert,
  Sparkles,
  Info,
  Check,
} from "lucide-react";
import styles from "./AdminSecurity.module.css";
import { useAuth } from "@/context/AuthContext";
import useDocumentTitle from "@/hooks/useDocumentTitle";

export default function AdminSecurity() {
  useDocumentTitle("Admin & Security Center | Glorious Admin");
  const { adminUser, changePassword } = useAuth();

  const [toast, setToast] = useState("");
  const [passForm, setPassForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [showPass, setShowPass] = useState({
    current: false,
    new: false,
    confirm: false,
  });
  const [loading, setLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState({ type: "", text: "" });

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(""), 3500);
  };

  // Real-time password criteria validation
  const validation = useMemo(() => {
    const pwd = passForm.newPassword;
    const hasMinLength = pwd.length >= 8;
    const hasLower = /[a-z]/.test(pwd);
    const hasUpper = /[A-Z]/.test(pwd);
    const hasNumber = /[0-9]/.test(pwd);
    const hasSpecial = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?`~]/.test(pwd);

    let score = 0;
    if (hasMinLength) score++;
    if (hasLower) score++;
    if (hasUpper) score++;
    if (hasNumber) score++;
    if (hasSpecial) score++;

    let strengthLabel = "Too Weak";
    let strengthColor = "#ef4444";
    if (score === 2) {
      strengthLabel = "Fair";
      strengthColor = "#f97316";
    } else if (score === 3) {
      strengthLabel = "Moderate";
      strengthColor = "#f59e0b";
    } else if (score === 4) {
      strengthLabel = "Strong";
      strengthColor = "#3b82f6";
    } else if (score === 5) {
      strengthLabel = "Bulletproof";
      strengthColor = "#10b981";
    }

    const isMatch =
      passForm.confirmPassword.length > 0 &&
      passForm.newPassword === passForm.confirmPassword;

    const isAllValid = hasMinLength && hasLower && hasUpper && hasNumber && hasSpecial;

    return {
      hasMinLength,
      hasLower,
      hasUpper,
      hasNumber,
      hasSpecial,
      score,
      percentage: (score / 5) * 100,
      strengthLabel,
      strengthColor,
      isMatch,
      isAllValid,
    };
  }, [passForm.newPassword, passForm.confirmPassword]);

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setStatusMessage({ type: "", text: "" });

    if (!passForm.currentPassword) {
      setStatusMessage({ type: "error", text: "Please enter your current administrator password." });
      return;
    }

    if (!validation.isAllValid) {
      setStatusMessage({
        type: "error",
        text: "Please satisfy all password complexity rules: minimum 8 characters, at least 1 lowercase letter, 1 uppercase letter, 1 number, and 1 special symbol.",
      });
      return;
    }

    if (passForm.newPassword !== passForm.confirmPassword) {
      setStatusMessage({ type: "error", text: "New password and confirmation do not match." });
      return;
    }

    setLoading(true);
    try {
      const res = await changePassword(
        passForm.currentPassword,
        passForm.newPassword,
        passForm.confirmPassword
      );
      setLoading(false);
      if (res.success) {
        setStatusMessage({
          type: "success",
          text: res.message || "Password updated successfully! Your account is now secured.",
        });
        setPassForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
        showToast("Password updated successfully!");
      } else {
        setStatusMessage({ type: "error", text: res.error || "Failed to update password." });
      }
    } catch (err) {
      setLoading(false);
      setStatusMessage({ type: "error", text: "Connection error. Please try again." });
    }
  };

  return (
    <div className={styles.pageWrapper}>
      {/* Toast Alert */}
      {toast && (
        <div className={styles.toastAlert}>
          <CheckCircle2 size={18} />
          <span>{toast}</span>
        </div>
      )}

      {/* Header Banner */}
      <div className={styles.headerCard}>
        <div className={styles.headerInfo}>
          <div className={styles.headerIconBox}>
            <ShieldCheck size={28} />
          </div>
          <div>
            <h1 className={styles.headerTitle}>Admin Profile & Security Center</h1>
            <p className={styles.headerSubtitle}>
              Manage administrator authentication credentials, password complexity rules, and active security shields.
            </p>
          </div>
        </div>
      </div>

      {/* Executive Security Overview Card */}
      <div className={styles.heroSecurityCard}>
        <div className={styles.adminProfileHeader}>
          <div className={styles.avatarLarge}>
            {adminUser?.avatar ? (
              <img src={adminUser.avatar} alt={adminUser.name} className={styles.avatarImg} />
            ) : (
              <span>{adminUser?.name ? adminUser.name.charAt(0) : "A"}</span>
            )}
            <span className={styles.avatarStatusDot} />
          </div>
          <div className={styles.adminProfileDetails}>
            <div className={styles.adminBadgeRow}>
              <span className={styles.roleBadge}>{adminUser?.role || "Super Administrator"}</span>
              <span className={styles.verifiedBadge}>
                <CheckCircle2 size={13} /> Active Admin Account
              </span>
            </div>
            <h2 className={styles.adminName}>{adminUser?.name || "Mrs. Binod Kumar"}</h2>
            <p className={styles.adminEmail}>
              <UserCheck size={15} />
              <span>Username / Email: <strong>{adminUser?.email || adminUser?.username || "admin@glorious.edu"}</strong></span>
            </p>
          </div>
        </div>

        {/* 4 Pillars of Defense */}
        <div className={styles.securityPillarsGrid}>
          <div className={styles.pillarCard}>
            <div className={`${styles.pillarIcon} ${styles.iconEmerald}`}>
              <ShieldCheck size={20} />
            </div>
            <div className={styles.pillarInfo}>
              <span className={styles.pillarLabel}>Encryption Standard</span>
              <strong className={styles.pillarValue}>bcrypt (12 Rounds)</strong>
            </div>
          </div>

          <div className={styles.pillarCard}>
            <div className={`${styles.pillarIcon} ${styles.iconAmber}`}>
              <Key size={20} />
            </div>
            <div className={styles.pillarInfo}>
              <span className={styles.pillarLabel}>Session Protocol</span>
              <strong className={styles.pillarValue}>Signed JWT (256-Bit)</strong>
            </div>
          </div>

          <div className={styles.pillarCard}>
            <div className={`${styles.pillarIcon} ${styles.iconBlue}`}>
              <Clock size={20} />
            </div>
            <div className={styles.pillarInfo}>
              <span className={styles.pillarLabel}>Auto-Logout Inactivity</span>
              <strong className={styles.pillarValue}>Strict 1-Hour Timeout</strong>
            </div>
          </div>

          <div className={styles.pillarCard}>
            <div className={`${styles.pillarIcon} ${styles.iconPurple}`}>
              <Server size={20} />
            </div>
            <div className={styles.pillarInfo}>
              <span className={styles.pillarLabel}>Brute-Force Lockout</span>
              <strong className={styles.pillarValue}>5 Attempts / 15 Mins</strong>
            </div>
          </div>
        </div>
      </div>

      {/* Main Two Column Form Grid */}
      <div className={styles.mainGrid}>
        {/* Left Column: Change Password Form */}
        <div className={styles.formCard}>
          <div className={styles.formCardHeader}>
            <h3 className={styles.cardTitle}>
              <Lock size={19} color="#dc2626" />
              <span>Update Administrator Password</span>
            </h3>
            <p className={styles.cardSubtitle}>
              Set a new strong password requiring uppercase, lowercase, numbers, and special symbols.
            </p>
          </div>

          {statusMessage.text && (
            <div
              className={`${styles.statusBanner} ${
                statusMessage.type === "success" ? styles.statusSuccess : styles.statusError
              }`}
            >
              {statusMessage.type === "success" ? (
                <CheckCircle2 size={18} />
              ) : (
                <AlertTriangle size={18} />
              )}
              <span>{statusMessage.text}</span>
            </div>
          )}

          <form onSubmit={handleChangePassword} className={styles.passwordForm}>
            {/* Current Password */}
            <div className={styles.formGroup}>
              <label>Current Administrator Password *</label>
              <div className={styles.inputWrapper}>
                <Lock size={17} className={styles.fieldIcon} />
                <input
                  type={showPass.current ? "text" : "password"}
                  required
                  placeholder="Enter current password"
                  value={passForm.currentPassword}
                  onChange={(e) =>
                    setPassForm({ ...passForm, currentPassword: e.target.value })
                  }
                  className={styles.inputField}
                />
                <button
                  type="button"
                  className={styles.eyeBtn}
                  onClick={() => setShowPass({ ...showPass, current: !showPass.current })}
                  tabIndex={-1}
                  aria-label="Toggle password visibility"
                >
                  {showPass.current ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* New Password */}
            <div className={styles.formGroup}>
              <label>New Strong Password *</label>
              <div className={styles.inputWrapper}>
                <Key size={17} className={styles.fieldIcon} />
                <input
                  type={showPass.new ? "text" : "password"}
                  required
                  placeholder="Enter new password (min. 8 characters)"
                  value={passForm.newPassword}
                  onChange={(e) =>
                    setPassForm({ ...passForm, newPassword: e.target.value })
                  }
                  className={styles.inputField}
                />
                <button
                  type="button"
                  className={styles.eyeBtn}
                  onClick={() => setShowPass({ ...showPass, new: !showPass.new })}
                  tabIndex={-1}
                  aria-label="Toggle password visibility"
                >
                  {showPass.new ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>

              {/* Password Strength Meter */}
              {passForm.newPassword.length > 0 && (
                <div className={styles.strengthMeterBox}>
                  <div className={styles.strengthMeterHeader}>
                    <span>Password Strength:</span>
                    <strong style={{ color: validation.strengthColor }}>
                      {validation.strengthLabel}
                    </strong>
                  </div>
                  <div className={styles.strengthBarBg}>
                    <div
                      className={styles.strengthBarFill}
                      style={{
                        width: `${validation.percentage}%`,
                        backgroundColor: validation.strengthColor,
                      }}
                    />
                  </div>
                </div>
              )}

              {/* Complexity Requirements Checklist */}
              <div className={styles.checklistCard}>
                <div className={styles.checklistTitle}>
                  <Sparkles size={14} /> Password Policy Requirements:
                </div>
                <ul className={styles.checklist}>
                  <li className={validation.hasMinLength ? styles.validItem : styles.invalidItem}>
                    {validation.hasMinLength ? <Check size={14} /> : <XCircle size={14} />}
                    <span>At least <strong>8 characters</strong></span>
                  </li>
                  <li className={validation.hasLower ? styles.validItem : styles.invalidItem}>
                    {validation.hasLower ? <Check size={14} /> : <XCircle size={14} />}
                    <span>At least one <strong>lowercase letter (a-z)</strong></span>
                  </li>
                  <li className={validation.hasUpper ? styles.validItem : styles.invalidItem}>
                    {validation.hasUpper ? <Check size={14} /> : <XCircle size={14} />}
                    <span>At least one <strong>uppercase letter (A-Z)</strong></span>
                  </li>
                  <li className={validation.hasNumber ? styles.validItem : styles.invalidItem}>
                    {validation.hasNumber ? <Check size={14} /> : <XCircle size={14} />}
                    <span>At least one <strong>number (0-9)</strong></span>
                  </li>
                  <li className={validation.hasSpecial ? styles.validItem : styles.invalidItem}>
                    {validation.hasSpecial ? <Check size={14} /> : <XCircle size={14} />}
                    <span>At least one <strong>special symbol (!@#$%^&*...)</strong></span>
                  </li>
                </ul>
              </div>
            </div>

            {/* Confirm New Password */}
            <div className={styles.formGroup}>
              <label>Confirm New Password *</label>
              <div className={styles.inputWrapper}>
                <Lock size={17} className={styles.fieldIcon} />
                <input
                  type={showPass.confirm ? "text" : "password"}
                  required
                  placeholder="Re-type new password"
                  value={passForm.confirmPassword}
                  onChange={(e) =>
                    setPassForm({ ...passForm, confirmPassword: e.target.value })
                  }
                  className={`${styles.inputField} ${
                    passForm.confirmPassword.length > 0
                      ? validation.isMatch
                        ? styles.inputValid
                        : styles.inputInvalid
                      : ""
                  }`}
                />
                <button
                  type="button"
                  className={styles.eyeBtn}
                  onClick={() => setShowPass({ ...showPass, confirm: !showPass.confirm })}
                  tabIndex={-1}
                  aria-label="Toggle password visibility"
                >
                  {showPass.confirm ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {passForm.confirmPassword.length > 0 && (
                <div
                  className={
                    validation.isMatch ? styles.matchNoteSuccess : styles.matchNoteError
                  }
                >
                  {validation.isMatch ? (
                    <>
                      <CheckCircle2 size={13} /> Passwords match
                    </>
                  ) : (
                    <>
                      <XCircle size={13} /> Passwords do not match yet
                    </>
                  )}
                </div>
              )}
            </div>

            <button
              type="submit"
              disabled={loading || !validation.isAllValid || !validation.isMatch}
              className={styles.submitBtn}
            >
              <ShieldCheck size={18} />
              <span>{loading ? "Encrypting & Updating..." : "Update Password & Secure Account"}</span>
            </button>
          </form>
        </div>

        {/* Right Column: Security Guidelines & Policy Info */}
        <div className={styles.sideInfoCol}>
          {/* Inactivity Policy Card */}
          <div className={styles.policyCard}>
            <div className={styles.policyCardHeader}>
              <Clock size={20} color="#0284c7" />
              <h4>1-Hour Session Timeout</h4>
            </div>
            <p>
              For institutional safety, every active administrator session automatically expires after <strong>60 minutes (1 hour)</strong>. When expired, the system will securely sign you out and prompt you to log in again.
            </p>
            <div className={styles.tipBox}>
              <Info size={16} />
              <span>Unsaved forms will warn you before departure. Save your work regularly.</span>
            </div>
          </div>

          {/* Brute-Force Rate Limiting */}
          <div className={styles.policyCard}>
            <div className={styles.policyCardHeader}>
              <ShieldAlert size={20} color="#dc2626" />
              <h4>Brute-Force Defense Active</h4>
            </div>
            <p>
              Your sign-in endpoint is defended by IP rate limiting. If anyone attempts to enter 5 incorrect passwords consecutively, access from that IP is locked for 15 minutes.
            </p>
          </div>

          {/* Database Cluster Security */}
          <div className={styles.policyCard}>
            <div className={styles.policyCardHeader}>
              <Server size={20} color="#059669" />
              <h4>MongoDB Atlas Cloud Encryption</h4>
            </div>
            <p>
              All school records, notices, events, and inquiries are protected by TLS 1.3 in-transit and AES-256 encryption-at-rest within MongoDB Atlas.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
