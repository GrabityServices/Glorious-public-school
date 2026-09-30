import { useState, useRef } from "react";
import {
  Plus,
  Search,
  Edit2,
  Trash2,
  CheckCircle,
  X,
  Calendar,
  MapPin,
  Clock,
  Upload,
  Image as ImageIcon,
  Check,
  AlertCircle,
  Loader2,
} from "lucide-react";
import styles from "./AdminEvents.module.css";
import { useData } from "@/context/DataContext";
import { useConfirm } from "@/context/ConfirmContext";
import useDocumentTitle from "@/hooks/useDocumentTitle";
import EmptyState from "@/components/common/EmptyState";

// Curated school event images stored in public/images
export const EVENT_IMAGE_PRESETS = [
  {
    id: "cultural-fest",
    name: "Dance & Cultural Fest",
    path: "/images/dance-&-cultural-fest.webp",
    category: "Cultural",
  },
  {
    id: "sports-meet",
    name: "Annual Sports & Athletics",
    path: "/images/annual-sports-meet.jpg",
    category: "Sports",
  },
  {
    id: "science-lab",
    name: "Science & Tech Exhibition",
    path: "/images/science-exhibition.jpg",
    category: "Academic",
  },
  {
    id: "art-contest",
    name: "Art & Painting Competition",
    path: "/images/art-competition.jpg",
    category: "Competition",
  },
  {
    id: "annual-day",
    name: "Annual Day Function Stage",
    path: "/images/annual-day-function.jpg",
    category: "Cultural",
  },
  {
    id: "national-day",
    name: "Independence Day / National",
    path: "/images/independence-day.jpg",
    category: "Cultural",
  },
  {
    id: "honors",
    name: "Honor Ceremony & Awards",
    path: "/images/honoring-ceremony.jpg",
    category: "Academic",
  },
  {
    id: "yoga-fitness",
    name: "Yoga & Physical Training",
    path: "/images/yoga-and-fitness.jpg",
    category: "Sports",
  },
];

