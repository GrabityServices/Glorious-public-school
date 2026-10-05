import { useState, useEffect, useRef } from "react";
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
  Calendar,
  GraduationCap,
  Images,
  Plus,
  Trash2,
  Edit2,
  ArrowUp,
  ArrowDown,
  Upload,
  X,
  Sparkles,
  RotateCcw,
  Loader2,
} from "lucide-react";
import styles from "./AdminSettings.module.css";
import { useData } from "@/context/DataContext";
import { useConfirm } from "@/context/ConfirmContext";
import useDocumentTitle from "@/hooks/useDocumentTitle";
import { getAcademicSession } from "@/utils/academicYear";
import {
  sanitizePhoneInput,
  validateIndianPhone,
  validateEmail,
} from "@/utils/validation";
import { DEFAULT_HERO_SLIDES } from "@/data/sliderData";
import ShimmerImage from "@/components/common/ShimmerImage";

export default function AdminSettings() {
  useDocumentTitle("School Information & Stats | Glorious Admin");
  const { schoolInfo, updateSchoolInfo, updateStat, resetToDefaults, uploadSliderImage } = useData();
  const confirm = useConfirm();

  const [toast, setToast] = useState("");

  // Local state for school stats
  const [stats, setStats] = useState(() => schoolInfo.stats || []);

  // Local state for homepage hero slider
  const ensureSlideIds = (slideList) => {
    if (!Array.isArray(slideList)) return [];
    return slideList.map((s, i) => ({
      ...s,
      id: s.id || s._id || `slide_${i}_${Date.now()}`,
    }));
  };

  const [slides, setSlides] = useState(() =>
    Array.isArray(schoolInfo?.heroSlides) && schoolInfo.heroSlides.length > 0
      ? ensureSlideIds(schoolInfo.heroSlides)
      : DEFAULT_HERO_SLIDES
  );
  const [sliderModalOpen, setSliderModalOpen] = useState(false);
  const [editingSlideIndex, setEditingSlideIndex] = useState(null);
  const [slideForm, setSlideForm] = useState({
    id: "",
    image: "",
    tag: "",
    title: "",
    caption: "",
  });
  const [isUploadingSlide, setIsUploadingSlide] = useState(false);
  const [uploadSlideError, setUploadSlideError] = useState("");
  const slideFileInputRef = useRef(null);

  // Local state for contact & notices & admissions
  const [contactForm, setContactForm] = useState({
    phone: schoolInfo.phone || "",
    phoneAlt: schoolInfo.phoneAlt || "",
    email: schoolInfo.email || "",
    address: schoolInfo.address || "",
    admissionNotice: schoolInfo.admissionNotice || "",
    showAdmissionNotice: schoolInfo.showAdmissionNotice !== false,
    isAdmissionsOpen: schoolInfo.isAdmissionsOpen !== false,
  });

  // Sync state when schoolInfo is updated from MongoDB
  useEffect(() => {
    if (schoolInfo) {
      if (schoolInfo.stats) setStats(schoolInfo.stats);
      if (Array.isArray(schoolInfo.heroSlides) && schoolInfo.heroSlides.length > 0) {
        setSlides(ensureSlideIds(schoolInfo.heroSlides));
      }
      const isAdmOpen = schoolInfo.isAdmissionsOpen !== false;
      const isNoticeActive = isAdmOpen && schoolInfo.showAdmissionNotice !== false;
      setContactForm({
        phone: schoolInfo.phone || "",
        phoneAlt: schoolInfo.phoneAlt || "",
        email: schoolInfo.email || "",
        address: schoolInfo.address || "",
        admissionNotice: schoolInfo.admissionNotice || "",
        showAdmissionNotice: isNoticeActive,
        isAdmissionsOpen: isAdmOpen,
      });
    }
  }, [schoolInfo]);

  // --- Homepage Hero Slider Handlers ---
  const handleOpenAddSlide = () => {
    setEditingSlideIndex(null);
    setSlideForm({
      id: `slide_${Date.now()}`,
      image: "",
      tag: "Campus & Assembly",
      title: "",
      caption: "",
    });
    setUploadSlideError("");
    setSliderModalOpen(true);
  };

  const handleOpenEditSlide = (slide, idx) => {
    setEditingSlideIndex(idx);
    setSlideForm({
      id: slide.id || `slide_${Date.now()}`,
      image: slide.image || "",
      tag: slide.tag || "",
      title: slide.title || "",
      caption: slide.caption || "",
    });
    setUploadSlideError("");
    setSliderModalOpen(true);
  };

  const handleSlideImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 15 * 1024 * 1024) {
      setUploadSlideError("Image size must be under 15MB.");
      return;
    }

    setIsUploadingSlide(true);
    setUploadSlideError("");
    try {
      const res = await uploadSliderImage(file);
      if (res && res.fileUrl) {
        setSlideForm((prev) => ({ ...prev, image: res.fileUrl }));
      }
    } catch (err) {
      setUploadSlideError(err.message || "Failed to upload slider image. Please try again.");
    } finally {
      setIsUploadingSlide(false);
      if (slideFileInputRef.current) slideFileInputRef.current.value = "";
    }
  };

  const handleSaveSlideModal = async (e) => {
    e.preventDefault();
    if (!slideForm.image.trim()) {
      setUploadSlideError("Please upload or provide an image for the slide.");
      return;
    }
    if (!slideForm.title.trim()) {
      showToast("Please enter a headline title for the slide.");
      return;
    }

    let updatedSlides = [...slides];
    const newSlide = {
      id: slideForm.id || `slide_${Date.now()}`,
      image: slideForm.image.trim(),
      tag: slideForm.tag.trim() || "Campus Life",
      title: slideForm.title.trim(),
      caption: slideForm.caption.trim(),
    };

    if (editingSlideIndex !== null) {
      updatedSlides[editingSlideIndex] = newSlide;
    } else {
      updatedSlides.push(newSlide);
    }

    setSlides(updatedSlides);
    await updateSchoolInfo({ heroSlides: updatedSlides });
    setSliderModalOpen(false);
    showToast(
      editingSlideIndex !== null
        ? `Slide #${editingSlideIndex + 1} updated! Changes are live on the homepage.`
        : "New slide added! Changes are live on the homepage."
    );
  };

  const handleDeleteSlide = async (idx) => {
    if (slides.length <= 1) {
      showToast("At least one slide must remain in the homepage slider.");
      return;
    }

    const confirmed = await confirm({
      title: "Remove Hero Slide",
      message: `Are you sure you want to remove Slide #${idx + 1} ("${slides[idx].title || "Untitled"}") from the homepage slider?`,
      confirmText: "Yes, Remove Slide",
      cancelText: "Cancel",
      variant: "danger",
    });

    if (confirmed) {
      const updatedSlides = slides.filter((_, i) => i !== idx);
      setSlides(updatedSlides);
      await updateSchoolInfo({ heroSlides: updatedSlides });
      showToast("Slide removed from homepage slider.");
    }
  };

  const handleMoveSlide = async (idx, direction) => {
    const targetIdx = idx + direction;
    if (targetIdx < 0 || targetIdx >= slides.length) return;

    const updatedSlides = [...slides];
    const temp = updatedSlides[idx];
    updatedSlides[idx] = updatedSlides[targetIdx];
    updatedSlides[targetIdx] = temp;

    setSlides(updatedSlides);
    await updateSchoolInfo({ heroSlides: updatedSlides });
    showToast(`Slide moved to position #${targetIdx + 1}.`);
  };

  const handleResetDefaultSlides = async () => {
    const confirmed = await confirm({
      title: "Reset Homepage Slider",
      message: "Are you sure you want to reset the homepage hero slider back to the default 5 school showcase slides?",
      confirmText: "Yes, Reset Slides",
      cancelText: "Cancel",
      variant: "danger",
    });

    if (confirmed) {
      setSlides(DEFAULT_HERO_SLIDES);
      await updateSchoolInfo({ heroSlides: DEFAULT_HERO_SLIDES });
      showToast("Homepage slider restored to default showcase slides.");
    }
  };

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(""), 3500);
  };

  // Instant 1-click toggle handler for Online Admissions & Banners across the entire website
  const handleToggleAdmissionsOpen = async (checked) => {
    setContactForm((prev) => ({
      ...prev,
      isAdmissionsOpen: checked,
      showAdmissionNotice: checked,
    }));
    await updateSchoolInfo({
      isAdmissionsOpen: checked,
      showAdmissionNotice: checked,
    });
    showToast(
      checked
        ? `Admissions are now OPEN for Session ${getAcademicSession()} — Top announcement ticker and admission banners are ENABLED on website!`
        : `Admissions are now PAUSED — Top announcement ticker is DISABLED and hidden from website.`
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

    if (contactForm.phone) {
      const pRes = validateIndianPhone(contactForm.phone, true);
      if (!pRes.isValid) {
        showToast(`Primary Phone: ${pRes.error}`);
        return;
      }
    }
    if (contactForm.phoneAlt) {
      const pAltRes = validateIndianPhone(contactForm.phoneAlt, true);
      if (!pAltRes.isValid) {
        showToast(`Alternate Phone: ${pAltRes.error}`);
        return;
      }
    }
    if (contactForm.email) {
      const eRes = validateEmail(contactForm.email, false);
      if (!eRes.isValid) {
        showToast(`Official Email: ${eRes.error}`);
        return;
      }
    }

    updateSchoolInfo({
      ...contactForm,
      phone: contactForm.phone ? sanitizePhoneInput(contactForm.phone) : "",
      phoneAlt: contactForm.phoneAlt ? sanitizePhoneInput(contactForm.phoneAlt) : "",
      email: contactForm.email.trim(),
    });
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

      {/* 2. Academic Session & Admission Intake Control */}
      <div className={styles.sectionCard}>
        <div className={styles.sectionHeader}>
          <h3 className={styles.sectionTitle}>
            <GraduationCap size={20} color="#dc2626" />
            <span>Academic Session & Admission Intake Status</span>
          </h3>
          <p className={styles.sectionSubtitle}>
            Control whether admissions are currently active on the website. When disabled, all admission banners, apply buttons, and intake options are completely removed.
          </p>
        </div>

        <div className={styles.sessionCardContent}>
          {/* Dynamic System Year Display */}
          <div className={styles.systemYearBanner}>
            <div className={styles.systemYearIcon}>
              <Calendar size={22} color="#15803d" />
            </div>
            <div className={styles.systemYearText}>
              <div className={styles.systemYearLabel}>Automated Academic Session (System Clock)</div>
              <div className={styles.systemYearValue}>Session {getAcademicSession()}</div>
              <div className={styles.systemYearNote}>
                Calculated dynamically from the system clock. Every year, this automatically updates to the new academic session without any manual admin input.
              </div>
            </div>
          </div>

          {/* 1-Click Admissions Toggle */}
          <div className={styles.smallToggleBox}>
            <div className={styles.smallToggleInfo}>
              <div className={styles.smallToggleTitleRow}>
                <strong className={styles.smallToggleTitle}>Website Admission Intake Status</strong>
                <span
                  className={
                    contactForm.isAdmissionsOpen
                      ? styles.pillShow
                      : styles.pillHide
                  }
                >
                  {contactForm.isAdmissionsOpen ? (
                    <>
                      <span className={styles.statusDotGreen} />
                      Currently: ADMISSIONS OPEN (Live on Website)
                    </>
                  ) : (
                    <>
                      <span className={styles.statusDotGray} />
                      Currently: ADMISSIONS CLOSED (Removed from Website)
                    </>
                  )}
                </span>
              </div>
              <p className={styles.smallToggleDesc}>
                {contactForm.isAdmissionsOpen
                  ? `Admissions are active. The top announcement ticker is ENABLED across the website, and the banner container displays "Session ${getAcademicSession()} Admissions Open for the New Academic Session" with the "Apply Online Now" button.`
                  : `Admissions are closed. The top announcement ticker is DISABLED and hidden from the website, and the banner container automatically switches to "Have Inquiries or Want to Visit Our Campus?" with the "Contact School Desk" button.`}
              </p>
            </div>
            <label className={styles.switch} title="Toggle Admissions Open / Closed">
              <input
                type="checkbox"
                checked={!!contactForm.isAdmissionsOpen}
                onChange={(e) => handleToggleAdmissionsOpen(e.target.checked)}
              />
              <span className={styles.slider} />
            </label>
          </div>
        </div>
      </div>

      {/* 3. Homepage Hero Image Slider Management */}
      <div className={styles.sectionCard}>
        <div className={styles.sectionHeaderRow}>
          <div className={styles.sectionHeader}>
            <h3 className={styles.sectionTitle}>
              <Images size={20} color="#2563eb" />
              <span>Homepage Hero Image Slider</span>
            </h3>
            <p className={styles.sectionSubtitle}>
              Manage the rotating visual showcase displayed at the top of the homepage. Upload school photographs, edit banners, captions, badges, and reorder slides.
            </p>
          </div>
          <div className={styles.sectionHeaderActions}>
            <button
              type="button"
              onClick={handleResetDefaultSlides}
              className={styles.secondaryHeaderBtn}
              title="Reset to default 5 school slides"
            >
              <RotateCcw size={15} />
              <span>Reset Defaults</span>
            </button>
            <button
              type="button"
              onClick={handleOpenAddSlide}
              className={styles.primaryAddBtn}
            >
              <Plus size={16} />
              <span>Add New Slide</span>
            </button>
          </div>
        </div>

        {/* Slides Grid */}
        <div className={styles.sliderList}>
          {slides.map((slide, idx) => {
            const slideKey = slide.id || slide._id || `${slide.image}-${idx}`;
            return (
              <div key={slideKey} className={styles.sliderCard}>
                <div className={styles.sliderCardThumb}>
                  <ShimmerImage
                    key={`thumb-${slideKey}-${slide.image}`}
                    src={slide.image}
                    alt={slide.title || `Slide #${idx + 1}`}
                    className={styles.sliderCardImg}
                    wrapperClassName={styles.sliderCardImgWrapper}
                    fallbackSrc="/images/glorious-public-school.png"
                    loading="eager"
                  />
                  <span className={styles.sliderOrderBadge}>#{idx + 1}</span>
                {slide.tag && (
                  <span className={styles.sliderBadgeTag}>
                    <Sparkles size={11} /> {slide.tag}
                  </span>
                )}
              </div>

              <div className={styles.sliderCardBody}>
                <h4 className={styles.sliderCardTitle}>
                  {slide.title || <em>Untitled Slide</em>}
                </h4>
                <p className={styles.sliderCardCaption}>
                  {slide.caption || <em>No caption entered</em>}
                </p>
                <div className={styles.sliderCardMeta}>
                  <span className={styles.sliderCardUrl} title={slide.image}>
                    {slide.image}
                  </span>
                </div>
              </div>

              <div className={styles.sliderCardActions}>
                <div className={styles.reorderBtns}>
                  <button
                    type="button"
                    disabled={idx === 0}
                    onClick={() => handleMoveSlide(idx, -1)}
                    className={styles.iconBtn}
                    title="Move slide up / earlier"
                  >
                    <ArrowUp size={15} />
                  </button>
                  <button
                    type="button"
                    disabled={idx === slides.length - 1}
                    onClick={() => handleMoveSlide(idx, 1)}
                    className={styles.iconBtn}
                    title="Move slide down / later"
                  >
                    <ArrowDown size={15} />
                  </button>
                </div>
                <div className={styles.editDeleteBtns}>
                  <button
                    type="button"
                    onClick={() => handleOpenEditSlide(slide, idx)}
                    className={styles.editBtn}
                    title="Edit slide"
                  >
                    <Edit2 size={14} />
                    <span>Edit</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDeleteSlide(idx)}
                    className={styles.deleteBtn}
                    title="Delete slide"
                  >
                    <Trash2 size={14} />
                    <span>Delete</span>
                  </button>
                </div>
              </div>
            </div>
          );
        })}
        </div>
      </div>

      {/* 4. School Contact Information & Announcement */}
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
                type="tel"
                maxLength={10}
                placeholder="10-digit mobile number"
                value={contactForm.phone}
                onChange={(e) =>
                  setContactForm({ ...contactForm, phone: sanitizePhoneInput(e.target.value) })
                }
              />
            </div>

            <div className={styles.formGroup}>
              <label>Alternate Phone / WhatsApp</label>
              <input
                type="tel"
                maxLength={10}
                placeholder="10-digit mobile number"
                value={contactForm.phoneAlt}
                onChange={(e) =>
                  setContactForm({ ...contactForm, phoneAlt: sanitizePhoneInput(e.target.value) })
                }
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

              <p className={styles.fieldHint}>
                This announcement ticker is automatically controlled by the <strong>Website Admission Intake Status</strong> switch in Section 2 above. When admissions are open, it runs live across the top bar on the website.
              </p>
            </div>
          </div>

          <button type="submit" className={styles.saveBtn}>
            <Save size={16} style={{ display: "inline", marginRight: 6, verticalAlign: "middle" }} />
            <span>Save Contact Info</span>
          </button>
        </form>
      </div>

      {/* 5. Factory Reset / Danger Zone */}
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

      {/* Slide Add/Edit Modal */}
      {sliderModalOpen && (
        <div
          className={styles.modalOverlay}
          data-lenis-prevent="true"
          onClick={(e) => {
            if (e.target === e.currentTarget) setSliderModalOpen(false);
          }}
        >
          <div
            className={styles.modalContent}
            data-lenis-prevent="true"
            role="dialog"
            aria-modal="true"
          >
            <div className={styles.modalHeader}>
              <div className={styles.modalTitleBox}>
                <Images size={20} color="#2563eb" />
                <h3>{editingSlideIndex !== null ? `Edit Slide #${editingSlideIndex + 1}` : "Add New Hero Slide"}</h3>
              </div>
              <button
                type="button"
                onClick={() => setSliderModalOpen(false)}
                className={styles.closeBtn}
                aria-label="Close modal"
              >
                <X size={18} />
              </button>
            </div>

            <form
              onSubmit={handleSaveSlideModal}
              className={styles.modalForm}
              data-lenis-prevent="true"
            >
              <div className={styles.modalBody} data-lenis-prevent="true">
                {/* Photo Upload or URL */}
                <div className={styles.modalFormGroup}>
                  <label>Slide Photograph / Image *</label>
                  <div className={styles.uploadArea}>
                    <input
                      type="file"
                      ref={slideFileInputRef}
                      accept="image/*"
                      onChange={handleSlideImageUpload}
                      style={{ display: "none" }}
                      id="slidePhotoUpload"
                    />
                    <div
                      className={styles.uploadDropzone}
                      onClick={() => slideFileInputRef.current?.click()}
                    >
                      {isUploadingSlide ? (
                        <div className={styles.uploadLoading}>
                          <Loader2 size={24} className={styles.spinner} />
                          <span>Uploading image to server...</span>
                        </div>
                      ) : (
                        <>
                          <Upload size={22} color="#2563eb" />
                          <div>
                            <strong>Click to upload photograph from device</strong>
                            <p>PNG, JPG, WEBP up to 15MB</p>
                          </div>
                        </>
                      )}
                    </div>

                    {uploadSlideError && (
                      <div className={styles.uploadError}>{uploadSlideError}</div>
                    )}

                    {slideForm.image && (
                      <div className={styles.imagePreviewBox}>
                        <span className={styles.previewLabel}>Live Slide Preview:</span>
                        <div className={styles.previewImgWrapper}>
                          <img
                            src={slideForm.image}
                            alt="Slide Preview"
                            className={styles.previewImg}
                            onError={(e) => {
                              e.target.src = "/images/glorious-public-school.png";
                            }}
                          />
                          {slideForm.tag && (
                            <span className={styles.previewTagBadge}>
                              <Sparkles size={11} /> {slideForm.tag}
                            </span>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Tag / Category */}
                <div className={styles.modalFormGroup}>
                  <label>Badge / Category Tag</label>
                  <input
                    type="text"
                    placeholder="e.g. Campus & Assembly, Smart Classrooms, Sports"
                    value={slideForm.tag}
                    onChange={(e) =>
                      setSlideForm({ ...slideForm, tag: e.target.value })
                    }
                  />
                  <div className={styles.quickTagSuggestions}>
                    {["Campus & Assembly", "Smart Classrooms", "Science & Innovation", "Athletics & Fitness", "Arts & Culture", "Holistic Health"].map(
                      (suggested) => (
                        <button
                          type="button"
                          key={suggested}
                          onClick={() => setSlideForm({ ...slideForm, tag: suggested })}
                          className={`${styles.suggestionPill} ${
                            slideForm.tag === suggested ? styles.suggestionPillActive : ""
                          }`}
                        >
                          {suggested}
                        </button>
                      )
                    )}
                  </div>
                </div>

                {/* Main Headline Title */}
                <div className={styles.modalFormGroup}>
                  <label>Slide Main Headline Title *</label>
                  <input
                    type="text"
                    placeholder="e.g. Vibrant Campus Grounds & Morning Assemblies"
                    value={slideForm.title}
                    onChange={(e) =>
                      setSlideForm({ ...slideForm, title: e.target.value })
                    }
                    required
                  />
                </div>

                {/* Caption / Description */}
                <div className={styles.modalFormGroup}>
                  <label>Caption / Short Description</label>
                  <textarea
                    rows={2}
                    placeholder="e.g. Instilling discipline, community spirit, and moral focus every morning."
                    value={slideForm.caption}
                    onChange={(e) =>
                      setSlideForm({ ...slideForm, caption: e.target.value })
                    }
                  />
                </div>
              </div>

              {/* Modal Footer with fixed buttons */}
              <div className={styles.modalFooter}>
                <button
                  type="button"
                  onClick={() => setSliderModalOpen(false)}
                  className={styles.cancelBtn}
                >
                  Cancel
                </button>
                <button type="submit" className={styles.submitModalBtn}>
                  <Save size={16} />
                  <span>{editingSlideIndex !== null ? "Update Slide" : "Add Slide"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
