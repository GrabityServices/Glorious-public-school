import { createContext, useContext, useState, useEffect } from "react";
import { NEWS_NOTICES } from "@/data/newsData";
import { EVENTS_DATA } from "@/data/eventsData";
import { STAFF_MEMBERS } from "@/data/staffData";
import { SCHOOL_INFO } from "@/data/schoolData";
import { GALLERY_ITEMS } from "@/data/galleryData";

const DataContext = createContext();

const STORAGE_KEYS = {
  NOTICES: "gps_data_notices",
  EVENTS: "gps_data_events",
  STAFF: "gps_data_staff",
  SCHOOL_INFO: "gps_data_school_info",
  INQUIRIES: "gps_data_inquiries",
  GALLERY: "gps_data_gallery",
};

// Initial mock inquiries for testing the admin panel
const INITIAL_INQUIRIES = [
  {
    id: "inq-101",
    studentName: "Aarav Kumar",
    parentName: "Sanjay Kumar",
    email: "sanjay.k@gmail.com",
    phone: "9876543210",
    gradeApplying: "Class 6th",
    date: "19 Sep, 2026",
    status: "Pending", // Pending, Reviewed, Admitted, Rejected
    message: "Inquiring about hostel accommodation and evening faculty tuition availability for Class 6th.",
  },
  {
    id: "inq-102",
    studentName: "Priya Kumari",
    parentName: "Vikram Sharma",
    email: "vikram.sharma@yahoo.com",
    phone: "9123456780",
    gradeApplying: "Nursery",
    date: "18 Sep, 2026",
    status: "Reviewed",
    message: "Seeking admission in Nursery with school bus service from Gidhaur route.",
  },
  {
    id: "inq-103",
    studentName: "Rohan Verma",
    parentName: "Deepak Verma",
    email: "deepak.verma@gmail.com",
    phone: "9432156789",
    gradeApplying: "Class 9th",
    date: "15 Sep, 2026",
    status: "Admitted",
    message: "Transferred from Patna. Interested in strong science lab foundation and board preparation.",
  },
];

