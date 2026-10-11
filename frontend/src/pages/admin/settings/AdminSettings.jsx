import { useState, useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
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
  Clock,
  Share2,
  Globe,
} from "lucide-react";
import styles from "./AdminSettings.module.css";
import { useData, DEFAULT_SOCIAL_LINKS } from "@/context/DataContext";
import { useConfirm } from "@/context/ConfirmContext";
import useDocumentTitle from "@/hooks/useDocumentTitle";
import { getAcademicSession } from "@/utils/academicYear";
import {
  sanitizePhoneInput,
  validateIndianPhone,
  validateEmail,
} from "@/utils/validation";
import { DEFAULT_HERO_SLIDES } from "@/data/sliderData";
import { SCHOOL_ROUTINE } from "@/data/academicsData";
import {
  ACADEMIC_MONTHS,
  CALENDAR_CATEGORIES,
  SCHOOL_CALENDAR_EVENTS,
} from "@/data/calendarData";
import ShimmerImage from "@/components/common/ShimmerImage";

export default function AdminSettings() {
  useDocumentTitle("School Information & Stats | Glorious Admin");
  const { schoolInfo, updateSchoolInfo, updateStat, resetToDefaults, uploadSliderImage } = useData();
  const confirm = useConfirm();
  const location = useLocation();
  const navigate = useNavigate();

  const [toast, setToast] = useState("");

  // Redirect legacy #security hash to dedicated Admin & Security page
  useEffect(() => {
    if (location.hash === "#security") {
      navigate("/admin/security", { replace: true });
    }
  }, [location.hash, navigate]);

  // Local state for school stats
  const [stats, setStats] = useState(() => schoolInfo.stats || []);
  const [isSavingStats, setIsSavingStats] = useState(false);

  // Local state for School Timetable & Bell Schedule
  const [bellSchedule, setBellSchedule] = useState(() =>
    Array.isArray(schoolInfo?.bellSchedule) && schoolInfo.bellSchedule.length > 0
      ? schoolInfo.bellSchedule
      : SCHOOL_ROUTINE
  );
  const [isSavingBell, setIsSavingBell] = useState(false);

  // Local state for Social Media Links
  const [socialLinks, setSocialLinks] = useState(() => ({
    ...DEFAULT_SOCIAL_LINKS,
    ...(schoolInfo?.socialLinks || {}),
  }));
  const [isSavingSocial, setIsSavingSocial] = useState(false);

  // Local state for Academic Calendar Events (4 Admin-Managed Categories)
  const [calendarEvents, setCalendarEvents] = useState(() =>
    Array.isArray(schoolInfo?.calendarEvents) && schoolInfo.calendarEvents.length > 0
      ? schoolInfo.calendarEvents
      : SCHOOL_CALENDAR_EVENTS
  );
  const [calFilterCat, setCalFilterCat] = useState("all");
  const [calModalOpen, setCalModalOpen] = useState(false);
  const [editingCalIdx, setEditingCalIdx] = useState(null);
  const [calForm, setCalForm] = useState({
    id: "",
    title: "",
    category: "holiday",
    categoryLabel: "Holidays & Vacations",
    monthIdxInList: 0,
    day: 1,
    endDay: "",
    date: "",
    time: "8:00 AM - 2:30 PM",
    grades: "All Classes (Nursery - 10th)",
    venue: "School Campus, Jhajha",
    description: "",
  });

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
      if (Array.isArray(schoolInfo.bellSchedule) && schoolInfo.bellSchedule.length > 0) {
        setBellSchedule(schoolInfo.bellSchedule);
      }
      if (schoolInfo.socialLinks) {
        setSocialLinks({
          ...DEFAULT_SOCIAL_LINKS,
          ...schoolInfo.socialLinks,
        });
      }
      if (Array.isArray(schoolInfo.calendarEvents) && schoolInfo.calendarEvents.length > 0) {
        setCalendarEvents(schoolInfo.calendarEvents);
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

  const handleSaveStats = async (e) => {
    e.preventDefault();
    setIsSavingStats(true);
    try {
      const res = await updateSchoolInfo({ stats });
      if (res) {
        showToast("School stats updated successfully in MongoDB Atlas cluster!");
      } else {
        showToast("Stats saved. Changes are now live on the homepage!");
      }
    } catch (err) {
      showToast(err.message || "Failed to update school stats. Please try again.");
    } finally {
      setIsSavingStats(false);
    }
  };

  // --- School Timetable & Bell Schedule Handlers ---
  const handleBellSlotChange = (idx, field, val) => {
    setBellSchedule((prev) =>
      prev.map((slot, i) => (i === idx ? { ...slot, [field]: val } : slot))
    );
  };

  const handleAddBellSlot = () => {
    setBellSchedule((prev) => [
      ...prev,
      { time: "02:30 PM - 03:00 PM", activity: "Extra Remedial / Club Activity" },
    ]);
  };

  const handleMoveBellSlot = (idx, direction) => {
    const targetIdx = idx + direction;
    if (targetIdx < 0 || targetIdx >= bellSchedule.length) return;
    const updated = [...bellSchedule];
    const temp = updated[idx];
    updated[idx] = updated[targetIdx];
    updated[targetIdx] = temp;
    setBellSchedule(updated);
  };

  const handleDeleteBellSlot = (idx) => {
    if (bellSchedule.length <= 1) {
      showToast("At least one period/slot must remain in the timetable.");
      return;
    }
    setBellSchedule((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleSaveBellSchedule = async (e) => {
    e.preventDefault();
    const cleaned = bellSchedule
      .map((s) => ({
        time: String(s.time || "").trim(),
        activity: String(s.activity || "").trim(),
      }))
      .filter((s) => s.time && s.activity);

    if (cleaned.length === 0) {
      showToast("Please enter at least one valid time and activity slot.");
      return;
    }

    setIsSavingBell(true);
    try {
      setBellSchedule(cleaned);
      await updateSchoolInfo({ bellSchedule: cleaned });
      showToast("School Timetable & Bell Schedule updated and live on Academics page!");
    } catch (err) {
      showToast(err.message || "Failed to save bell schedule.");
    } finally {
      setIsSavingBell(false);
    }
  };

  const handleResetBellSchedule = async () => {
    const confirmed = await confirm({
      title: "Reset School Timetable & Bell Schedule",
      message:
        "Are you sure you want to reset the School Timetable & Bell Schedule back to the default school routine (07:50 AM to 02:30 PM)?",
      confirmText: "Yes, Reset Schedule",
      cancelText: "Cancel",
      variant: "danger",
    });
    if (confirmed) {
      setBellSchedule(SCHOOL_ROUTINE);
      await updateSchoolInfo({ bellSchedule: SCHOOL_ROUTINE });
      showToast("School Timetable & Bell Schedule reset to default routine!");
    }
  };

  // --- Social Media Links Handlers ---
  const handleSaveSocialLinks = async (e) => {
    e.preventDefault();
    setIsSavingSocial(true);
    try {
      const cleanedLinks = {
        instagram: String(socialLinks.instagram || "").trim() || DEFAULT_SOCIAL_LINKS.instagram,
        facebook: String(socialLinks.facebook || "").trim() || DEFAULT_SOCIAL_LINKS.facebook,
        youtube: String(socialLinks.youtube || "").trim() || DEFAULT_SOCIAL_LINKS.youtube,
        x: String(socialLinks.x || "").trim() || DEFAULT_SOCIAL_LINKS.x,
      };
      setSocialLinks(cleanedLinks);
      await updateSchoolInfo({ socialLinks: cleanedLinks });
      showToast("Social Media Links (Instagram, Facebook, YouTube, X) updated across the website!");
    } catch (err) {
      showToast(err.message || "Failed to update social media links.");
    } finally {
      setIsSavingSocial(false);
    }
  };

  const handleResetSocialLinks = async () => {
    const confirmed = await confirm({
      title: "Reset Social Media Links",
      message: "Restore Instagram, Facebook, YouTube, and X links back to default?",
      confirmText: "Yes, Reset Links",
      cancelText: "Cancel",
      variant: "danger",
    });
    if (confirmed) {
      setSocialLinks(DEFAULT_SOCIAL_LINKS);
      await updateSchoolInfo({ socialLinks: DEFAULT_SOCIAL_LINKS });
      showToast("Social Media Links restored to default!");
    }
  };

  // --- Academic Calendar Events (4 Categories) Handlers ---
  const defaultCategoryLabels = {
    holiday: "Holidays & Vacations",
    exam: "Exams & Assessments",
    celebration: "Celebrations & Sports",
    ptm: "Parent-Teacher Meetings",
  };

  const handleOpenAddCalEvent = () => {
    const nowMonth = new Date().getMonth();
    const defaultMIdx = Math.max(0, ACADEMIC_MONTHS.findIndex((m) => m.index === nowMonth));
    const mObj = ACADEMIC_MONTHS[defaultMIdx] || ACADEMIC_MONTHS[0];
    setEditingCalIdx(null);
    setCalForm({
      id: `cal_${Date.now()}`,
      title: "",
      category: calFilterCat !== "all" ? calFilterCat : "holiday",
      categoryLabel: defaultCategoryLabels[calFilterCat !== "all" ? calFilterCat : "holiday"],
      monthIdxInList: defaultMIdx,
      day: 15,
      endDay: "",
      date: `15 ${mObj.name} ${mObj.year}`,
      time: "8:00 AM - 2:30 PM",
      grades: "All Classes (Nursery - 10th)",
      venue: "School Campus, Jhajha",
      description: "",
    });
    setCalModalOpen(true);
  };

  const handleOpenEditCalEvent = (ev, indexInFullArray) => {
    const mIdx = Math.max(
      0,
      ACADEMIC_MONTHS.findIndex((m) => m.index === Number(ev.month) && m.year === Number(ev.year))
    );
    setEditingCalIdx(indexInFullArray);
    setCalForm({
      id: ev.id || `cal_${Date.now()}`,
      title: ev.title || "",
      category: ev.category || "holiday",
      categoryLabel: ev.categoryLabel || defaultCategoryLabels[ev.category] || "School Event",
      monthIdxInList: mIdx,
      day: ev.day || 1,
      endDay: ev.endDay || "",
      date: ev.date || "",
      time: ev.time || "8:00 AM - 2:30 PM",
      grades: ev.grades || "All Classes",
      venue: ev.venue || "School Campus, Jhajha",
      description: ev.description || "",
    });
    setCalModalOpen(true);
  };

  const handleSaveCalEventModal = async (e) => {
    e.preventDefault();
    if (!calForm.title.trim()) {
      showToast("Please enter an event or holiday title.");
      return;
    }
    let mObj = ACADEMIC_MONTHS[Number(calForm.monthIdxInList)] || ACADEMIC_MONTHS[0];
    let dayNum = Math.max(1, Math.min(31, Number(calForm.day) || 1));
    let endDayNum = calForm.endDay ? Math.max(dayNum, Math.min(31, Number(calForm.endDay))) : null;

    // If the admin typed a month name in Display Date Text (e.g., "12 October - 13 October 2026"), sync month/year/day
    const customDateStr = calForm.date.trim();
    if (customDateStr) {
      let bestMatch = null;
      let bestPos = Infinity;
      for (const candidate of ACADEMIC_MONTHS) {
        const regex = new RegExp(`\\b${candidate.name}\\b`, "i");
        const match = regex.exec(customDateStr);
        if (match && match.index < bestPos) {
          bestPos = match.index;
          bestMatch = candidate;
        }
      }
      if (bestMatch) {
        mObj = bestMatch;
      }
      const dayMatch = customDateStr.match(/(\d{1,2})\s+[A-Za-z]+(?:\s*[-–]\s*(\d{1,2})\s+[A-Za-z]+)?/);
      if (dayMatch) {
        dayNum = Math.max(1, Math.min(31, Number(dayMatch[1]) || dayNum));
        if (dayMatch[2]) {
          endDayNum = Math.max(dayNum, Math.min(31, Number(dayMatch[2])));
        }
      }
    }

    const autoDateStr = endDayNum
      ? `${String(dayNum).padStart(2, "0")} ${mObj.name} - ${String(endDayNum).padStart(2, "0")} ${mObj.name} ${mObj.year}`
      : `${String(dayNum).padStart(2, "0")} ${mObj.name} ${mObj.year}`;

    const newEv = {
      id: calForm.id || `cal_${Date.now()}`,
      title: calForm.title.trim(),
      category: calForm.category,
      categoryLabel: calForm.categoryLabel.trim() || defaultCategoryLabels[calForm.category] || "School Event",
      date: customDateStr || autoDateStr,
      year: mObj.year,
      month: mObj.index,
      day: dayNum,
      ...(endDayNum ? { endDay: endDayNum } : {}),
      time: calForm.time.trim() || "All Day",
      grades: calForm.grades.trim() || "All Classes",
      venue: calForm.venue.trim() || "School Campus",
      description: calForm.description.trim(),
    };

    const updatedList = [...calendarEvents];
    if (editingCalIdx !== null) {
      updatedList[editingCalIdx] = newEv;
    } else {
      updatedList.push(newEv);
    }

    setCalendarEvents(updatedList);
    await updateSchoolInfo({ calendarEvents: updatedList });
    setCalModalOpen(false);
    showToast(
      editingCalIdx !== null
        ? "Academic Calendar event updated!"
        : "New event added to School Academic Calendar!"
    );
  };

  const handleDeleteCalEvent = async (indexInFullArray) => {
    const target = calendarEvents[indexInFullArray];
    if (!target) return;
    const confirmed = await confirm({
      title: "Delete Academic Calendar Event",
      message: `Are you sure you want to remove "${target.title}" (${target.date}) from the School Academic Calendar?`,
      confirmText: "Yes, Delete Event",
      cancelText: "Cancel",
      variant: "danger",
    });
    if (confirmed) {
      const updatedList = calendarEvents.filter((_, i) => i !== indexInFullArray);
      setCalendarEvents(updatedList);
      await updateSchoolInfo({ calendarEvents: updatedList });
      showToast("Event removed from School Academic Calendar.");
    }
  };

  const handleResetCalendarEvents = async () => {
    const confirmed = await confirm({
      title: "Reset School Academic Calendar",
      message:
        "Are you sure you want to reset all 4 categories (Holidays & Vacations, Exams & Assessments, Celebrations & Sports, and Parent-Teacher Meetings) back to the default session schedule?",
      confirmText: "Yes, Reset Calendar",
      cancelText: "Cancel",
      variant: "danger",
    });
    if (confirmed) {
      setCalendarEvents(SCHOOL_CALENDAR_EVENTS);
      await updateSchoolInfo({ calendarEvents: SCHOOL_CALENDAR_EVENTS });
      showToast("School Academic Calendar restored to default schedule!");
    }
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

          <button type="submit" className={styles.saveBtn} disabled={isSavingStats}>
            {isSavingStats ? (
              <Loader2 size={16} style={{ display: "inline", marginRight: 6, verticalAlign: "middle", animation: "spin 1s linear infinite" }} />
            ) : (
              <Save size={16} style={{ display: "inline", marginRight: 6, verticalAlign: "middle" }} />
            )}
            <span>{isSavingStats ? "Saving to Database..." : "Save Milestone Stats"}</span>
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

      {/* 3B. School Timetable & Bell Schedule Management */}
      <div className={styles.sectionCard} id="timetable">
        <div className={styles.sectionHeaderRow}>
          <div className={styles.sectionHeader} style={{ marginBottom: 0, borderBottom: "none", paddingBottom: 0 }}>
            <h3 className={styles.sectionTitle}>
              <Clock size={20} color="#dc2626" />
              <span>School Timetable & Bell Schedule</span>
            </h3>
            <p className={styles.sectionSubtitle}>
              Modify the daily periods, assembly timings, recess breaks, and dispersal schedule shown on the Academics page.
            </p>
          </div>
          <div className={styles.sectionHeaderActions}>
            <button
              type="button"
              onClick={handleResetBellSchedule}
              className={styles.secondaryHeaderBtn}
              title="Reset Bell Schedule to default school routine"
            >
              <RotateCcw size={15} />
              <span>Reset Schedule</span>
            </button>
            <button
              type="button"
              onClick={handleAddBellSlot}
              className={styles.primaryAddBtn}
            >
              <Plus size={16} />
              <span>Add Period / Slot</span>
            </button>
          </div>
        </div>

        <form onSubmit={handleSaveBellSchedule} style={{ marginTop: "18px" }}>
          <div className={styles.bellScheduleList}>
            {bellSchedule.map((slot, idx) => (
              <div key={idx} className={styles.bellSlotRow}>
                <span className={styles.bellSlotIndex}>#{idx + 1}</span>
                <div className={styles.bellSlotInputs}>
                  <div className={styles.bellInputTimeWrap}>
                    <label>Time Duration</label>
                    <input
                      type="text"
                      placeholder="e.g. 08:20 AM - 09:00 AM"
                      value={slot.time || ""}
                      onChange={(e) => handleBellSlotChange(idx, "time", e.target.value)}
                    />
                  </div>
                  <div className={styles.bellInputActivityWrap}>
                    <label>Activity / Period Description</label>
                    <input
                      type="text"
                      placeholder="e.g. Period 1 (Core Subject)"
                      value={slot.activity || ""}
                      onChange={(e) => handleBellSlotChange(idx, "activity", e.target.value)}
                    />
                  </div>
                </div>
                <div className={styles.bellSlotActions}>
                  <button
                    type="button"
                    disabled={idx === 0}
                    onClick={() => handleMoveBellSlot(idx, -1)}
                    className={styles.iconBtn}
                    title="Move up"
                  >
                    <ArrowUp size={14} />
                  </button>
                  <button
                    type="button"
                    disabled={idx === bellSchedule.length - 1}
                    onClick={() => handleMoveBellSlot(idx, 1)}
                    className={styles.iconBtn}
                    title="Move down"
                  >
                    <ArrowDown size={14} />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDeleteBellSlot(idx)}
                    className={styles.deleteBtn}
                    title="Remove slot"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className={styles.bellFooterActions}>
            <button type="submit" className={styles.saveBtn} disabled={isSavingBell}>
              {isSavingBell ? (
                <Loader2 size={16} style={{ display: "inline", marginRight: 6, verticalAlign: "middle", animation: "spin 1s linear infinite" }} />
              ) : (
                <Save size={16} style={{ display: "inline", marginRight: 6, verticalAlign: "middle" }} />
              )}
              <span>{isSavingBell ? "Saving Timetable..." : "Save Timetable & Bell Schedule"}</span>
            </button>
            <button
              type="button"
              onClick={handleResetBellSchedule}
              className={styles.resetBtn}
            >
              <RotateCcw size={15} style={{ display: "inline", marginRight: 6, verticalAlign: "middle" }} />
              <span>Reset to Default Schedule</span>
            </button>
          </div>
        </form>
      </div>

      {/* 3C. School Academic Calendar Events Manager (4 Categories) */}
      <div className={styles.sectionCard} id="academic-calendar">
        <div className={styles.sectionHeaderRow}>
          <div className={styles.sectionHeader} style={{ marginBottom: 0, borderBottom: "none", paddingBottom: 0 }}>
            <h3 className={styles.sectionTitle}>
              <Calendar size={20} color="#059669" />
              <span>School Academic Calendar Manager (4 Categories)</span>
            </h3>
            <p className={styles.sectionSubtitle}>
              Manage all non-fixed school dates across (i) Holidays & Vacations, (ii) Exams & Assessments, (iii) Celebrations & Sports, and (iv) Parent-Teacher Meetings.
            </p>
          </div>
          <div className={styles.sectionHeaderActions}>
            <button
              type="button"
              onClick={handleResetCalendarEvents}
              className={styles.secondaryHeaderBtn}
              title="Reset Academic Calendar to default schedule"
            >
              <RotateCcw size={15} />
              <span>Reset Default Calendar</span>
            </button>
            <button
              type="button"
              onClick={handleOpenAddCalEvent}
              className={styles.primaryAddBtn}
            >
              <Plus size={16} />
              <span>Add Calendar Event</span>
            </button>
          </div>
        </div>

        {/* 4 Category Filter Pills */}
        <div className={styles.calCategoryTabs}>
          {CALENDAR_CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => setCalFilterCat(cat.id)}
              className={`${styles.calCatBtn} ${calFilterCat === cat.id ? styles.calCatBtnActive : ""}`}
            >
              <span>{cat.label}</span>
              <span className={styles.calCatCount}>
                {cat.id === "all"
                  ? calendarEvents.length
                  : calendarEvents.filter((e) => e.category === cat.id).length}
              </span>
            </button>
          ))}
        </div>

        <div className={styles.calEventsAdminList} data-lenis-prevent="true">
          {calendarEvents
            .map((ev, fullIdx) => ({ ev, fullIdx }))
            .filter(({ ev }) => calFilterCat === "all" || ev.category === calFilterCat)
            .map(({ ev, fullIdx }) => (
              <div key={ev.id || fullIdx} className={styles.calEventAdminRow}>
                <div className={styles.calEventAdminInfo}>
                  <div className={styles.calEventAdminBadges}>
                    <span className={`${styles.calCatTag} ${styles[`calCat_${ev.category}`] || ""}`}>
                      {ev.categoryLabel || defaultCategoryLabels[ev.category] || ev.category}
                    </span>
                    <span className={styles.calEventDatePill}>{ev.date}</span>
                  </div>
                  <h4 className={styles.calEventAdminTitle}>{ev.title}</h4>
                  <p className={styles.calEventAdminMeta}>
                    {ev.time} • {ev.grades} • {ev.venue}
                  </p>
                </div>
                <div className={styles.editDeleteBtns}>
                  <button
                    type="button"
                    onClick={() => handleOpenEditCalEvent(ev, fullIdx)}
                    className={styles.editBtn}
                  >
                    <Edit2 size={14} />
                    <span>Edit</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDeleteCalEvent(fullIdx)}
                    className={styles.deleteBtn}
                  >
                    <Trash2 size={14} />
                    <span>Delete</span>
                  </button>
                </div>
              </div>
            ))}
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

      {/* 4B. Social Media Links (Instagram, Facebook, YouTube, X) */}
      <div className={styles.sectionCard} id="social-links">
        <div className={styles.sectionHeaderRow}>
          <div className={styles.sectionHeader} style={{ marginBottom: 0, borderBottom: "none", paddingBottom: 0 }}>
            <h3 className={styles.sectionTitle}>
              <Share2 size={20} color="#2563eb" />
              <span>Official Social Media Links (Instagram, Facebook, YouTube & X)</span>
            </h3>
            <p className={styles.sectionSubtitle}>
              Configure official social media profile URLs displayed in the Header, Footer, and Contact page.
            </p>
          </div>
          <div className={styles.sectionHeaderActions}>
            <button
              type="button"
              onClick={handleResetSocialLinks}
              className={styles.secondaryHeaderBtn}
            >
              <RotateCcw size={15} />
              <span>Reset Links</span>
            </button>
          </div>
        </div>

        <form onSubmit={handleSaveSocialLinks} style={{ marginTop: "18px" }}>
          <div className={styles.formGrid}>
            <div className={styles.formGroup}>
              <label>Instagram Profile URL</label>
              <input
                type="url"
                placeholder="https://www.instagram.com/your_school"
                value={socialLinks.instagram || ""}
                onChange={(e) => setSocialLinks({ ...socialLinks, instagram: e.target.value })}
              />
            </div>

            <div className={styles.formGroup}>
              <label>Facebook Page URL</label>
              <input
                type="url"
                placeholder="https://www.facebook.com/your_school"
                value={socialLinks.facebook || ""}
                onChange={(e) => setSocialLinks({ ...socialLinks, facebook: e.target.value })}
              />
            </div>

            <div className={styles.formGroup}>
              <label>YouTube Channel URL</label>
              <input
                type="url"
                placeholder="https://www.youtube.com/@your_school"
                value={socialLinks.youtube || ""}
                onChange={(e) => setSocialLinks({ ...socialLinks, youtube: e.target.value })}
              />
            </div>

            <div className={styles.formGroup}>
              <label>X (Twitter) Profile URL</label>
              <input
                type="url"
                placeholder="https://x.com/your_school"
                value={socialLinks.x || ""}
                onChange={(e) => setSocialLinks({ ...socialLinks, x: e.target.value })}
              />
            </div>
          </div>

          <button type="submit" className={styles.saveBtn} disabled={isSavingSocial}>
            {isSavingSocial ? (
              <Loader2 size={16} style={{ display: "inline", marginRight: 6, verticalAlign: "middle", animation: "spin 1s linear infinite" }} />
            ) : (
              <Save size={16} style={{ display: "inline", marginRight: 6, verticalAlign: "middle" }} />
            )}
            <span>{isSavingSocial ? "Saving Social Links..." : "Save Social Media Links"}</span>
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

      {/* Academic Calendar Event Add/Edit Modal */}
      {calModalOpen && (
        <div
          className={styles.modalOverlay}
          data-lenis-prevent="true"
          onClick={(e) => {
            if (e.target === e.currentTarget) setCalModalOpen(false);
          }}
        >
          <div className={styles.modalContent} data-lenis-prevent="true" role="dialog" aria-modal="true">
            <div className={styles.modalHeader}>
              <div className={styles.modalTitleBox}>
                <Calendar size={20} color="#059669" />
                <h3>{editingCalIdx !== null ? "Edit Academic Calendar Event" : "Add Academic Calendar Event"}</h3>
              </div>
              <button
                type="button"
                onClick={() => setCalModalOpen(false)}
                className={styles.closeBtn}
                aria-label="Close modal"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveCalEventModal} className={styles.modalForm} data-lenis-prevent="true">
              <div className={styles.modalBody} data-lenis-prevent="true">
                <div className={styles.formGrid} style={{ marginBottom: 0 }}>
                  <div className={styles.modalFormGroup}>
                    <label>Event Category *</label>
                    <select
                      value={calForm.category}
                      onChange={(e) => {
                        const cat = e.target.value;
                        setCalForm({
                          ...calForm,
                          category: cat,
                          categoryLabel: defaultCategoryLabels[cat] || "School Event",
                        });
                      }}
                      className={styles.modalSelect}
                    >
                      <option value="holiday">(i) Holidays & Vacations</option>
                      <option value="exam">(ii) Exams & Assessments</option>
                      <option value="celebration">(iii) Celebrations & Sports</option>
                      <option value="ptm">(iv) Parent-Teacher Meetings</option>
                    </select>
                  </div>

                  <div className={styles.modalFormGroup}>
                    <label>Badge / Sub-Category Label</label>
                    <input
                      type="text"
                      placeholder="e.g. National Holiday, Examination, PTM"
                      value={calForm.categoryLabel}
                      onChange={(e) => setCalForm({ ...calForm, categoryLabel: e.target.value })}
                    />
                  </div>

                  <div className={styles.modalFormGroup}>
                    <label>Academic Month *</label>
                    <select
                      value={calForm.monthIdxInList}
                      onChange={(e) => {
                        const mIdx = Number(e.target.value);
                        const mObj = ACADEMIC_MONTHS[mIdx] || ACADEMIC_MONTHS[0];
                        const d = calForm.day || 1;
                        setCalForm({
                          ...calForm,
                          monthIdxInList: mIdx,
                          date: `${String(d).padStart(2, "0")} ${mObj.name} ${mObj.year}`,
                        });
                      }}
                      className={styles.modalSelect}
                    >
                      {ACADEMIC_MONTHS.map((mObj, i) => (
                        <option key={mObj.fullName} value={i}>
                          {mObj.fullName}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className={styles.modalFormGroup}>
                    <label>Start Day (1-31) & Optional End Day</label>
                    <div style={{ display: "flex", gap: "8px" }}>
                      <input
                        type="number"
                        min={1}
                        max={31}
                        placeholder="Start Day"
                        value={calForm.day}
                        onChange={(e) => {
                          const d = e.target.value;
                          const mObj = ACADEMIC_MONTHS[calForm.monthIdxInList] || ACADEMIC_MONTHS[0];
                          setCalForm({
                            ...calForm,
                            day: d,
                            date: calForm.endDay
                              ? `${String(d).padStart(2, "0")} ${mObj.name} - ${String(calForm.endDay).padStart(2, "0")} ${mObj.name} ${mObj.year}`
                              : `${String(d).padStart(2, "0")} ${mObj.name} ${mObj.year}`,
                          });
                        }}
                      />
                      <input
                        type="number"
                        min={1}
                        max={31}
                        placeholder="End Day (optional)"
                        value={calForm.endDay}
                        onChange={(e) => {
                          const ed = e.target.value;
                          const mObj = ACADEMIC_MONTHS[calForm.monthIdxInList] || ACADEMIC_MONTHS[0];
                          setCalForm({
                            ...calForm,
                            endDay: ed,
                            date: ed
                              ? `${String(calForm.day).padStart(2, "0")} ${mObj.name} - ${String(ed).padStart(2, "0")} ${mObj.name} ${mObj.year}`
                              : `${String(calForm.day).padStart(2, "0")} ${mObj.name} ${mObj.year}`,
                          });
                        }}
                      />
                    </div>
                  </div>
                </div>

                <div className={styles.modalFormGroup}>
                  <label>Event / Holiday Title *</label>
                  <input
                    type="text"
                    placeholder="e.g. Periodic Assessment / Unit Test 1"
                    value={calForm.title}
                    onChange={(e) => setCalForm({ ...calForm, title: e.target.value })}
                    required
                  />
                </div>

                <div className={styles.formGrid} style={{ marginBottom: 0 }}>
                  <div className={styles.modalFormGroup}>
                    <label>Display Date Text</label>
                    <input
                      type="text"
                      placeholder="e.g. 15 August 2026"
                      value={calForm.date}
                      onChange={(e) => setCalForm({ ...calForm, date: e.target.value })}
                    />
                  </div>

                  <div className={styles.modalFormGroup}>
                    <label>Timing</label>
                    <input
                      type="text"
                      placeholder="e.g. All Day or 9:00 AM - 1:00 PM"
                      value={calForm.time}
                      onChange={(e) => setCalForm({ ...calForm, time: e.target.value })}
                    />
                  </div>

                  <div className={styles.modalFormGroup}>
                    <label>Target Classes / Grades</label>
                    <input
                      type="text"
                      placeholder="e.g. Nursery to Class 10th"
                      value={calForm.grades}
                      onChange={(e) => setCalForm({ ...calForm, grades: e.target.value })}
                    />
                  </div>

                  <div className={styles.modalFormGroup}>
                    <label>Venue / Status</label>
                    <input
                      type="text"
                      placeholder="e.g. School Campus or School Closed"
                      value={calForm.venue}
                      onChange={(e) => setCalForm({ ...calForm, venue: e.target.value })}
                    />
                  </div>
                </div>

                <div className={styles.modalFormGroup}>
                  <label>Event Description & Guidance</label>
                  <textarea
                    rows={2}
                    placeholder="Enter details for students and parents..."
                    value={calForm.description}
                    onChange={(e) => setCalForm({ ...calForm, description: e.target.value })}
                  />
                </div>
              </div>

              <div className={styles.modalFooter}>
                <button
                  type="button"
                  onClick={() => setCalModalOpen(false)}
                  className={styles.cancelBtn}
                >
                  Cancel
                </button>
                <button type="submit" className={styles.submitModalBtn}>
                  <Save size={16} />
                  <span>{editingCalIdx !== null ? "Update Calendar Event" : "Add Calendar Event"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

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
