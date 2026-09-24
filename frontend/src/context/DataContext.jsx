import { createContext, useContext, useState, useEffect, useCallback } from "react";

const DataContext = createContext();

// Clean up any legacy localStorage items from earlier sessions
const CLEANUP_STORAGE_KEYS = [
  "gps_data_notices",
  "gps_data_events",
  "gps_data_staff",
  "gps_data_school_info",
  "gps_data_inquiries",
  "gps_data_gallery",
];

export function DataProvider({ children }) {
  const [notices, setNotices] = useState([]);
  const [events, setEvents] = useState([]);
  const [staff, setStaff] = useState([]);
  const [gallery, setGallery] = useState([]);
  const [inquiries, setInquiries] = useState([]);
  const [schoolInfo, setSchoolInfo] = useState({
    name: "Glorious Public School",
    tagline: "Dedicated to create erudite, upright leaders of tomorrow's world",
    affiliation: "Recognized Co-Educational English Medium School (Nursery to Class 10th)",
    code: "GPS-JHAJHA-811308",
    established: "2015",
    phone: "9534105012",
    phoneAlt: "+91 95341 05012",
    email: "gpsjhajha@gmail.com",
    address: "Koltex, Petrol Pump, Jhajha, Jamui, Bihar 811308",
    city: "Jhajha",
    district: "Jamui",
    state: "Bihar",
    pincode: "811308",
    landmark: "Near Koltex, Petrol Pump",
    admissionNotice: "ADMISSION OPEN FOR NURSERY TO CLASS 10TH (ACADEMIC SESSION 2026-2027) — APPLY TODAY!",
    stats: [
      { label: "Dedicated Teachers", value: "25+", suffix: "" },
      { label: "Enrolled Students", value: "800+", suffix: "" },
      { label: "Support Staff", value: "12+", suffix: "" },
      { label: "Board Pass Rate", value: "100%", suffix: "" },
      { label: "Academic Wings", value: "4", suffix: "" },
      { label: "School Buses/Vans", value: "8+", suffix: "" },
    ],
    openingHours: [
      { day: "Monday", time: "8:00 AM - 2:30 PM", status: "Open" },
      { day: "Tuesday", time: "8:00 AM - 2:30 PM", status: "Open" },
      { day: "Wednesday", time: "8:00 AM - 2:30 PM", status: "Open" },
      { day: "Thursday", time: "8:00 AM - 2:30 PM", status: "Open" },
      { day: "Friday", time: "8:00 AM - 2:30 PM", status: "Open" },
      { day: "Saturday", time: "8:00 AM - 1:00 PM", status: "Half Day" },
      { day: "Sunday", time: "Closed", status: "Holiday" },
    ],
  });
  const [loading, setLoading] = useState(true);

  // Clear legacy localStorage cache
  useEffect(() => {
    CLEANUP_STORAGE_KEYS.forEach((key) => {
      try {
        localStorage.removeItem(key);
      } catch (e) {
        // ignore
      }
    });
  }, []);

  // Fetch all live data directly from MongoDB Atlas API
  const refreshData = useCallback(async () => {
    try {
      const [noticesRes, eventsRes, staffRes, galleryRes, inqRes, infoRes] = await Promise.allSettled([
        fetch("/api/notices"),
        fetch("/api/events"),
        fetch("/api/staff"),
        fetch("/api/gallery"),
        fetch("/api/inquiries"),
        fetch("/api/school-info"),
      ]);

      if (noticesRes.status === "fulfilled" && noticesRes.value.ok) {
        const data = await noticesRes.value.json();
        setNotices(data);
      }
      if (eventsRes.status === "fulfilled" && eventsRes.value.ok) {
        const data = await eventsRes.value.json();
        setEvents(data);
      }
      if (staffRes.status === "fulfilled" && staffRes.value.ok) {
        const data = await staffRes.value.json();
        setStaff(data);
      }
      if (galleryRes.status === "fulfilled" && galleryRes.value.ok) {
        const data = await galleryRes.value.json();
        setGallery(data);
      }
      if (inqRes.status === "fulfilled" && inqRes.value.ok) {
        const data = await inqRes.value.json();
        setInquiries(data);
      }
      if (infoRes.status === "fulfilled" && infoRes.value.ok) {
        const data = await infoRes.value.json();
        if (data && data.name) setSchoolInfo(data);
      }
    } catch (err) {
      console.error("Error fetching data from MongoDB:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshData();
  }, [refreshData]);

  // --- CRUD: Notices (MongoDB Atlas) ---
  const addNotice = async (newNotice) => {
    try {
      const res = await fetch("/api/notices", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newNotice),
      });
      if (res.ok) {
        const saved = await res.json();
        setNotices((prev) => [saved, ...prev]);
        return saved;
      }
    } catch (err) {
      console.error("Failed to add notice to MongoDB:", err);
    }
  };

  const updateNotice = async (id, updatedFields) => {
    try {
      const res = await fetch(`/api/notices/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedFields),
      });
      if (res.ok) {
        const saved = await res.json();
        setNotices((prev) =>
          prev.map((item) => (item.id === id || item._id === id ? saved : item))
        );
        return saved;
      }
    } catch (err) {
      console.error("Failed to update notice in MongoDB:", err);
    }
  };

  const deleteNotice = async (id) => {
    try {
      const res = await fetch(`/api/notices/${id}`, { method: "DELETE" });
      if (res.ok) {
        setNotices((prev) => prev.filter((item) => item.id !== id && item._id !== id));
      }
    } catch (err) {
      console.error("Failed to delete notice from MongoDB:", err);
    }
  };

  const toggleNoticeImportant = async (id) => {
    const target = notices.find((item) => item.id === id || item._id === id);
    if (!target) return;
    await updateNotice(id, { isImportant: !target.isImportant });
  };

  // --- CRUD: Events (MongoDB Atlas) ---
  const addEvent = async (newEvent) => {
    try {
      const res = await fetch("/api/events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newEvent),
      });
      if (res.ok) {
        const saved = await res.json();
        setEvents((prev) => [saved, ...prev]);
        return saved;
      }
    } catch (err) {
      console.error("Failed to add event to MongoDB:", err);
    }
  };

  const updateEvent = async (id, updatedFields) => {
    try {
      const res = await fetch(`/api/events/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedFields),
      });
      if (res.ok) {
        const saved = await res.json();
        setEvents((prev) =>
          prev.map((item) => (item.id === id || item._id === id ? saved : item))
        );
        return saved;
      }
    } catch (err) {
      console.error("Failed to update event in MongoDB:", err);
    }
  };

  const deleteEvent = async (id) => {
    try {
      const res = await fetch(`/api/events/${id}`, { method: "DELETE" });
      if (res.ok) {
        setEvents((prev) => prev.filter((item) => item.id !== id && item._id !== id));
      }
    } catch (err) {
      console.error("Failed to delete event from MongoDB:", err);
    }
  };

  // --- CRUD: Staff (MongoDB Atlas) ---
  const addStaff = async (newStaff) => {
    try {
      const res = await fetch("/api/staff", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newStaff),
      });
      if (res.ok) {
        const saved = await res.json();
        setStaff((prev) => [...prev, saved]);
        return saved;
      }
    } catch (err) {
      console.error("Failed to add staff to MongoDB:", err);
    }
  };

  const updateStaff = async (id, updatedFields) => {
    try {
      const res = await fetch(`/api/staff/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedFields),
      });
      if (res.ok) {
        const saved = await res.json();
        setStaff((prev) =>
          prev.map((item) => (item.id === id || item._id === id ? saved : item))
        );
        return saved;
      }
    } catch (err) {
      console.error("Failed to update staff in MongoDB:", err);
    }
  };

  const deleteStaff = async (id) => {
    try {
      const res = await fetch(`/api/staff/${id}`, { method: "DELETE" });
      if (res.ok) {
        setStaff((prev) => prev.filter((item) => item.id !== id && item._id !== id));
      }
    } catch (err) {
      console.error("Failed to delete staff from MongoDB:", err);
    }
  };

  // --- CRUD: Gallery (MongoDB Atlas) ---
  const addGalleryItem = async (newItem) => {
    try {
      const res = await fetch("/api/gallery", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newItem),
      });
      if (res.ok) {
        const saved = await res.json();
        setGallery((prev) => [saved, ...prev]);
        return saved;
      }
    } catch (err) {
      console.error("Failed to add gallery item to MongoDB:", err);
    }
  };

  const updateGalleryItem = async (id, updatedFields) => {
    try {
      const res = await fetch(`/api/gallery/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedFields),
      });
      if (res.ok) {
        const saved = await res.json();
        setGallery((prev) =>
          prev.map((item) => (item.id === id || item._id === id ? saved : item))
        );
        return saved;
      }
    } catch (err) {
      console.error("Failed to update gallery item in MongoDB:", err);
    }
  };

  const deleteGalleryItem = async (id) => {
    try {
      const res = await fetch(`/api/gallery/${id}`, { method: "DELETE" });
      if (res.ok) {
        setGallery((prev) => prev.filter((item) => item.id !== id && item._id !== id));
      }
    } catch (err) {
      console.error("Failed to delete gallery item from MongoDB:", err);
    }
  };

  // --- CRUD: Inquiries / Admissions (MongoDB Atlas) ---
  const addInquiry = async (inquiry) => {
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(inquiry),
      });
      if (res.ok) {
        const json = await res.json();
        const saved = json.data || json;
        setInquiries((prev) => [saved, ...prev]);
        return saved;
      }
    } catch (err) {
      console.error("Failed to add inquiry to MongoDB:", err);
    }
  };

  const updateInquiryStatus = async (id, status) => {
    try {
      const res = await fetch(`/api/inquiries/${id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (res.ok) {
        const saved = await res.json();
        setInquiries((prev) =>
          prev.map((inq) => (inq.id === id || inq._id === id ? saved : inq))
        );
        return saved;
      }
    } catch (err) {
      console.error("Failed to update inquiry status in MongoDB:", err);
    }
  };

  const deleteInquiry = async (id) => {
    try {
      const res = await fetch(`/api/inquiries/${id}`, { method: "DELETE" });
      if (res.ok) {
        setInquiries((prev) => prev.filter((inq) => inq.id !== id && inq._id !== id));
      }
    } catch (err) {
      console.error("Failed to delete inquiry from MongoDB:", err);
    }
  };

  // --- CRUD: School Info & Stats (MongoDB Atlas) ---
  const updateSchoolInfo = async (updatedFields) => {
    try {
      const nextInfo = { ...schoolInfo, ...updatedFields };
      const res = await fetch("/api/school-info", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(nextInfo),
      });
      if (res.ok) {
        const saved = await res.json();
        setSchoolInfo(saved);
        return saved;
      }
    } catch (err) {
      console.error("Failed to update school info in MongoDB:", err);
    }
  };

  const updateStat = async (index, updatedStat) => {
    const newStats = [...schoolInfo.stats];
    newStats[index] = { ...newStats[index], ...updatedStat };
    await updateSchoolInfo({ stats: newStats });
  };

  const resetToDefaults = async () => {
    await refreshData();
  };

  return (
    <DataContext.Provider
      value={{
        loading,
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

        refreshData,
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