export function DataProvider({ children }) {
  // Notices state
  const [notices, setNotices] = useState(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.NOTICES);
      return stored ? JSON.parse(stored) : NEWS_NOTICES;
    } catch {
      return NEWS_NOTICES;
    }
  });

  // Events state
  const [events, setEvents] = useState(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.EVENTS);
      return stored ? JSON.parse(stored) : EVENTS_DATA;
    } catch {
      return EVENTS_DATA;
    }
  });

  // Staff state
  const [staff, setStaff] = useState(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.STAFF);
      return stored ? JSON.parse(stored) : STAFF_MEMBERS;
    } catch {
      return STAFF_MEMBERS;
    }
  });

  // School info & stats state
  const [schoolInfo, setSchoolInfo] = useState(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.SCHOOL_INFO);
      return stored ? JSON.parse(stored) : SCHOOL_INFO;
    } catch {
      return SCHOOL_INFO;
    }
  });

  // Inquiries state
  const [inquiries, setInquiries] = useState(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.INQUIRIES);
      return stored ? JSON.parse(stored) : INITIAL_INQUIRIES;
    } catch {
      return INITIAL_INQUIRIES;
    }
  });

  // Gallery state
  const [gallery, setGallery] = useState(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.GALLERY);
      return stored ? JSON.parse(stored) : GALLERY_ITEMS;
    } catch {
      return GALLERY_ITEMS;
    }
  });

  // Sync to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.NOTICES, JSON.stringify(notices));
    } catch (e) {
      console.error("Failed to save notices:", e);
    }
  }, [notices]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.EVENTS, JSON.stringify(events));
    } catch (e) {
      console.error("Failed to save events:", e);
    }
  }, [events]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.STAFF, JSON.stringify(staff));
    } catch (e) {
      console.error("Failed to save staff:", e);
    }
  }, [staff]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.SCHOOL_INFO, JSON.stringify(schoolInfo));
    } catch (e) {
      console.error("Failed to save schoolInfo:", e);
    }
  }, [schoolInfo]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.INQUIRIES, JSON.stringify(inquiries));
    } catch (e) {
      console.error("Failed to save inquiries:", e);
    }
  }, [inquiries]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.GALLERY, JSON.stringify(gallery));
    } catch (e) {
      console.error("Failed to save gallery:", e);
    }
  }, [gallery]);

  // --- CRUD: Notices ---
  const addNotice = (newNotice) => {
    const noticeWithId = {
      ...newNotice,
      id: newNotice.id || `notice-${Date.now()}`,
      date: newNotice.date || new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }),
    };
    setNotices((prev) => [noticeWithId, ...prev]);
    return noticeWithId;
  };

  const updateNotice = (id, updatedFields) => {
    setNotices((prev) =>
      prev.map((item) => (item.id === id ? { ...item, ...updatedFields } : item))
    );
  };

  const deleteNotice = (id) => {
    setNotices((prev) => prev.filter((item) => item.id !== id));
  };

  const toggleNoticeImportant = (id) => {
    setNotices((prev) =>
      prev.map((item) => (item.id === id ? { ...item, isImportant: !item.isImportant } : item))
    );
  };

  // --- CRUD: Events ---
  const addEvent = (newEvent) => {
    const eventWithId = {
      ...newEvent,
      id: newEvent.id || `event-${Date.now()}`,
      year: newEvent.year || "Annual Event",
      image: newEvent.image || "/images/blog1.png",
      highlights: newEvent.highlights || [],
    };
    setEvents((prev) => [eventWithId, ...prev]);
    return eventWithId;
  };

  const updateEvent = (id, updatedFields) => {
    setEvents((prev) =>
      prev.map((item) => (item.id === id ? { ...item, ...updatedFields } : item))
    );
  };

  const deleteEvent = (id) => {
    setEvents((prev) => prev.filter((item) => item.id !== id));
  };

  // --- CRUD: Staff ---
  const addStaff = (newStaff) => {
    const staffWithId = {
      ...newStaff,
      id: newStaff.id || Date.now(),
      image: newStaff.image || "/images/guide1.png",
    };
    setStaff((prev) => [...prev, staffWithId]);
    return staffWithId;
  };

  const updateStaff = (id, updatedFields) => {
    setStaff((prev) =>
      prev.map((item) => (item.id === id ? { ...item, ...updatedFields } : item))
    );
  };

  const deleteStaff = (id) => {
    setStaff((prev) => prev.filter((item) => item.id !== id));
  };

  // --- CRUD: School Info & Stats ---
  const updateSchoolInfo = (updatedFields) => {
    setSchoolInfo((prev) => ({ ...prev, ...updatedFields }));
  };

  const updateStat = (index, updatedStat) => {
    setSchoolInfo((prev) => {
      const newStats = [...prev.stats];
      newStats[index] = { ...newStats[index], ...updatedStat };
      return { ...prev, stats: newStats };
    });
  };

  // --- CRUD: Inquiries / Admissions ---
  const addInquiry = (inquiry) => {
    const newInquiry = {
      ...inquiry,
      id: `inq-${Date.now()}`,
      date: new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }),
      status: "Pending",
    };
    setInquiries((prev) => [newInquiry, ...prev]);
    return newInquiry;
  };

  const updateInquiryStatus = (id, status) => {
    setInquiries((prev) =>
      prev.map((inq) => (inq.id === id ? { ...inq, status } : inq))
    );
  };

  const deleteInquiry = (id) => {
    setInquiries((prev) => prev.filter((inq) => inq.id !== id));
  };

  // --- CRUD: Gallery ---
  const addGalleryItem = (newItem) => {
    const itemWithId = {
      ...newItem,
      id: newItem.id || Date.now(),
      image: newItem.image || "/images/blog1.png",
      category: newItem.category || "Campus",
    };
    setGallery((prev) => [itemWithId, ...prev]);
    return itemWithId;
  };

  const updateGalleryItem = (id, updatedFields) => {
    setGallery((prev) =>
      prev.map((item) => (item.id === id ? { ...item, ...updatedFields } : item))
    );
  };

  const deleteGalleryItem = (id) => {
    setGallery((prev) => prev.filter((item) => item.id !== id));
  };

  // --- Factory Reset ---
  const resetToDefaults = () => {
    setNotices(NEWS_NOTICES);
    setEvents(EVENTS_DATA);
    setStaff(STAFF_MEMBERS);
    setSchoolInfo(SCHOOL_INFO);
    setInquiries(INITIAL_INQUIRIES);
    setGallery(GALLERY_ITEMS);

    try {
      localStorage.removeItem(STORAGE_KEYS.NOTICES);
      localStorage.removeItem(STORAGE_KEYS.EVENTS);
      localStorage.removeItem(STORAGE_KEYS.STAFF);
      localStorage.removeItem(STORAGE_KEYS.SCHOOL_INFO);
      localStorage.removeItem(STORAGE_KEYS.INQUIRIES);
      localStorage.removeItem(STORAGE_KEYS.GALLERY);
    } catch (e) {
      console.error("Failed to reset storage:", e);
    }
  };

  return (
    <DataContext.Provider
      value={{
        notices,
        addNotice,
        updateNotice,
        deleteNotice,
        toggleNoticeImportant,

        events,
        addEvent,
        updateEvent,
        deleteEvent,

        staff,
        addStaff,
        updateStaff,
        deleteStaff,

        schoolInfo,
        updateSchoolInfo,
        updateStat,

        inquiries,
        addInquiry,
        updateInquiryStatus,
        deleteInquiry,

        gallery,
        addGalleryItem,
        updateGalleryItem,
        deleteGalleryItem,

        resetToDefaults,
      }}
    >
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error("useData must be used within a DataProvider");
  }
  return context;
}