export default function AdminEvents() {
  useDocumentTitle("Manage School Events | Glorious Admin");
  const { events, addEvent, updateEvent, deleteEvent, uploadEventImage } = useData();
  const confirm = useConfirm();

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [toast, setToast] = useState("");

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const fileInputRef = useRef(null);

  const [formData, setFormData] = useState({
    title: "",
    category: "Cultural",
    date: "",
    year: "Annual Event",
    time: "09:00 AM - 02:00 PM",
    venue: "School Main Courtyard & Assembly Ground",
    image: "/images/dance-&-cultural-fest.webp",
    shortDesc: "",
    fullDesc: "",
  });

  const categories = ["All", "Cultural", "Competition", "Sports", "Academic"];

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(""), 3500);
  };

  const filteredEvents = events.filter((event) => {
    const matchesCategory =
      selectedCategory === "All" || event.category === selectedCategory;
    const query = searchQuery.toLowerCase();
    const matchesSearch =
      (event.title && event.title.toLowerCase().includes(query)) ||
      (event.shortDesc && event.shortDesc.toLowerCase().includes(query)) ||
      (event.venue && event.venue.toLowerCase().includes(query));
    return matchesCategory && matchesSearch;
  });

  const handleOpenAdd = () => {
    setEditingId(null);
    setUploadError("");
    setFormData({
      title: "",
      category: "Cultural",
      date: "15 Oct",
      year: "Annual Event",
      time: "09:00 AM - 02:00 PM",
      venue: "School Campus Grounds, Jhajha",
      image: "/images/dance-&-cultural-fest.webp",
      shortDesc: "",
      fullDesc: "",
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (event) => {
    setEditingId(event.id || event._id);
    setUploadError("");
    setFormData({
      title: event.title || "",
      category: event.category || "Cultural",
      date: event.date || "",
      year: event.year || "Annual Event",
      time: event.time || "",
      venue: event.venue || "",
      image: event.image || "/images/dance-&-cultural-fest.webp",
      shortDesc: event.shortDesc || "",
      fullDesc: event.fullDesc || "",
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id, title) => {
    const confirmed = await confirm({
      title: "Delete Event?",
      message:
        "Are you sure you want to permanently delete this event from the school calendar? Any attached photo will also be removed. This action cannot be undone.",
      itemName: title,
      confirmText: "Yes, Delete",
      cancelText: "Cancel",
      variant: "danger",
    });
    if (confirmed) {
      await deleteEvent(id);
      showToast("Event permanently deleted.");
    }
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title.trim()) return;

    if (editingId) {
      await updateEvent(editingId, formData);
      showToast("Event updated successfully.");
    } else {
      await addEvent(formData);
      showToast("New event added to calendar.");
    }
    setIsModalOpen(false);
  };

  // Handle custom photo upload from local computer
  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      setUploadError("Image size must be under 10MB.");
      return;
    }

    setIsUploading(true);
    setUploadError("");
    try {
      const res = await uploadEventImage(file);
      if (res && res.fileUrl) {
        setFormData((prev) => ({ ...prev, image: res.fileUrl }));
        showToast("Custom event photo uploaded successfully.");
      }
    } catch (err) {
      setUploadError(err.message || "Failed to upload image. Please try again.");
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  // Auto-suggest preset when category changes (if currently using a preset)
  const handleCategoryChange = (newCat) => {
    const matchingPreset = EVENT_IMAGE_PRESETS.find((p) => p.category === newCat);
    setFormData((prev) => ({
      ...prev,
      category: newCat,
      image:
        matchingPreset && !prev.image.startsWith("/uploads/")
          ? matchingPreset.path
          : prev.image,
    }));
  };

  return (
    <div className={styles.pageWrapper}>
      {/* Toast */}
      {toast && (
        <div className={styles.toastAlert}>
          <CheckCircle size={18} />
          <span>{toast}</span>
        </div>
      )}

      {/* Action Header */}
      <div className={styles.actionHeader}>
        <div className={styles.controlsRow}>
          <div className={styles.searchWrap}>
            <Search size={16} className={styles.searchIcon} />
            <input
              type="text"
              placeholder="Search events or venues..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={styles.searchInput}
            />
          </div>

          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className={styles.categorySelect}
          >
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat === "All" ? "All Categories" : cat}
              </option>
            ))}
          </select>
        </div>

        <button type="button" onClick={handleOpenAdd} className={styles.addBtn}>
          <Plus size={18} />
          <span>Add School Event</span>
        </button>
      </div>

      {/* Events Grid */}
      <div className={styles.eventsGrid}>
        {filteredEvents.length > 0 ? (
          filteredEvents.map((event) => {
            const eventId = event.id || event._id;
            return (
              <div key={eventId} className={styles.eventCard}>
                <div className={styles.imageWrap}>
                  <img
                    src={event.image || "/images/annual-sports-meet.jpg"}
                    alt={event.title}
                    className={styles.eventImg}
                    onError={(e) => {
                      e.target.src = "/images/dance-&-cultural-fest.webp";
                    }}
                  />
                  <span
                    className={`${styles.categoryPill} ${
                      styles[`cat_${(event.category || "Cultural").toLowerCase()}`] || ""
                    }`}
                  >
                    {event.category}
                  </span>
                </div>

                <div className={styles.cardBody}>
                  <h3 className={styles.cardTitle}>{event.title}</h3>

                  <div className={styles.metaList}>
                    <div className={styles.metaItem}>
                      <Calendar size={14} color="#dc2626" />
                      <span>
                        {event.date} {event.year ? `(${event.year})` : ""}
                      </span>
                    </div>
                    {event.time && (
                      <div className={styles.metaItem}>
                        <Clock size={14} color="#94a3b8" />
                        <span>{event.time}</span>
                      </div>
                    )}
                    {event.venue && (
                      <div className={styles.metaItem}>
                        <MapPin size={14} color="#94a3b8" />
                        <span>{event.venue}</span>
                      </div>
                    )}
                  </div>

                  <p className={styles.cardDesc}>{event.shortDesc}</p>

                  <div className={styles.cardFooter}>
                    <button
                      type="button"
                      onClick={() => handleOpenEdit(event)}
                      className={styles.actionBtn}
                    >
                      <Edit2 size={14} />
                      <span>Edit</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(eventId, event.title)}
                      className={`${styles.actionBtn} ${styles.deleteBtn}`}
                    >
                      <Trash2 size={14} />
                      <span>Delete</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div style={{ gridColumn: "1 / -1" }}>
            <EmptyState
              icon={Calendar}
              title="No School Events Found"
              description={
                searchQuery || selectedCategory !== "All"
                  ? "No events match your current filter criteria. You can clear the search or publish a new event."
                  : "No events are currently scheduled in the admin database. Click below to add an event."
              }
              actionText="Add School Event"
              onAction={handleOpenAdd}
            />
          </div>
        )}
      </div>

      {/* Add / Edit Modal */}
      {isModalOpen && (
        <div
          className={styles.modalBackdrop}
          data-lenis-prevent="true"
          onClick={(e) => {
            if (e.target === e.currentTarget) setIsModalOpen(false);
          }}
        >
          <div className={styles.modalContent} data-lenis-prevent="true">
            <div className={styles.modalHeader}>
              <div>
                <h3>{editingId ? "Edit School Event" : "Create New Event"}</h3>
                <p className={styles.modalSubtitle}>
                  Publish announcements, celebrations, sports meets, and academic stages.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className={styles.closeModalBtn}
                title="Close"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleFormSubmit} className={styles.modalForm}>
              {/* Event Title */}
              <label>
                <div className={styles.labelHeader}>
                  <span>Event Title *</span>
                  <span className={styles.charCount}>
                    {formData.title.length}/90 chars
                  </span>
                </div>
                <input
                  type="text"
                  required
                  maxLength={90}
                  placeholder="e.g. Annual Sports Meet 2026 or Inter-School Dance Fest"
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                />
              </label>

              {/* Category & Date */}
              <div className={styles.formGrid}>
                <label>
                  <span>Event Category</span>
                  <select
                    value={formData.category}
                    onChange={(e) => handleCategoryChange(e.target.value)}
                  >
                    <option value="Cultural">Cultural</option>
                    <option value="Competition">Competition</option>
                    <option value="Sports">Sports</option>
                    <option value="Academic">Academic</option>
                  </select>
                </label>

                <label>
                  <div className={styles.labelHeader}>
                    <span>Date / Schedule *</span>
                    <span className={styles.charCount}>
                      {formData.date.length}/30 chars
                    </span>
                  </div>
                  <input
                    type="text"
                    required
                    maxLength={30}
                    placeholder="e.g. 20 December or 01 Oct - 02 Oct"
                    value={formData.date}
                    onChange={(e) =>
                      setFormData({ ...formData, date: e.target.value })
                    }
                  />
                </label>
              </div>

              {/* Timing & Badge */}
              <div className={styles.formGrid}>
                <label>
                  <div className={styles.labelHeader}>
                    <span>Timing (Optional)</span>
                    <span className={styles.charCount}>
                      {formData.time.length}/30 chars
                    </span>
                  </div>
                  <input
                    type="text"
                    maxLength={30}
                    placeholder="e.g. 08:30 AM - 02:00 PM"
                    value={formData.time}
                    onChange={(e) =>
                      setFormData({ ...formData, time: e.target.value })
                    }
                  />
                </label>

                <label>
                  <div className={styles.labelHeader}>
                    <span>Year / Stage Badge</span>
                    <span className={styles.charCount}>
                      {formData.year.length}/25 chars
                    </span>
                  </div>
                  <input
                    type="text"
                    maxLength={25}
                    placeholder="e.g. Annual Event, State Level"
                    value={formData.year}
                    onChange={(e) =>
                      setFormData({ ...formData, year: e.target.value })
                    }
                  />
                </label>
              </div>

              {/* Venue Location */}
              <label>
                <div className={styles.labelHeader}>
                  <span>Venue Location</span>
                  <span className={styles.charCount}>
                    {formData.venue.length}/80 chars
                  </span>
                </div>
                <input
                  type="text"
                  maxLength={80}
                  placeholder="e.g. School Courtyard & Grounds, Jhajha or Town Hall"
                  value={formData.venue}
                  onChange={(e) =>
                    setFormData({ ...formData, venue: e.target.value })
                  }
                />
              </label>

              {/* Enhanced Visual Image Picker */}
              <div className={styles.imageSection}>
                <div className={styles.labelHeader}>
                  <span className={styles.sectionHeading}>
                    <ImageIcon size={15} /> Event Banner Photo *
                  </span>
                  <span className={styles.imageSourceTag}>
                    {formData.image.startsWith("/uploads/")
                      ? "Custom Uploaded Photo"
                      : "Preset School Gallery Photo"}
                  </span>
                </div>

                {/* Selected Image Preview Card */}
                <div className={styles.currentImageCard}>
                  <div className={styles.previewThumbWrap}>
                    <img
                      src={formData.image || "/images/annual-sports-meet.jpg"}
                      alt="Selected event banner preview"
                      className={styles.previewThumb}
                      onError={(e) => {
                        e.target.src = "/images/dance-&-cultural-fest.webp";
                      }}
                    />
                  </div>
                  <div className={styles.previewInfo}>
                    <div className={styles.previewTitle}>
                      {EVENT_IMAGE_PRESETS.find((p) => p.path === formData.image)?.name ||
                        (formData.image.startsWith("/uploads/")
                          ? "Custom Uploaded Photo"
                          : formData.image.split("/").pop())}
                    </div>
                    <span className={styles.previewPath}>{formData.image}</span>

                    <div className={styles.uploadRow}>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/jpeg,image/png,image/webp,image/jfif,image/bmp"
                        style={{ display: "none" }}
                        onChange={handleFileUpload}
                      />
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={isUploading}
                        className={styles.uploadLocalBtn}
                      >
                        {isUploading ? (
                          <>
                            <Loader2 size={14} className={styles.spinIcon} />
                            <span>Uploading...</span>
                          </>
                        ) : (
                          <>
                            <Upload size={14} />
                            <span>Upload from Computer</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>

                {uploadError && (
                  <div className={styles.errorAlert}>
                    <AlertCircle size={15} />
                    <span>{uploadError}</span>
                  </div>
                )}

                {/* Preset Gallery Grid */}
                <div className={styles.presetHeading}>
                  <span>Or Select from Curated Event Photos:</span>
                </div>

                <div className={styles.presetGrid}>
                  {EVENT_IMAGE_PRESETS.map((preset) => {
                    const isSelected = formData.image === preset.path;
                    return (
                      <button
                        key={preset.id}
                        type="button"
                        onClick={() => {
                          setFormData((prev) => ({ ...prev, image: preset.path }));
                          setUploadError("");
                        }}
                        className={`${styles.presetCard} ${
                          isSelected ? styles.presetCardActive : ""
                        }`}
                      >
                        <div className={styles.presetThumbWrap}>
                          <img
                            src={preset.path}
                            alt={preset.name}
                            className={styles.presetImg}
                            onError={(e) => {
                              e.target.src = "/images/dance-&-cultural-fest.webp";
                            }}
                          />
                          {isSelected && (
                            <span className={styles.selectedBadge}>
                              <Check size={12} strokeWidth={3} />
                            </span>
                          )}
                        </div>
                        <span className={styles.presetTitle}>{preset.name}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Short Summary */}
              <label>
                <div className={styles.labelHeader}>
                  <span>Short Summary (Card Preview) *</span>
                  <span className={styles.charCount}>
                    {formData.shortDesc.length}/160 chars
                  </span>
                </div>
                <textarea
                  required
                  rows={2}
                  maxLength={160}
                  placeholder="One or two sentences highlighting the event for visitors and students..."
                  value={formData.shortDesc}
                  onChange={(e) =>
                    setFormData({ ...formData, shortDesc: e.target.value })
                  }
                />
              </label>

              {/* Full Event Details */}
              <label>
                <div className={styles.labelHeader}>
                  <span>Full Event Details</span>
                  <span className={styles.charCount}>
                    {formData.fullDesc.length}/1200 chars
                  </span>
                </div>
                <textarea
                  rows={4}
                  maxLength={1200}
                  placeholder="Comprehensive event details: schedule, rules, eligibility, chief guests, ceremony..."
                  value={formData.fullDesc}
                  onChange={(e) =>
                    setFormData({ ...formData, fullDesc: e.target.value })
                  }
                />
              </label>

              {/* Form Action Buttons */}
              <div className={styles.modalActions}>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className={styles.cancelBtn}
                >
                  Cancel
                </button>
                <button type="submit" className={styles.saveBtn}>
                  {editingId ? "Save Changes" : "Publish Event"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
