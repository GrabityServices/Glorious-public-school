import { useState } from "react";
import { Plus, Search, Edit2, Trash2, CheckCircle, X, Calendar, MapPin, Clock } from "lucide-react";
import styles from "./AdminEvents.module.css";
import { useData } from "@/context/DataContext";
import useDocumentTitle from "@/hooks/useDocumentTitle";

export default function AdminEvents() {
  useDocumentTitle("Manage School Events | Glorious Admin");
  const { events, addEvent, updateEvent, deleteEvent } = useData();

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [toast, setToast] = useState("");

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    title: "",
    category: "Cultural",
    date: "",
    year: "Annual Event",
    time: "09:00 AM - 02:00 PM",
    venue: "School Main Courtyard & Assembly Ground",
    image: "/images/blog1.png",
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
      event.title.toLowerCase().includes(query) ||
      (event.shortDesc && event.shortDesc.toLowerCase().includes(query)) ||
      (event.venue && event.venue.toLowerCase().includes(query));
    return matchesCategory && matchesSearch;
  });

  const handleOpenAdd = () => {
    setEditingId(null);
    setFormData({
      title: "",
      category: "Cultural",
      date: "15 Oct",
      year: "Annual Event",
      time: "09:00 AM - 02:00 PM",
      venue: "School Campus Grounds, Jhajha",
      image: "/images/blog1.png",
      shortDesc: "",
      fullDesc: "",
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (event) => {
    setEditingId(event.id);
    setFormData({
      title: event.title,
      category: event.category,
      date: event.date,
      year: event.year || "Annual Event",
      time: event.time || "",
      venue: event.venue || "",
      image: event.image || "/images/blog1.png",
      shortDesc: event.shortDesc || "",
      fullDesc: event.fullDesc || "",
    });
    setIsModalOpen(true);
  };

  const handleDelete = (id, title) => {
    if (window.confirm(`Are you sure you want to delete event:\n"${title}"?`)) {
      deleteEvent(id);
      showToast("Event deleted successfully.");
    }
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    if (!formData.title.trim()) return;

    if (editingId) {
      updateEvent(editingId, formData);
      showToast("Event updated successfully.");
    } else {
      addEvent(formData);
      showToast("New event added to calendar.");
    }
    setIsModalOpen(false);
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
          filteredEvents.map((event) => (
            <div key={event.id} className={styles.eventCard}>
              <div className={styles.imageWrap}>
                <img
                  src={event.image || "/images/blog1.png"}
                  alt={event.title}
                  className={styles.eventImg}
                  onError={(e) => {
                    e.target.src = "/images/blog1.png";
                  }}
                />
                <span className={styles.categoryPill}>{event.category}</span>
              </div>

              <div className={styles.cardBody}>
                <h3 className={styles.cardTitle}>{event.title}</h3>

                <div className={styles.metaList}>
                  <div className={styles.metaItem}>
                    <Calendar size={14} color="#dc2626" />
                    <span>{event.date} {event.year ? `(${event.year})` : ""}</span>
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
                    onClick={() => handleDelete(event.id, event.title)}
                    className={`${styles.actionBtn} ${styles.deleteBtn}`}
                  >
                    <Trash2 size={14} />
                    <span>Delete</span>
                  </button>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className={styles.emptyState}>
            No events found matching your search.
          </div>
        )}
      </div>

      {/* Add / Edit Modal */}
      {isModalOpen && (
        <div className={styles.modalBackdrop}>
          <div className={styles.modalContent}>
            <div className={styles.modalHeader}>
              <h3>{editingId ? "Edit School Event" : "Create New Event"}</h3>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className={styles.closeModalBtn}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleFormSubmit} className={styles.modalForm}>
              <label>
                <span>Event Title *</span>
                <input
                  type="text"
                  required
                  placeholder="e.g. Annual Sports Meet 2026"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                />
              </label>

              <div className={styles.formGrid}>
                <label>
                  <span>Category</span>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  >
                    <option value="Cultural">Cultural</option>
                    <option value="Competition">Competition</option>
                    <option value="Sports">Sports</option>
                    <option value="Academic">Academic</option>
                  </select>
                </label>

                <label>
                  <span>Date / Month *</span>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 20 December or 01 Oct - 02 Oct"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  />
                </label>
              </div>

              <div className={styles.formGrid}>
                <label>
                  <span>Timing</span>
                  <input
                    type="text"
                    placeholder="e.g. 08:30 AM - 02:30 PM"
                    value={formData.time}
                    onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                  />
                </label>

                <label>
                  <span>Year / Badge</span>
                  <input
                    type="text"
                    placeholder="e.g. Annual Event, National Festival"
                    value={formData.year}
                    onChange={(e) => setFormData({ ...formData, year: e.target.value })}
                  />
                </label>
              </div>

              <label>
                <span>Venue Location</span>
                <input
                  type="text"
                  placeholder="e.g. School Courtyard or Jhajha Town Hall"
                  value={formData.venue}
                  onChange={(e) => setFormData({ ...formData, venue: e.target.value })}
                />
              </label>

              <label>
                <span>Image Path or URL</span>
                <select
                  value={formData.image}
                  onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                >
                  <option value="/images/blog1.png">Dance & Cultural Fest (/images/blog1.png)</option>
                  <option value="/images/blog2.png">Art & Independence Day (/images/blog2.png)</option>
                  <option value="/images/blog3.png">Athletics & Sports (/images/blog3.png)</option>
                  <option value="/images/about.png">School Campus (/images/about.png)</option>
                </select>
              </label>

              <label>
                <span>Short Summary (Card Preview) *</span>
                <textarea
                  required
                  rows={2}
                  placeholder="Brief description of the event..."
                  value={formData.shortDesc}
                  onChange={(e) => setFormData({ ...formData, shortDesc: e.target.value })}
                />
              </label>

              <label>
                <span>Full Event Details</span>
                <textarea
                  rows={3}
                  placeholder="Detailed schedule, competition rules, awards ceremony details..."
                  value={formData.fullDesc}
                  onChange={(e) => setFormData({ ...formData, fullDesc: e.target.value })}
                />
              </label>

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
