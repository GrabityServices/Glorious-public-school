import { useState, useEffect } from "react";
import {
  Settings,
  Award,
  Phone,
  Mail,
  MapPin,
  AlertTriangle,
  CheckCircle,
  RefreshCw,
  Save,
} from "lucide-react";
import styles from "./AdminSettings.module.css";
import { useData } from "@/context/DataContext";
import { useConfirm } from "@/context/ConfirmContext";
import useDocumentTitle from "@/hooks/useDocumentTitle";

export default function AdminSettings() {
  useDocumentTitle("School Information & Stats | Glorious Admin");
  const { schoolInfo, updateSchoolInfo, updateStat, resetToDefaults } = useData();
  const confirm = useConfirm();

  const [toast, setToast] = useState("");

  // Local state for school stats
  const [stats, setStats] = useState(() => schoolInfo.stats || []);

  // Local state for contact & notices
  const [contactForm, setContactForm] = useState({
    phone: schoolInfo.phone || "",
    phoneAlt: schoolInfo.phoneAlt || "",
    email: schoolInfo.email || "",
    address: schoolInfo.address || "",
    admissionNotice: schoolInfo.admissionNotice || "",
    showAdmissionNotice: schoolInfo.showAdmissionNotice !== false,
  });

  // Sync state when schoolInfo is updated from MongoDB
  useEffect(() => {
    if (schoolInfo) {
      if (schoolInfo.stats) setStats(schoolInfo.stats);
      setContactForm({
        phone: schoolInfo.phone || "",
        phoneAlt: schoolInfo.phoneAlt || "",
        email: schoolInfo.email || "",
        address: schoolInfo.address || "",
        admissionNotice: schoolInfo.admissionNotice || "",
        showAdmissionNotice: schoolInfo.showAdmissionNotice !== false,
      });
    }
  }, [schoolInfo]);

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(""), 3500);
  };

  // Instant toggle switch handler for Top Announcement Banner (updates immediately with no refresh needed)
  const handleToggleShowNotice = async (checked) => {
    setContactForm((prev) => ({
      ...prev,
      showAdmissionNotice: checked,
    }));
    await updateSchoolInfo({
      showAdmissionNotice: checked,
    });
    showToast(
      checked
        ? "Announcement banner is ON — now showing live on website!"
        : "Announcement banner is OFF — now hidden from website."
    );
  };

  const handleStatChange = (index, value) => {
    const newStats = [...stats];
    newStats[index] = { ...newStats[index], value };
    setStats(newStats);
  };

  const handleSaveStats = (e) => {
    e.preventDefault();
    stats.forEach((stat, idx) => {
      updateStat(idx, stat);
    });
    showToast("School stats updated. Changes are now live on the homepage!");
  };

  const handleSaveContact = (e) => {
    e.preventDefault();
    updateSchoolInfo(contactForm);
    showToast("School contact and announcement banner updated!");
  };

  const handleResetData = async () => {
    const confirmed = await confirm({
      title: "Reset Website Data",
      message: "Are you sure you want to restore all notices, events, faculty members, and statistics back to factory defaults? Any custom added records will be overwritten.",
      confirmText: "Yes, Reset All Data",
      cancelText: "Cancel",
      variant: "danger",
    });
    if (confirmed) {
      resetToDefaults();
      setStats(schoolInfo.stats);
      showToast("All data successfully reset to factory defaults.");
    }
  };

  return (
    <div className={styles.pageWrapper}>
      {/* Toast Alert */}
      {toast && (
        <div className={styles.toastAlert}>
          <CheckCircle size={18} />
          <span>{toast}</span>
        </div>
      )}

      {/* 1. School Key Stats (Milestones) */}
      <div className={styles.sectionCard}>
        <div className={styles.sectionHeader}>
          <h3 className={styles.sectionTitle}>
            <Award size={20} color="#dc2626" />
            <span>Homepage Milestone Stats</span>
          </h3>
          <p className={styles.sectionSubtitle}>
            These 6 milestone figures appear on the website homepage. Editing them here instantly updates the live numbers.
          </p>
        </div>

        <form onSubmit={handleSaveStats}>
          <div className={styles.statsGrid}>
            {stats.map((stat, idx) => (
              <div key={stat.label} className={styles.statItemBox}>
                <label>{stat.label}</label>
                <input
                  type="text"
                  value={stat.value}
                  onChange={(e) => handleStatChange(idx, e.target.value)}
                  className={styles.statInput}
                />
              </div>
            ))}
          </div>

          <button type="submit" className={styles.saveBtn}>
            <Save size={16} style={{ display: "inline", marginRight: 6, verticalAlign: "middle" }} />
            <span>Save Milestone Stats</span>
          </button>
        </form>
      </div>

      {/* 2. School Contact Information & Announcement */}
      <div className={styles.sectionCard}>
        <div className={styles.sectionHeader}>
          <h3 className={styles.sectionTitle}>
            <Phone size={20} color="#dc2626" />
            <span>School Contact & Admission Ticker</span>
          </h3>
          <p className={styles.sectionSubtitle}>
            Update official telephone numbers, email address, campus location, and the top announcement banner.
          </p>
        </div>

        <form onSubmit={handleSaveContact}>
          <div className={styles.formGrid}>
            <div className={styles.formGroup}>
              <label>Primary Phone Number</label>
              <input
                type="text"
                value={contactForm.phone}
                onChange={(e) => setContactForm({ ...contactForm, phone: e.target.value })}
              />
            </div>

            <div className={styles.formGroup}>
              <label>Alternate Phone / WhatsApp</label>
              <input
                type="text"
                value={contactForm.phoneAlt}
                onChange={(e) => setContactForm({ ...contactForm, phoneAlt: e.target.value })}
              />
            </div>

            <div className={styles.formGroup}>
              <label>Official Email</label>
              <input
                type="email"
                value={contactForm.email}
                onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
              />
            </div>

            <div className={styles.formGroup}>
              <label>Campus Address</label>
              <input
                type="text"
                value={contactForm.address}
                onChange={(e) => setContactForm({ ...contactForm, address: e.target.value })}
              />
            </div>

            <div className={`${styles.formGroup} ${styles.fullRow}`}>
              <label>Top Admission Ticker / Announcement Banner</label>
              <textarea
                rows={2}
                value={contactForm.admissionNotice}
                onChange={(e) =>
                  setContactForm({ ...contactForm, admissionNotice: e.target.value })
                }
                placeholder="Enter announcement text to scroll in the header..."
              />

              {/* Small toggle control below the textarea */}
              <div className={styles.smallToggleBox}>
                <div className={styles.smallToggleInfo}>
                  <div className={styles.smallToggleTitleRow}>
                    <strong className={styles.smallToggleTitle}>Show Announcement Banner on Website</strong>
                    <span
                      className={
                        contactForm.showAdmissionNotice
                          ? styles.pillShow
                          : styles.pillHide
                      }
                    >
                      {contactForm.showAdmissionNotice ? (
                        <>
                          <span className={styles.statusDotGreen} />
                          Currently: SHOW on website
                        </>
                      ) : (
                        <>
                          <span className={styles.statusDotGray} />
                          Currently: HIDDEN from website
                        </>
                      )}
                    </span>
                  </div>
                  <p className={styles.smallToggleDesc}>
                    When enabled, visitors will see this announcement ticker running in the top bar across the entire website.
                  </p>
                </div>
                <label className={styles.switch} title="Toggle Announcement Banner on Website">
                  <input
                    type="checkbox"
                    checked={!!contactForm.showAdmissionNotice}
                    onChange={(e) => handleToggleShowNotice(e.target.checked)}
                  />
                  <span className={styles.slider} />
                </label>
              </div>
            </div>
          </div>

          <button type="submit" className={styles.saveBtn}>
            <Save size={16} style={{ display: "inline", marginRight: 6, verticalAlign: "middle" }} />
            <span>Save Contact Info</span>
          </button>
        </form>
      </div>

      {/* 3. Factory Reset / Danger Zone */}
      <div className={styles.dangerZone}>
        <div className={styles.dangerInfo}>
          <h4>
            <AlertTriangle size={18} color="#ef4444" />
            <span>Restore Demo Data from Files</span>
          </h4>
          <p>
            Reset all notices, events, faculty members, and milestone numbers back to their initial state from the project data files. This action clears the local storage cache.
          </p>
        </div>
        <button type="button" onClick={handleResetData} className={styles.resetBtn}>
          <RefreshCw size={16} style={{ display: "inline", marginRight: 6, verticalAlign: "middle" }} />
          <span>Reset to Factory Data</span>
        </button>
      </div>
    </div>
  );
}
