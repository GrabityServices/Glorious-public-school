import { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { useLocation, useNavigate } from "react-router-dom";
import {
  Search,
  Trash2,
  CheckCircle,
  Phone,
  Mail,
  User,
  Plus,
  Eye,
  Printer,
  X,
  MapPin,
  Calendar,
  Bus,
  Home,
  MessageCircle,
  School,
  FileText,
  Copy,
  Check,
  Clock,
  GraduationCap,
  ChevronDown,
} from "lucide-react";
import styles from "./AdminAdmissions.module.css";
import { useData } from "@/context/DataContext";
import { useConfirm } from "@/context/ConfirmContext";
import useDocumentTitle from "@/hooks/useDocumentTitle";
import EmptyState from "@/components/common/EmptyState";
import { ADMISSION_CLASSES } from "@/data/admissionsData";
import { getAcademicSession } from "@/utils/academicYear";
import {
  sanitizePhoneInput,
  validateIndianPhone,
  validateEmail,
  validateName,
  validateText,
} from "@/utils/validation";

// Helper to format clean 10 or 12 digit phone number for India
const cleanPhoneNumber = (phone) => {
  if (!phone) return "";
  const cleaned = phone.replace(/[^0-9]/g, "");
  if (cleaned.length === 10) return `91${cleaned}`;
  if (cleaned.length === 11 && cleaned.startsWith("0")) return `91${cleaned.slice(1)}`;
  return cleaned;
};

// WhatsApp Link Generator for Online Admissions
const getAdmissionWhatsAppUrl = (inq) => {
  const phone = cleanPhoneNumber(inq.phone);
  if (!phone) return "#";
  const student = inq.studentName || inq.name || "Student";
  const parent = inq.parentName || inq.fatherName || "Parent";
  const grade = inq.applyingClass || inq.gradeApplying || inq.grade || "Admission";
  const code = inq.appId ? `[App ID: ${inq.appId}]` : "";

  const text = `Hello ${parent}, Greetings from Glorious Public School, Jhajha! Regarding the Online Admission Form for ${student} (${grade}) ${code}, we are reviewing your application and would like to coordinate the next steps with you.`;

  return `https://wa.me/${phone}?text=${encodeURIComponent(text)}`;
};

// WhatsApp Link Generator for Contact Form Inquiries (No Admission ID code)
const getContactWhatsAppUrl = (inq) => {
  const phone = cleanPhoneNumber(inq.phone);
  if (!phone) return "#";
  const sender = inq.name || inq.parentName || "Sir/Madam";
  const topic = inq.gradeApplying || inq.grade || "your inquiry";

  const text = `Hello ${sender}, Greetings from Glorious Public School, Jhajha! Regarding your contact message on our website regarding "${topic}", our administration is here to assist you.`;

  return `https://wa.me/${phone}?text=${encodeURIComponent(text)}`;
};

// Mailto Link Generator for Online Admissions
const getAdmissionMailtoUrl = (inq) => {
  if (!inq.email) return "#";
  const student = inq.studentName || inq.name || "Student";
  const parent = inq.parentName || inq.fatherName || "Parent";
  const grade = inq.applyingClass || inq.gradeApplying || inq.grade || "Admission";
  const code = inq.appId ? `(${inq.appId})` : "";

  const subject = `Glorious Public School - Admission Application ${code} for ${student}`;
  const body = `Dear ${parent},\n\nGreetings from Glorious Public School, Jhajha!\n\nWe have received the online student admission application for ${student} for ${grade} (Academic Session ${getAcademicSession()}).\n\nWe would like to invite you and your child for a brief interaction and document baseline review at our Jhajha campus (Near Koltex, Petrol Pump, Jhajha).\n\nBest regards,\nAdmissions Office\nGlorious Public School, Jhajha (Jamui, Bihar)\nContact: 9534105012 / gpsjhajha@gmail.com`;

  return `mailto:${inq.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
};

// Mailto Link Generator for Contact Inquiries
const getContactMailtoUrl = (inq) => {
  if (!inq.email) return "#";
  const sender = inq.name || "Sir/Madam";
  const topic = inq.gradeApplying || inq.grade || "Website Inquiry";

  const subject = `Glorious Public School - Reply to your inquiry (${topic})`;
  const body = `Dear ${sender},\n\nThank you for reaching out to Glorious Public School, Jhajha.\n\nRegarding your message:\n"${inq.message || ""}"\n\nOur administrative desk is at your service. Please feel free to reply to this email or call our helpline at 9534105012.\n\nWarm regards,\nGlorious Public School Desk\nJhajha, Jamui, Bihar`;

  return `mailto:${inq.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
};

// Calculate approximate age from DOB
const calculateAge = (dobString) => {
  if (!dobString) return null;
  const birth = new Date(dobString);
  if (isNaN(birth.getTime())) return null;
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const m = today.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) {
    age--;
  }
  return age > 0 ? `${age} Yrs` : "< 1 Yr";
};

// Custom React Dropdown Component (Uses React Portal to prevent container clipping & inner scrollbars)
function CustomDropdown({
  value,
  options,
  onChange,
  placeholder = "Select Option",
  className = "",
  style = {},
  variant = "default", // "default" | "status"
}) {
  const [open, setOpen] = useState(false);
  const [position, setPosition] = useState({ top: 0, left: 0, width: 140, openUpwards: false });
  const triggerRef = useRef(null);
  const menuRef = useRef(null);

    const calculatePosition = () => {
    if (!triggerRef.current) return;
    const rect = triggerRef.current.getBoundingClientRect();
    const menuHeight = Math.min(options.length * 40 + 16, 260);
    const spaceBelow = window.innerHeight - rect.bottom;
    const openUpwards = spaceBelow < menuHeight && rect.top > menuHeight;

    // Calculate width to fit the longest option without any truncation or scrollbar
    const maxLabelLen = options.reduce((max, o) => Math.max(max, (o.label || "").length), 10);
    const contentNeededWidth = Math.ceil(maxLabelLen * 8.5 + 64);
    const desiredWidth = Math.max(rect.width, contentNeededWidth, variant === "status" ? 185 : 150);
    const menuWidth = Math.min(desiredWidth, window.innerWidth - 24);

    let left = rect.left;
    // If opening from the left extends beyond viewport right edge, align to trigger's right edge
    if (left + menuWidth > window.innerWidth - 12) {
      left = rect.right - menuWidth;
    }
    // If aligning to right edge still goes past the right viewport boundary, clamp
    if (left + menuWidth > window.innerWidth - 12) {
      left = window.innerWidth - menuWidth - 12;
    }
    // Clamp to left viewport boundary
    if (left < 12) {
      left = 12;
    }

    setPosition({
      top: openUpwards ? rect.top - 4 : rect.bottom + 4,
      left,
      width: menuWidth,
      openUpwards,
    });
  };

  const handleToggle = () => {
    if (!open) {
      calculatePosition();
      setOpen(true);
    } else {
      setOpen(false);
    }
  };

  useEffect(() => {
    if (!open) return;

    const handleOutside = (e) => {
      if (
        triggerRef.current && !triggerRef.current.contains(e.target) &&
        menuRef.current && !menuRef.current.contains(e.target)
      ) {
        setOpen(false);
      }
    };

    const handleScrollOrResize = (e) => {
      // If user scrolls inside the dropdown menu itself, don't close
      if (menuRef.current && menuRef.current.contains(e.target)) return;
      setOpen(false);
    };

    document.addEventListener("mousedown", handleOutside);
    window.addEventListener("scroll", handleScrollOrResize, true);
    window.addEventListener("resize", handleScrollOrResize);

    return () => {
      document.removeEventListener("mousedown", handleOutside);
      window.removeEventListener("scroll", handleScrollOrResize, true);
      window.removeEventListener("resize", handleScrollOrResize);
    };
  }, [open]);

  const selected = options.find((o) => o.value === value) || { label: value, value };

  // Status-specific color class
  const getStatusClass = (val) => {
    if (val === "Pending") return styles.statusPending;
    if (val === "Reviewed") return styles.statusReviewed;
    if (val === "Admitted" || val === "Resolved") return styles.statusAdmitted;
    if (val === "Rejected") return styles.statusRejected;
    return "";
  };

  return (
    <div className={styles.dropdownContainer} style={style}>
      <button
        ref={triggerRef}
        type="button"
        className={`${
          variant === "status"
            ? `${styles.tableStatusTrigger} ${getStatusClass(value)}`
            : styles.dropdownTrigger
        } ${open ? styles.dropdownTriggerOpen : ""} ${className}`}
        onClick={handleToggle}
      >
        <span className={styles.dropdownLabel}>{selected?.label || placeholder}</span>
        <ChevronDown
          size={14}
          className={`${styles.dropdownChevron} ${open ? styles.dropdownChevronOpen : ""}`}
        />
      </button>

      {open &&
        createPortal(
          <div
            ref={menuRef}
            data-lenis-prevent="true"
            className={`${styles.dropdownMenuPortal} ${
              position.openUpwards ? styles.dropdownMenuUpwards : ""
            }`}
            style={{
              top: position.openUpwards ? "auto" : `${position.top}px`,
              bottom: position.openUpwards ? `${window.innerHeight - position.top}px` : "auto",
              left: `${position.left}px`,
              width: `${position.width}px`,
              minWidth: `${position.width}px`,
              maxWidth: `calc(100vw - 24px)`,
            }}
          >
            {options.map((opt) => (
              <div
                key={opt.value}
                className={`${styles.dropdownOption} ${opt.value === value ? styles.dropdownOptionActive : ""}`}
                onClick={() => {
                  onChange(opt.value);
                  setOpen(false);
                }}
              >
                <span className={styles.dropdownOptionText}>{opt.label}</span>
                {opt.value === value && <Check size={14} className={styles.dropdownCheck} />}
              </div>
            ))}
          </div>,
          document.body
        )}
    </div>
  );
}

export default function AdminAdmissions() {
  const location = useLocation();
  const navigate = useNavigate();

  // If path is /admin/inquiries, show "contact" tab; otherwise "admissions" tab
  const isContactRoute = location.pathname.includes("/admin/inquiries");
  const [activeTab, setActiveTab] = useState(isContactRoute ? "contact" : "admissions");

  useEffect(() => {
    if (location.pathname.includes("/admin/inquiries")) {
      setActiveTab("contact");
    } else {
      setActiveTab("admissions");
    }
  }, [location.pathname]);

  useDocumentTitle(
    activeTab === "admissions"
      ? "Online Student Admissions | Glorious Admin"
      : "Contact Form Inquiries | Glorious Admin"
  );

  const { inquiries, addInquiry, updateInquiryStatus, deleteInquiry } = useData();
  const confirm = useConfirm();

  // Filters State
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("All");
  const [selectedClass, setSelectedClass] = useState("All");

  // Modal State
  const [viewingDossier, setViewingDossier] = useState(null); // For admissions
  const [viewingMessage, setViewingMessage] = useState(null); // For contact inquiries
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);
  const [copiedAppId, setCopiedAppId] = useState("");
  const [toast, setToast] = useState("");
  const [modalErrors, setModalErrors] = useState({});
  const [modalTouched, setModalTouched] = useState({});

  // Lock background body scroll when any modal is open
  useEffect(() => {
    if (viewingDossier || viewingMessage || isRegisterModalOpen) {
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = originalOverflow;
      };
    }
  }, [viewingDossier, viewingMessage, isRegisterModalOpen]);

  // New Admission Form State
  const [newAdmissionData, setNewAdmissionData] = useState({
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
    message: "",
  });
  const [isSavingNew, setIsSavingNew] = useState(false);

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(""), 3500);
  };

  const copyToClipboard = (text) => {
    navigator.clipboard?.writeText(text);
    setCopiedAppId(text);
    showToast(`Copied ${text} to clipboard!`);
    setTimeout(() => setCopiedAppId(""), 2000);
  };

  const handleTabSwitch = (tab) => {
    setActiveTab(tab);
    setSelectedStatus("All");
    setSearchQuery("");
    if (tab === "admissions") {
      navigate("/admin/admissions");
    } else {
      navigate("/admin/inquiries");
    }
  };

  // 1. Separate Inquiries into Admissions vs Contact Form Submissions
  const admissionsList = inquiries.filter((inq) => {
    return (
      inq.type === "Online Admission" ||
      Boolean(inq.appId || inq.dob || inq.fatherName || inq.applyingClass)
    );
  });

  const contactList = inquiries.filter((inq) => {
    return (
      inq.type === "Contact Inquiry" ||
      inq.type === "General Inquiry" ||
      (!inq.appId && !inq.dob && !inq.fatherName && !inq.applyingClass)
    );
  });

  // Current active dataset
  const currentDataset = activeTab === "admissions" ? admissionsList : contactList;

  // Filter current active dataset
  const filteredList = currentDataset.filter((inq) => {
    // Status Filter
    const matchesStatus =
      selectedStatus === "All" || inq.status === selectedStatus;

    // Contact inquiries tab: No search filter or class filter as requested
    if (activeTab === "contact") {
      return matchesStatus;
    }

    // Class Filter (only for admissions)
    const inqClass = inq.applyingClass || inq.gradeApplying || inq.grade || "";
    const matchesClass =
      selectedClass === "All" ||
      inqClass === selectedClass;

    // Search Query (only for admissions)
    const query = searchQuery.toLowerCase().trim();
    if (!query) return matchesStatus && matchesClass;

    const matchesSearch =
      (inq.studentName && inq.studentName.toLowerCase().includes(query)) ||
      (inq.name && inq.name.toLowerCase().includes(query)) ||
      (inq.parentName && inq.parentName.toLowerCase().includes(query)) ||
      (inq.fatherName && inq.fatherName.toLowerCase().includes(query)) ||
      (inq.motherName && inq.motherName.toLowerCase().includes(query)) ||
      (inq.phone && inq.phone.includes(query)) ||
      (inq.email && inq.email.toLowerCase().includes(query)) ||
      (inq.appId && inq.appId.toLowerCase().includes(query)) ||
      (inq.address && inq.address.toLowerCase().includes(query)) ||
      (inq.message && inq.message.toLowerCase().includes(query)) ||
      (inqClass && inqClass.toLowerCase().includes(query));

    return matchesStatus && matchesClass && matchesSearch;
  });

  const handleStatusChange = (id, newStatus) => {
    updateInquiryStatus(id, newStatus);
    showToast(`Status updated to "${newStatus}".`);
    if (viewingDossier && (viewingDossier.id === id || viewingDossier._id === id)) {
      setViewingDossier((prev) => ({ ...prev, status: newStatus }));
    }
    if (viewingMessage && (viewingMessage.id === id || viewingMessage._id === id)) {
      setViewingMessage((prev) => ({ ...prev, status: newStatus }));
    }
  };

  const handleDelete = async (id, name) => {
    const confirmed = await confirm({
      title: activeTab === "admissions" ? "Delete Admission Record?" : "Delete Contact Message?",
      message: "Are you sure you want to permanently delete this record? This action cannot be undone.",
      itemName: name,
      confirmText: "Yes, Delete",
      cancelText: "Cancel",
      variant: "danger",
    });
    if (confirmed) {
      deleteInquiry(id);
      showToast("Record permanently deleted.");
      if (viewingDossier && (viewingDossier.id === id || viewingDossier._id === id)) {
        setViewingDossier(null);
      }
      if (viewingMessage && (viewingMessage.id === id || viewingMessage._id === id)) {
        setViewingMessage(null);
      }
    }
  };

  // Register New Student manually (walk-in/phone)
  const handleSaveNewAdmission = async (e) => {
    e.preventDefault();

    const nameRes = validateName(newAdmissionData.studentName, "Student Full Name");
    const fatherRes = validateName(newAdmissionData.fatherName, "Father's Name");
    const motherRes = newAdmissionData.motherName
      ? validateName(newAdmissionData.motherName, "Mother's Name")
      : { isValid: true };
    const phoneRes = validateIndianPhone(newAdmissionData.phone, true);
    const emailRes = validateEmail(newAdmissionData.email, false);
    const dobValid = Boolean(newAdmissionData.dob);
    const addrRes = validateText(newAdmissionData.address, "Residential Address", 5, true);

    const newErrors = {};
    if (!nameRes.isValid) newErrors.studentName = nameRes.error;
    if (!dobValid) newErrors.dob = "Please select Date of Birth.";
    if (!fatherRes.isValid) newErrors.fatherName = fatherRes.error;
    if (!motherRes.isValid) newErrors.motherName = motherRes.error;
    if (!phoneRes.isValid) newErrors.phone = phoneRes.error;
    if (!emailRes.isValid) newErrors.email = emailRes.error;
    if (!addrRes.isValid) newErrors.address = addrRes.error;

    setModalErrors(newErrors);
    setModalTouched({
      studentName: true,
      dob: true,
      fatherName: true,
      motherName: true,
      phone: true,
      email: true,
      address: true,
    });

    if (Object.keys(newErrors).length > 0) {
      showToast("Please correct the highlighted errors in the form.");
      return;
    }

    setIsSavingNew(true);
    const generatedAppId = "GPS-" + Math.floor(100000 + Math.random() * 900000);

    try {
      await addInquiry({
        ...newAdmissionData,
        studentName: newAdmissionData.studentName.trim(),
        fatherName: newAdmissionData.fatherName.trim(),
        motherName: newAdmissionData.motherName.trim(),
        phone: newAdmissionData.phone.trim(),
        email: newAdmissionData.email.trim(),
        address: newAdmissionData.address.trim(),
        appId: generatedAppId,
        type: "Online Admission",
        gradeApplying: newAdmissionData.applyingClass,
        message:
          newAdmissionData.message ||
          `Manual Desk Admission for ${newAdmissionData.applyingClass} (Session ${getAcademicSession()})`,
      });

      showToast(`Student ${newAdmissionData.studentName} registered successfully (${generatedAppId})!`);
      setIsRegisterModalOpen(false);
      setModalErrors({});
      setModalTouched({});
      setNewAdmissionData({
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
        message: "",
      });
    } catch (err) {
      console.error(err);
      showToast("Failed to register admission. Please try again.");
    } finally {
      setIsSavingNew(false);
    }
  };

  // Metrics for Admissions Tab
  const admTotal = admissionsList.length;
  const admPending = admissionsList.filter((i) => i.status === "Pending").length;
  const admReviewed = admissionsList.filter((i) => i.status === "Reviewed").length;
  const admAdmitted = admissionsList.filter((i) => i.status === "Admitted").length;
  const admTransport = admissionsList.filter((i) => i.needTransport === "Yes").length;

  // Metrics for Contact Tab
  const cntTotal = contactList.length;
  const cntPending = contactList.filter((i) => i.status === "Pending").length;
  const cntReviewed = contactList.filter((i) => i.status === "Reviewed").length;
  const cntResolved = contactList.filter((i) => i.status === "Admitted" || i.status === "Resolved").length;

  // Status Filter Options for Admissions
  const admissionStatusOptions = [
    { label: "All", value: "All", count: admTotal },
    { label: "Pending Review", value: "Pending", count: admPending },
    { label: "Reviewed / Contacted", value: "Reviewed", count: admReviewed },
    { label: "Admitted", value: "Admitted", count: admAdmitted },
    { label: "Rejected", value: "Rejected", count: admissionsList.filter((i) => i.status === "Rejected").length },
  ];

  // Status Filter Options for Contact Inquiries
  const contactStatusOptions = [
    { label: "All Messages", value: "All", count: cntTotal },
    { label: "New / Pending", value: "Pending", count: cntPending },
    { label: "Contacted / Replied", value: "Reviewed", count: cntReviewed },
    { label: "Resolved", value: "Admitted", count: cntResolved },
  ];

  const currentStatusOptions =
    activeTab === "admissions" ? admissionStatusOptions : contactStatusOptions;

  // Dropdown options for admission status changes
  const tableStatusOptions = [
    { label: "Pending Review", value: "Pending" },
    { label: "Reviewed / Contacted", value: "Reviewed" },
    { label: "Admitted", value: "Admitted" },
    { label: "Rejected", value: "Rejected" },
  ];

  // Dropdown options for contact status changes
  const contactTableStatusOptions = [
    { label: "New / Pending", value: "Pending" },
    { label: "Contacted / Replied", value: "Reviewed" },
    { label: "Resolved", value: "Admitted" },
  ];

  // Class options for class filter
  const classFilterOptions = [
    { label: "All Classes", value: "All" },
    ...ADMISSION_CLASSES.map((cls) => ({ label: cls, value: cls })),
  ];

  return (
    <div className={styles.pageWrapper}>
      {/* Toast Alert */}
      {toast && (
        <div className={styles.toastAlert}>
          <CheckCircle size={18} />
          <span>{toast}</span>
        </div>
      )}

      {/* TOP SECTION TABS: ONLINE ADMISSIONS vs CONTACT INQUIRIES */}
      <div className={styles.topNavTabs}>
        <button
          type="button"
          className={`${styles.topTabBtn} ${activeTab === "admissions" ? styles.topTabBtnActive : ""}`}
          onClick={() => handleTabSwitch("admissions")}
        >
          <GraduationCap size={18} />
          <span>Online Student Admissions</span>
          <span className={styles.tabBadge}>{admissionsList.length}</span>
        </button>

        <button
          type="button"
          className={`${styles.topTabBtn} ${activeTab === "contact" ? styles.topTabBtnActive : ""}`}
          onClick={() => handleTabSwitch("contact")}
        >
          <Mail size={18} />
          <span>Contact Form Inquiries</span>
          <span className={styles.tabBadge}>{contactList.length}</span>
        </button>
      </div>

      {/* =========================================================
          SECTION 1: ONLINE STUDENT ADMISSIONS
          ========================================================= */}
      {activeTab === "admissions" && (
        <>
          {/* Mini Stats Ribbon */}
          <div className={styles.statsRow}>
            <div className={`${styles.statMiniCard} ${styles.statCard_blue}`}>
              <div>
                <div className={styles.statVal}>{admTotal}</div>
                <div className={styles.statLabel}>Total Registrations</div>
              </div>
              <FileText size={26} color="#0ea5e9" opacity={0.3} />
            </div>

            <div className={`${styles.statMiniCard} ${styles.statCard_amber}`}>
              <div>
                <div className={styles.statVal}>
                  <span>{admPending}</span>
                  {admPending > 0 && <span className={styles.pulseDot} title="Needs Review" />}
                </div>
                <div className={styles.statLabel}>Pending Review</div>
              </div>
              <Clock size={26} color="#f59e0b" opacity={0.3} />
            </div>

            <div className={`${styles.statMiniCard} ${styles.statCard_indigo}`}>
              <div>
                <div className={styles.statVal}>{admReviewed}</div>
                <div className={styles.statLabel}>Contacted / Reviewed</div>
              </div>
              <MessageCircle size={26} color="#6366f1" opacity={0.3} />
            </div>

            <div className={`${styles.statMiniCard} ${styles.statCard_emerald}`}>
              <div>
                <div className={styles.statVal}>{admAdmitted}</div>
                <div className={styles.statLabel}>Admitted Students</div>
              </div>
              <CheckCircle size={26} color="#10b981" opacity={0.3} />
            </div>

            <div className={`${styles.statMiniCard} ${styles.statCard_purple}`}>
              <div>
                <div className={styles.statVal}>{admTransport}</div>
                <div className={styles.statLabel}>Bus Route Requests</div>
              </div>
              <Bus size={26} color="#8b5cf6" opacity={0.3} />
            </div>
          </div>

          {/* Action & Filter Bar */}
          <div className={styles.actionBar}>
            <div className={styles.searchAndControls}>
              {/* Search Box */}
              <div className={styles.searchWrap}>
                <Search size={16} className={styles.searchIcon} />
                <input
                  type="text"
                  placeholder="Search student, parent, phone, App ID, location..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className={styles.searchInput}
                />
              </div>

              {/* Controls Right */}
              <div className={styles.controlsRight}>
                {/* Custom Class Dropdown (NO OS DUAL-BOX GLITCH) */}
                <CustomDropdown
                  value={selectedClass}
                  options={classFilterOptions}
                  onChange={setSelectedClass}
                  style={{ minWidth: "150px" }}
                />

                {/* Register New Student Button */}
                <button
                  type="button"
                  className={styles.addBtn}
                  onClick={() => setIsRegisterModalOpen(true)}
                >
                  <Plus size={16} />
                  <span>Register Student</span>
                </button>
              </div>
            </div>

            {/* Interactive Status Pills Row (NO GLITCHY NATIVE OS DROPDOWN) */}
            <div className={styles.statusPillsRow}>
              <span className={styles.statusPillsLabel}>Status Filter:</span>
              {currentStatusOptions.map((st) => (
                <button
                  key={st.value}
                  type="button"
                  className={`${styles.statusPill} ${selectedStatus === st.value ? styles.statusPillActive : ""}`}
                  onClick={() => setSelectedStatus(st.value)}
                >
                  <span
                    className={`${styles.pillDot} ${
                      styles[`dot_${st.value.toLowerCase().replace(/[^a-z]/g, "")}`] || styles.dot_all
                    }`}
                  />
                  <span>{st.label}</span>
                  <span className={styles.pillCount}>{st.count}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Online Admissions Table */}
          <div className={styles.tableCard}>
            <div className={styles.tableWrapper} data-lenis-prevent="true">
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>App Code / Date</th>
                    <th>Student Particulars</th>
                    <th>Class & Facilities</th>
                    <th>Parent & Address</th>
                    <th>Direct Contact (Call / WA / Mail)</th>
                    <th>Status Action</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredList.length > 0 ? (
                    filteredList.map((inq) => {
                      const itemId = inq.id || inq._id;
                      const grade = inq.applyingClass || inq.gradeApplying || inq.grade || "Nursery";
                      const phoneClean = cleanPhoneNumber(inq.phone);
                      const waUrl = getAdmissionWhatsAppUrl(inq);
                      const mailtoUrl = getAdmissionMailtoUrl(inq);
                      const hasEmail = Boolean(inq.email && inq.email.trim());
                      const hasPhone = Boolean(phoneClean && phoneClean.length >= 10);
                      const studentAge = calculateAge(inq.dob);

                      return (
                        <tr key={itemId}>
                          {/* Application Code & Date */}
                          <td className={styles.appCodeCol}>
                            <div
                              className={styles.appIdBadge}
                              onClick={() => copyToClipboard(inq.appId || itemId.slice(-6).toUpperCase())}
                              title="Click to copy Application ID"
                            >
                              <span>{inq.appId || `GPS-${itemId.slice(-6).toUpperCase()}`}</span>
                              {copiedAppId === (inq.appId || itemId.slice(-6).toUpperCase()) ? (
                                <Check size={12} color="#059669" />
                              ) : (
                                <Copy size={11} color="#64748b" />
                              )}
                            </div>
                            <div className={styles.dateSubtext}>{inq.date || "Recent"}</div>
                          </td>

                          {/* Student Particulars (NO EMOJIS - Clean SVG User Icon) */}
                          <td className={styles.studentCol}>
                            <h4>
                              <span className={styles.studentUserIcon}>
                                <User size={14} />
                              </span>
                              <span>{inq.studentName || inq.name || "Student"}</span>
                            </h4>
                            <div className={styles.studentMeta}>
                              {inq.gender && <span className={styles.genderTag}>{inq.gender}</span>}
                              {inq.dob && (
                                <span title={`DOB: ${inq.dob}`}>
                                  DOB: {inq.dob} {studentAge ? `(${studentAge})` : ""}
                                </span>
                              )}
                            </div>
                            {inq.previousSchool && (
                              <div className={styles.prevSchoolTag}>Prev: {inq.previousSchool}</div>
                            )}
                          </td>

                          {/* Class & Facilities */}
                          <td>
                            <span className={styles.classBadge}>{grade}</span>
                            <div className={styles.facilityTags}>
                              <span className={inq.needTransport === "Yes" ? styles.facilityTagActive : ""}>
                                <Bus size={12} />
                                <span>Bus: {inq.needTransport === "Yes" ? "Required" : "No"}</span>
                              </span>
                              <span className={inq.needHostel === "Yes" ? styles.facilityTagActive : ""}>
                                <Home size={12} />
                                <span>Hostel: {inq.needHostel === "Yes" ? "Required" : "Day Scholar"}</span>
                              </span>
                            </div>
                          </td>

                          {/* Parent & Address */}
                          <td className={styles.parentCol}>
                            <div className={styles.parentNameText}>
                              {inq.fatherName
                                ? `F: ${inq.fatherName}`
                                : inq.parentName
                                ? inq.parentName
                                : "Parent / Guardian"}
                            </div>
                            {inq.motherName && (
                              <div style={{ color: "#64748b", fontSize: "0.76rem" }}>
                                M: {inq.motherName}
                              </div>
                            )}
                            {inq.address && (
                              <div className={styles.addressText} title={inq.address}>
                                <MapPin size={12} style={{ flexShrink: 0, marginTop: 2 }} />
                                <span>{inq.address}</span>
                              </div>
                            )}
                          </td>

                          {/* DIRECT CONTACT (CALL, WHATSAPP, EMAIL) */}
                          <td>
                            <div className={styles.contactActionGroup}>
                              {/* 1. Direct Call Link */}
                              {hasPhone ? (
                                <a
                                  href={`tel:${phoneClean}`}
                                  className={styles.actionBtnCall}
                                  title={`Direct Phone Call to ${inq.phone}`}
                                >
                                  <Phone size={15} />
                                </a>
                              ) : (
                                <span className={`${styles.actionBtnCall} ${styles.actionBtnDisabled}`} title="No phone">
                                  <Phone size={15} />
                                </span>
                              )}

                              {/* 2. Direct WhatsApp Link */}
                              {hasPhone ? (
                                <a
                                  href={waUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className={styles.actionBtnWhatsApp}
                                  title={`Open WhatsApp chat with ${inq.parentName || inq.studentName} (${inq.phone})`}
                                >
                                  <MessageCircle size={15} />
                                </a>
                              ) : (
                                <span className={`${styles.actionBtnWhatsApp} ${styles.actionBtnDisabled}`} title="No WhatsApp">
                                  <MessageCircle size={15} />
                                </span>
                              )}

                              {/* 3. Direct Email Link */}
                              {hasEmail ? (
                                <a
                                  href={mailtoUrl}
                                  className={styles.actionBtnEmail}
                                  title={`Send Email to ${inq.email}`}
                                >
                                  <Mail size={15} />
                                </a>
                              ) : (
                                <span className={`${styles.actionBtnEmail} ${styles.actionBtnDisabled}`} title="No email">
                                  <Mail size={15} />
                                </span>
                              )}
                            </div>
                            <div className={styles.phoneNumSnippet}>{inq.phone || "No phone"}</div>
                          </td>

                          {/* Status Selector (Custom Dropdown - No OS Glitch) */}
                          <td>
                            <CustomDropdown
                              value={inq.status || "Pending"}
                              options={tableStatusOptions}
                              onChange={(newStatus) => handleStatusChange(itemId, newStatus)}
                              variant="status"
                              style={{ width: "135px" }}
                            />
                          </td>

                          {/* Actions */}
                          <td>
                            <div className={styles.rowActionsGroup}>
                              <button
                                type="button"
                                onClick={() => setViewingDossier(inq)}
                                className={styles.viewDossierBtn}
                                title="View Full Student Admission Dossier"
                              >
                                <Eye size={14} />
                                <span>Details</span>
                              </button>

                              <button
                                type="button"
                                onClick={() => handleDelete(itemId, inq.studentName || inq.name)}
                                className={styles.deleteBtn}
                                title="Delete Admission Record"
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan={7} style={{ padding: "36px 16px" }}>
                        <EmptyState
                          icon={User}
                          title="No Student Admission Records Found"
                          description={
                            searchQuery || selectedStatus !== "All" || selectedClass !== "All"
                              ? "No applications match your active search filter or category criteria."
                              : "No student admission forms have been registered yet."
                          }
                          actionText={
                            searchQuery || selectedStatus !== "All" || selectedClass !== "All"
                              ? "Reset Filters"
                              : "+ Register First Student"
                          }
                          onAction={() => {
                            if (searchQuery || selectedStatus !== "All" || selectedClass !== "All") {
                              setSearchQuery("");
                              setSelectedStatus("All");
                              setSelectedClass("All");
                            } else {
                              setIsRegisterModalOpen(true);
                            }
                          }}
                          compact
                        />
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* =========================================================
          SECTION 2: CONTACT FORM INQUIRIES (NO UNIQUE CODE)
          ========================================================= */}
      {activeTab === "contact" && (
        <>
          {/* Mini Stats Ribbon for Contact */}
          <div className={`${styles.statsRow} ${styles.statsRow4}`}>
            <div className={`${styles.statMiniCard} ${styles.statCard_blue}`}>
              <div>
                <div className={styles.statVal}>{cntTotal}</div>
                <div className={styles.statLabel}>Total Contact Inquiries</div>
              </div>
              <Mail size={26} color="#0ea5e9" opacity={0.3} />
            </div>

            <div className={`${styles.statMiniCard} ${styles.statCard_amber}`}>
              <div>
                <div className={styles.statVal}>
                  <span>{cntPending}</span>
                  {cntPending > 0 && <span className={styles.pulseDot} title="Unread Inquiry" />}
                </div>
                <div className={styles.statLabel}>New / Pending</div>
              </div>
              <Clock size={26} color="#f59e0b" opacity={0.3} />
            </div>

            <div className={`${styles.statMiniCard} ${styles.statCard_indigo}`}>
              <div>
                <div className={styles.statVal}>{cntReviewed}</div>
                <div className={styles.statLabel}>Contacted / Replied</div>
              </div>
              <MessageCircle size={26} color="#6366f1" opacity={0.3} />
            </div>

            <div className={`${styles.statMiniCard} ${styles.statCard_emerald}`}>
              <div>
                <div className={styles.statVal}>{cntResolved}</div>
                <div className={styles.statLabel}>Resolved Queries</div>
              </div>
              <CheckCircle size={26} color="#10b981" opacity={0.3} />
            </div>
          </div>

          {/* Action & Filter Bar for Contact (Search options removed completely) */}
          <div className={styles.actionBar}>
            {/* Status Pills */}
            <div className={styles.statusPillsRow} style={{ borderTop: "none", paddingTop: 0 }}>
              <span className={styles.statusPillsLabel}>Filter by Message Status:</span>
              {currentStatusOptions.map((st) => (
                <button
                  key={st.value}
                  type="button"
                  className={`${styles.statusPill} ${selectedStatus === st.value ? styles.statusPillActive : ""}`}
                  onClick={() => setSelectedStatus(st.value)}
                >
                  <span
                    className={`${styles.pillDot} ${
                      styles[`dot_${st.value.toLowerCase().replace(/[^a-z]/g, "")}`] || styles.dot_all
                    }`}
                  />
                  <span>{st.label}</span>
                  <span className={styles.pillCount}>{st.count}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Contact Inquiries Table (NO UNIQUE CODE) */}
          <div className={styles.tableCard}>
            <div className={styles.tableWrapper} data-lenis-prevent="true">
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>Sender & Date</th>
                    <th>Inquiry Topic</th>
                    <th>Message Details</th>
                    <th>Direct Contact (Call / WA / Mail)</th>
                    <th>Status Action</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredList.length > 0 ? (
                    filteredList.map((inq) => {
                      const itemId = inq.id || inq._id;
                      const sender = inq.name || inq.parentName || "Website Visitor";
                      const phoneClean = cleanPhoneNumber(inq.phone);
                      const waUrl = getContactWhatsAppUrl(inq);
                      const mailtoUrl = getContactMailtoUrl(inq);
                      const hasEmail = Boolean(inq.email && inq.email.trim());
                      const hasPhone = Boolean(phoneClean && phoneClean.length >= 10);
                      const topic = inq.gradeApplying || inq.grade || "General Inquiry";

                      return (
                        <tr key={itemId}>
                          {/* Sender & Date (NO GPS CODE) */}
                          <td className={styles.studentCol}>
                            <h4>
                              <span className={styles.studentUserIcon} style={{ background: "#e0f2fe", color: "#0284c7" }}>
                                <User size={14} />
                              </span>
                              <span>{sender}</span>
                            </h4>
                            <div className={styles.dateSubtext}>{inq.date || "Recent"}</div>
                          </td>

                          {/* Inquiry Topic */}
                          <td>
                            <span className={styles.topicBadge}>{topic}</span>
                          </td>

                          {/* Message Content */}
                          <td>
                            <div className={styles.contactMessageCol} title={inq.message}>
                              {inq.message || "No specific message text provided."}
                            </div>
                          </td>

                          {/* Direct Contact Links */}
                          <td>
                            <div className={styles.contactActionGroup}>
                              {hasPhone ? (
                                <a
                                  href={`tel:${phoneClean}`}
                                  className={styles.actionBtnCall}
                                  title={`Call ${sender} (${inq.phone})`}
                                >
                                  <Phone size={15} />
                                </a>
                              ) : (
                                <span className={`${styles.actionBtnCall} ${styles.actionBtnDisabled}`} title="No phone">
                                  <Phone size={15} />
                                </span>
                              )}

                              {hasPhone ? (
                                <a
                                  href={waUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className={styles.actionBtnWhatsApp}
                                  title={`Open WhatsApp chat with ${sender}`}
                                >
                                  <MessageCircle size={15} />
                                </a>
                              ) : (
                                <span className={`${styles.actionBtnWhatsApp} ${styles.actionBtnDisabled}`} title="No WhatsApp">
                                  <MessageCircle size={15} />
                                </span>
                              )}

                              {hasEmail ? (
                                <a
                                  href={mailtoUrl}
                                  className={styles.actionBtnEmail}
                                  title={`Email ${inq.email}`}
                                >
                                  <Mail size={15} />
                                </a>
                              ) : (
                                <span className={`${styles.actionBtnEmail} ${styles.actionBtnDisabled}`} title="No email">
                                  <Mail size={15} />
                                </span>
                              )}
                            </div>
                            <div className={styles.phoneNumSnippet}>{inq.phone || "No phone"}</div>
                          </td>

                          {/* Status */}
                          <td>
                            <CustomDropdown
                              value={inq.status || "Pending"}
                              options={contactTableStatusOptions}
                              onChange={(newStatus) => handleStatusChange(itemId, newStatus)}
                              variant="status"
                              style={{ width: "135px" }}
                            />
                          </td>

                          {/* Actions */}
                          <td>
                            <div className={styles.rowActionsGroup}>
                              <button
                                type="button"
                                onClick={() => setViewingMessage(inq)}
                                className={styles.viewDossierBtn}
                                title="View Message Details"
                              >
                                <Eye size={14} />
                                <span>Message</span>
                              </button>

                              <button
                                type="button"
                                onClick={() => handleDelete(itemId, sender)}
                                className={styles.deleteBtn}
                                title="Delete Message"
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan={6} style={{ padding: "36px 16px" }}>
                        <EmptyState
                          icon={Mail}
                          title="No Contact Inquiries Found"
                          description={
                            selectedStatus !== "All"
                              ? "No messages match your selected status criteria."
                              : "No general contact messages have been submitted yet."
                          }
                          actionText={selectedStatus !== "All" ? "View All Messages" : null}
                          onAction={() => {
                            setSelectedStatus("All");
                          }}
                          compact
                        />
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* =========================================================
          MODAL 1: STUDENT ADMISSION DOSSIER
          ========================================================= */}
      {viewingDossier && (
        <div
          className={styles.modalBackdrop}
          onClick={() => setViewingDossier(null)}
          data-lenis-prevent="true"
        >
          <div
            className={styles.modalCard}
            onClick={(e) => e.stopPropagation()}
            data-lenis-prevent="true"
          >
            <div className={styles.modalHeader}>
              <div className={styles.modalHeaderTitle}>
                <School size={20} color="#dc2626" />
                <span>Student Admission Dossier</span>
              </div>
              <button
                type="button"
                className={styles.modalCloseBtn}
                onClick={() => setViewingDossier(null)}
              >
                <X size={20} />
              </button>
            </div>

            <div className={styles.modalBody} data-lenis-prevent="true">
              {/* Badge & Code Header */}
              <div className={styles.dossierBadgeHeader}>
                <div>
                  <div style={{ fontSize: "0.78rem", color: "#9a3412", fontWeight: 700 }}>
                    ONLINE ADMISSION APPLICATION
                  </div>
                  <div style={{ fontSize: "1.15rem", fontWeight: 800, color: "#7c2d12" }}>
                    {viewingDossier.appId || `GPS-${(viewingDossier.id || viewingDossier._id).slice(-6).toUpperCase()}`}
                  </div>
                </div>
                <div>
                  <span className={styles.classBadge} style={{ fontSize: "0.95rem", padding: "4px 12px" }}>
                    {viewingDossier.applyingClass || viewingDossier.gradeApplying || viewingDossier.grade || "Nursery"}
                  </span>
                </div>
              </div>

              {/* DIRECT CONTACT ACTION BAR INSIDE MODAL */}
              <div className={styles.modalContactBar}>
                <span className={styles.modalContactLabel}>Direct Contact Links:</span>

                {viewingDossier.phone && (
                  <a
                    href={`tel:${cleanPhoneNumber(viewingDossier.phone)}`}
                    className={styles.modalActionBtnCall}
                    title="Direct Phone Call"
                  >
                    <Phone size={15} />
                    <span>Call Parent ({viewingDossier.phone})</span>
                  </a>
                )}

                {viewingDossier.phone && (
                  <a
                    href={getAdmissionWhatsAppUrl(viewingDossier)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={styles.modalActionBtnWhatsApp}
                    title="Direct WhatsApp Chat"
                  >
                    <MessageCircle size={15} />
                    <span>WhatsApp Chat</span>
                  </a>
                )}

                {viewingDossier.email && (
                  <a
                    href={getAdmissionMailtoUrl(viewingDossier)}
                    className={styles.modalActionBtnEmail}
                    title="Send Email"
                  >
                    <Mail size={15} />
                    <span>Email Parent</span>
                  </a>
                )}
              </div>

              {/* 1. Student Particulars (NO EMOJIS) */}
              <div className={styles.dossierSection}>
                <div className={styles.dossierSectionTitle}>
                  <User size={15} color="#475569" />
                  <span>Student Particulars</span>
                </div>
                <div className={styles.dossierGrid}>
                  <div className={styles.dossierItem}>
                    <span className={styles.dossierLabel}>Student Full Name</span>
                    <span className={styles.dossierValue}>
                      {viewingDossier.studentName || viewingDossier.name || "N/A"}
                    </span>
                  </div>

                  <div className={styles.dossierItem}>
                    <span className={styles.dossierLabel}>Date of Birth & Age</span>
                    <span className={styles.dossierValue}>
                      {viewingDossier.dob || "Not specified"}{" "}
                      {calculateAge(viewingDossier.dob) ? `(${calculateAge(viewingDossier.dob)})` : ""}
                    </span>
                  </div>

                  <div className={styles.dossierItem}>
                    <span className={styles.dossierLabel}>Gender</span>
                    <span className={styles.dossierValue}>{viewingDossier.gender || "Male"}</span>
                  </div>

                  <div className={styles.dossierItem}>
                    <span className={styles.dossierLabel}>Class Applied For</span>
                    <span className={styles.dossierValue}>
                      {viewingDossier.applyingClass || viewingDossier.gradeApplying || "Nursery"}
                    </span>
                  </div>

                  <div className={styles.dossierItem} style={{ gridColumn: "span 2" }}>
                    <span className={styles.dossierLabel}>Previous School Attended</span>
                    <span className={styles.dossierValue}>
                      {viewingDossier.previousSchool || "Fresh admission / None"}
                    </span>
                  </div>
                </div>
              </div>

              {/* 2. Parent & Contact Details */}
              <div className={styles.dossierSection}>
                <div className={styles.dossierSectionTitle}>
                  <Phone size={15} color="#475569" />
                  <span>Parent & Contact Information</span>
                </div>
                <div className={styles.dossierGrid}>
                  <div className={styles.dossierItem}>
                    <span className={styles.dossierLabel}>Father's / Guardian's Name</span>
                    <span className={styles.dossierValue}>
                      {viewingDossier.fatherName || viewingDossier.parentName || "N/A"}
                    </span>
                  </div>

                  <div className={styles.dossierItem}>
                    <span className={styles.dossierLabel}>Mother's Name</span>
                    <span className={styles.dossierValue}>{viewingDossier.motherName || "N/A"}</span>
                  </div>

                  <div className={styles.dossierItem}>
                    <span className={styles.dossierLabel}>Primary Contact Phone</span>
                    <span className={styles.dossierValue}>{viewingDossier.phone || "N/A"}</span>
                  </div>

                  <div className={styles.dossierItem}>
                    <span className={styles.dossierLabel}>Email Address</span>
                    <span className={styles.dossierValue}>{viewingDossier.email || "Not provided"}</span>
                  </div>

                  <div className={styles.dossierItem} style={{ gridColumn: "span 2" }}>
                    <span className={styles.dossierLabel}>Residential Address</span>
                    <span className={styles.dossierValue}>{viewingDossier.address || "N/A"}</span>
                  </div>
                </div>
              </div>

              {/* 3. Facilities & Remarks */}
              <div className={styles.dossierSection}>
                <div className={styles.dossierSectionTitle}>
                  <Bus size={15} color="#475569" />
                  <span>Facilities & Remarks</span>
                </div>
                <div className={styles.dossierGrid}>
                  <div className={styles.dossierItem}>
                    <span className={styles.dossierLabel}>School Bus Transport</span>
                    <span className={styles.dossierValue}>
                      {viewingDossier.needTransport === "Yes"
                        ? "Yes (Jhajha / Jamui Route)"
                        : "No (Self Conveyance)"}
                    </span>
                  </div>

                  <div className={styles.dossierItem}>
                    <span className={styles.dossierLabel}>Hostel / Boarding</span>
                    <span className={styles.dossierValue}>
                      {viewingDossier.needHostel === "Yes" ? "Yes (Hostel Boarding)" : "No (Day Scholar)"}
                    </span>
                  </div>

                  <div className={styles.dossierItem} style={{ gridColumn: "span 2" }}>
                    <span className={styles.dossierLabel}>Message / Queries</span>
                    <span className={styles.dossierValue} style={{ fontWeight: 400 }}>
                      {viewingDossier.message || "No specific queries noted."}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className={styles.modalFooter}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ fontSize: "0.82rem", fontWeight: 700, color: "#475569" }}>Status:</span>
                <CustomDropdown
                  value={viewingDossier.status || "Pending"}
                  options={tableStatusOptions}
                  onChange={(newStatus) =>
                    handleStatusChange(viewingDossier.id || viewingDossier._id, newStatus)
                  }
                  variant="status"
                  style={{ minWidth: "175px" }}
                />
              </div>

              <div className={styles.modalFooterRight}>
                <button
                  type="button"
                  className={styles.printBtn}
                  onClick={() => window.print()}
                >
                  <Printer size={15} />
                  <span>Print Slip</span>
                </button>

                <button
                  type="button"
                  className={styles.addBtn}
                  onClick={() => setViewingDossier(null)}
                >
                  <span>Done</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================
          MODAL 2: CONTACT INQUIRY DETAILS (NO UNIQUE CODE)
          ========================================================= */}
      {viewingMessage && (
        <div
          className={styles.modalBackdrop}
          onClick={() => setViewingMessage(null)}
          data-lenis-prevent="true"
        >
          <div
            className={styles.modalCard}
            onClick={(e) => e.stopPropagation()}
            data-lenis-prevent="true"
          >
            <div className={styles.modalHeader}>
              <div className={styles.modalHeaderTitle}>
                <Mail size={20} color="#0284c7" />
                <span>Contact Form Message Details</span>
              </div>
              <button
                type="button"
                className={styles.modalCloseBtn}
                onClick={() => setViewingMessage(null)}
              >
                <X size={20} />
              </button>
            </div>

            <div className={styles.modalBody} data-lenis-prevent="true">
              {/* Direct Reply Bar */}
              <div className={styles.modalContactBar}>
                <span className={styles.modalContactLabel}>Reply Directly:</span>

                {viewingMessage.phone && (
                  <a
                    href={`tel:${cleanPhoneNumber(viewingMessage.phone)}`}
                    className={styles.modalActionBtnCall}
                    title="Direct Phone Call"
                  >
                    <Phone size={15} />
                    <span>Call ({viewingMessage.phone})</span>
                  </a>
                )}

                {viewingMessage.phone && (
                  <a
                    href={getContactWhatsAppUrl(viewingMessage)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={styles.modalActionBtnWhatsApp}
                    title="WhatsApp Chat"
                  >
                    <MessageCircle size={15} />
                    <span>WhatsApp</span>
                  </a>
                )}

                {viewingMessage.email && (
                  <a
                    href={getContactMailtoUrl(viewingMessage)}
                    className={styles.modalActionBtnEmail}
                    title="Send Email Reply"
                  >
                    <Mail size={15} />
                    <span>Email Reply</span>
                  </a>
                )}
              </div>

              {/* Sender Information */}
              <div className={styles.dossierSection}>
                <div className={styles.dossierSectionTitle}>
                  <User size={15} color="#475569" />
                  <span>Sender Information</span>
                </div>
                <div className={styles.dossierGrid}>
                  <div className={styles.dossierItem}>
                    <span className={styles.dossierLabel}>Sender Name</span>
                    <span className={styles.dossierValue}>
                      {viewingMessage.name || viewingMessage.studentName || "Website Visitor"}
                    </span>
                  </div>

                  <div className={styles.dossierItem}>
                    <span className={styles.dossierLabel}>Received Date</span>
                    <span className={styles.dossierValue}>{viewingMessage.date || "Recent"}</span>
                  </div>

                  <div className={styles.dossierItem}>
                    <span className={styles.dossierLabel}>Contact Phone</span>
                    <span className={styles.dossierValue}>{viewingMessage.phone || "Not provided"}</span>
                  </div>

                  <div className={styles.dossierItem}>
                    <span className={styles.dossierLabel}>Email Address</span>
                    <span className={styles.dossierValue}>{viewingMessage.email || "Not provided"}</span>
                  </div>

                  <div className={styles.dossierItem} style={{ gridColumn: "span 2" }}>
                    <span className={styles.dossierLabel}>Inquiry Subject / Topic</span>
                    <span className={styles.dossierValue}>
                      {viewingMessage.gradeApplying || viewingMessage.grade || "General Inquiry"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Message Body */}
              <div className={styles.dossierSection}>
                <div className={styles.dossierSectionTitle}>
                  <MessageCircle size={15} color="#475569" />
                  <span>Full Message Content</span>
                </div>
                <div style={{ whiteSpace: "pre-wrap", lineHeight: 1.6, color: "#1e293b", fontSize: "0.92rem" }}>
                  {viewingMessage.message || "No message body provided."}
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className={styles.modalFooter}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ fontSize: "0.82rem", fontWeight: 700, color: "#475569" }}>Status:</span>
                <CustomDropdown
                  value={viewingMessage.status || "Pending"}
                  options={contactTableStatusOptions}
                  onChange={(newStatus) =>
                    handleStatusChange(viewingMessage.id || viewingMessage._id, newStatus)
                  }
                  variant="status"
                  style={{ minWidth: "175px" }}
                />
              </div>

              <div className={styles.modalFooterRight}>
                <button
                  type="button"
                  className={styles.addBtn}
                  onClick={() => setViewingMessage(null)}
                >
                  <span>Done</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================
          MODAL 3: REGISTER NEW STUDENT (DESK / WALK-IN)
          ========================================================= */}
      {isRegisterModalOpen && (
        <div
          className={styles.modalBackdrop}
          onClick={() => setIsRegisterModalOpen(false)}
          data-lenis-prevent="true"
        >
          <div
            className={styles.modalCard}
            onClick={(e) => e.stopPropagation()}
            data-lenis-prevent="true"
          >
            <div className={styles.modalHeader}>
              <div className={styles.modalHeaderTitle}>
                <Plus size={20} color="#dc2626" />
                <span>Register Student Admission (Desk / Walk-in)</span>
              </div>
              <button
                type="button"
                className={styles.modalCloseBtn}
                onClick={() => setIsRegisterModalOpen(false)}
              >
                <X size={20} />
              </button>
            </div>

            <form
              onSubmit={handleSaveNewAdmission}
              className={styles.modalForm}
              data-lenis-prevent="true"
            >
              <div className={styles.modalBody} data-lenis-prevent="true">
                {/* Student Particulars */}
                <div className={styles.dossierSection}>
                  <div className={styles.dossierSectionTitle}>
                    <User size={15} color="#475569" />
                    <span>Student Particulars</span>
                  </div>
                  <div className={styles.dossierGrid}>
                    <div className={styles.dossierItem}>
                      <label className={styles.dossierLabel}>Student Full Name *</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Rahul Kumar"
                        value={newAdmissionData.studentName}
                        onChange={(e) => {
                          setNewAdmissionData((p) => ({ ...p, studentName: e.target.value }));
                          if (modalTouched.studentName) {
                            const res = validateName(e.target.value, "Student Full Name");
                            setModalErrors((p) => ({ ...p, studentName: res.error }));
                          }
                        }}
                        onBlur={() => {
                          setModalTouched((p) => ({ ...p, studentName: true }));
                          const res = validateName(newAdmissionData.studentName, "Student Full Name");
                          setModalErrors((p) => ({ ...p, studentName: res.error }));
                        }}
                        className={`${styles.modalInput} ${modalErrors.studentName ? styles.inputError : ""}`}
                      />
                      {modalErrors.studentName && (
                        <div className={styles.errorMessage}>{modalErrors.studentName}</div>
                      )}
                    </div>

                    <div className={styles.dossierItem}>
                      <label className={styles.dossierLabel}>Date of Birth *</label>
                      <input
                        type="date"
                        required
                        value={newAdmissionData.dob}
                        onChange={(e) => {
                          setNewAdmissionData((p) => ({ ...p, dob: e.target.value }));
                          if (modalTouched.dob) {
                            setModalErrors((p) => ({
                              ...p,
                              dob: !e.target.value ? "Please select Date of Birth." : "",
                            }));
                          }
                        }}
                        onBlur={() => {
                          setModalTouched((p) => ({ ...p, dob: true }));
                          setModalErrors((p) => ({
                            ...p,
                            dob: !newAdmissionData.dob ? "Please select Date of Birth." : "",
                          }));
                        }}
                        className={`${styles.modalInput} ${modalErrors.dob ? styles.inputError : ""}`}
                      />
                      {modalErrors.dob && <div className={styles.errorMessage}>{modalErrors.dob}</div>}
                    </div>

                    <div className={styles.dossierItem}>
                      <label className={styles.dossierLabel}>Gender *</label>
                      <CustomDropdown
                        value={newAdmissionData.gender}
                        options={[
                          { label: "Male", value: "Male" },
                          { label: "Female", value: "Female" },
                          { label: "Other", value: "Other" },
                        ]}
                        onChange={(val) => setNewAdmissionData((p) => ({ ...p, gender: val }))}
                      />
                    </div>

                    <div className={styles.dossierItem}>
                      <label className={styles.dossierLabel}>Applying Class *</label>
                      <CustomDropdown
                        value={newAdmissionData.applyingClass}
                        options={ADMISSION_CLASSES.map((cls) => ({ label: cls, value: cls }))}
                        onChange={(val) => setNewAdmissionData((p) => ({ ...p, applyingClass: val }))}
                      />
                    </div>

                    <div className={styles.dossierItem} style={{ gridColumn: "span 2" }}>
                      <label className={styles.dossierLabel}>Previous School Attended</label>
                      <input
                        type="text"
                        placeholder="Previous school name and last passed grade"
                        value={newAdmissionData.previousSchool}
                        onChange={(e) =>
                          setNewAdmissionData((p) => ({ ...p, previousSchool: e.target.value }))
                        }
                        className={styles.modalInput}
                      />
                    </div>
                  </div>
                </div>

                {/* Parent Details */}
                <div className={styles.dossierSection}>
                  <div className={styles.dossierSectionTitle}>
                    <Phone size={15} color="#475569" />
                    <span>Parent & Contact Details</span>
                  </div>
                  <div className={styles.dossierGrid}>
                    <div className={styles.dossierItem}>
                      <label className={styles.dossierLabel}>Father's Name *</label>
                      <input
                        type="text"
                        required
                        placeholder="Father's full name"
                        value={newAdmissionData.fatherName}
                        onChange={(e) => {
                          setNewAdmissionData((p) => ({ ...p, fatherName: e.target.value }));
                          if (modalTouched.fatherName) {
                            const res = validateName(e.target.value, "Father's Name");
                            setModalErrors((p) => ({ ...p, fatherName: res.error }));
                          }
                        }}
                        onBlur={() => {
                          setModalTouched((p) => ({ ...p, fatherName: true }));
                          const res = validateName(newAdmissionData.fatherName, "Father's Name");
                          setModalErrors((p) => ({ ...p, fatherName: res.error }));
                        }}
                        className={`${styles.modalInput} ${modalErrors.fatherName ? styles.inputError : ""}`}
                      />
                      {modalErrors.fatherName && (
                        <div className={styles.errorMessage}>{modalErrors.fatherName}</div>
                      )}
                    </div>

                    <div className={styles.dossierItem}>
                      <label className={styles.dossierLabel}>Mother's Name</label>
                      <input
                        type="text"
                        placeholder="Mother's full name"
                        value={newAdmissionData.motherName}
                        onChange={(e) => {
                          setNewAdmissionData((p) => ({ ...p, motherName: e.target.value }));
                          if (modalTouched.motherName && e.target.value) {
                            const res = validateName(e.target.value, "Mother's Name");
                            setModalErrors((p) => ({ ...p, motherName: res.error }));
                          }
                        }}
                        onBlur={() => {
                          if (!newAdmissionData.motherName) return;
                          setModalTouched((p) => ({ ...p, motherName: true }));
                          const res = validateName(newAdmissionData.motherName, "Mother's Name");
                          setModalErrors((p) => ({ ...p, motherName: res.error }));
                        }}
                        className={`${styles.modalInput} ${modalErrors.motherName ? styles.inputError : ""}`}
                      />
                      {modalErrors.motherName && (
                        <div className={styles.errorMessage}>{modalErrors.motherName}</div>
                      )}
                    </div>

                    <div className={styles.dossierItem}>
                      <label className={styles.dossierLabel}>Mobile Phone / WhatsApp *</label>
                      <div className={styles.phoneInputWrapper}>
                        <span className={styles.phonePrefix}>+91</span>
                        <input
                          type="tel"
                          required
                          inputMode="numeric"
                          autoComplete="tel"
                          maxLength={10}
                          placeholder="9534105012"
                          value={newAdmissionData.phone}
                          onChange={(e) => {
                            const cleaned = sanitizePhoneInput(e.target.value);
                            setNewAdmissionData((p) => ({ ...p, phone: cleaned }));
                            if (modalTouched.phone) {
                              const res = validateIndianPhone(cleaned, true);
                              setModalErrors((p) => ({ ...p, phone: res.error }));
                            }
                          }}
                          onBlur={() => {
                            setModalTouched((p) => ({ ...p, phone: true }));
                            const res = validateIndianPhone(newAdmissionData.phone, true);
                            setModalErrors((p) => ({ ...p, phone: res.error }));
                          }}
                          className={`${styles.modalInput} ${styles.phoneInputWithPrefix} ${
                            modalErrors.phone ? styles.inputError : ""
                          }`}
                        />
                        <span
                          className={`${styles.charCounter} ${
                            newAdmissionData.phone.length === 10 ? styles.charCounterValid : ""
                          }`}
                        >
                          {newAdmissionData.phone.length}/10
                        </span>
                      </div>
                      {modalErrors.phone && (
                        <div className={styles.errorMessage}>{modalErrors.phone}</div>
                      )}
                    </div>

                    <div className={styles.dossierItem}>
                      <label className={styles.dossierLabel}>Email (Optional)</label>
                      <input
                        type="email"
                        placeholder="parent@example.com"
                        value={newAdmissionData.email}
                        onChange={(e) => {
                          setNewAdmissionData((p) => ({ ...p, email: e.target.value }));
                          if (modalTouched.email && e.target.value) {
                            const res = validateEmail(e.target.value, false);
                            setModalErrors((p) => ({ ...p, email: res.error }));
                          }
                        }}
                        onBlur={() => {
                          if (!newAdmissionData.email) return;
                          setModalTouched((p) => ({ ...p, email: true }));
                          const res = validateEmail(newAdmissionData.email, false);
                          setModalErrors((p) => ({ ...p, email: res.error }));
                        }}
                        className={`${styles.modalInput} ${modalErrors.email ? styles.inputError : ""}`}
                      />
                      {modalErrors.email && (
                        <div className={styles.errorMessage}>{modalErrors.email}</div>
                      )}
                    </div>

                    <div className={styles.dossierItem} style={{ gridColumn: "span 2" }}>
                      <label className={styles.dossierLabel}>Residential Address *</label>
                      <input
                        type="text"
                        required
                        placeholder="Village / Ward / Street, Post, Jhajha, Jamui"
                        value={newAdmissionData.address}
                        onChange={(e) => {
                          setNewAdmissionData((p) => ({ ...p, address: e.target.value }));
                          if (modalTouched.address) {
                            const res = validateText(e.target.value, "Residential Address", 5, true);
                            setModalErrors((p) => ({ ...p, address: res.error }));
                          }
                        }}
                        onBlur={() => {
                          setModalTouched((p) => ({ ...p, address: true }));
                          const res = validateText(newAdmissionData.address, "Residential Address", 5, true);
                          setModalErrors((p) => ({ ...p, address: res.error }));
                        }}
                        className={`${styles.modalInput} ${modalErrors.address ? styles.inputError : ""}`}
                      />
                      {modalErrors.address && (
                        <div className={styles.errorMessage}>{modalErrors.address}</div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Facilities */}
                <div className={styles.dossierSection}>
                  <div className={styles.dossierSectionTitle}>
                    <Bus size={15} color="#475569" />
                    <span>Facilities</span>
                  </div>
                  <div className={styles.dossierGrid}>
                    <div className={styles.dossierItem}>
                      <label className={styles.dossierLabel}>School Bus Required?</label>
                      <CustomDropdown
                        value={newAdmissionData.needTransport}
                        options={[
                          { label: "Yes (Jhajha / Jamui Route)", value: "Yes" },
                          { label: "No (Self Conveyance)", value: "No" },
                        ]}
                        onChange={(val) => setNewAdmissionData((p) => ({ ...p, needTransport: val }))}
                      />
                    </div>

                    <div className={styles.dossierItem}>
                      <label className={styles.dossierLabel}>Hostel Required?</label>
                      <CustomDropdown
                        value={newAdmissionData.needHostel}
                        options={[
                          { label: "No (Day Scholar)", value: "No" },
                          { label: "Yes (Hostel Boarding)", value: "Yes" },
                        ]}
                        onChange={(val) => setNewAdmissionData((p) => ({ ...p, needHostel: val }))}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Modal Footer */}
              <div className={styles.modalFooter}>
                <button
                  type="button"
                  className={styles.printBtn}
                  onClick={() => setIsRegisterModalOpen(false)}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={isSavingNew}
                  className={styles.addBtn}
                >
                  {isSavingNew ? "Saving Application..." : "Save & Register Student"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
