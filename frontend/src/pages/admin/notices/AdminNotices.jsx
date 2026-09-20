import { useState } from "react";
import { Plus, Search, Edit2, Trash2, CheckCircle, X, Bell } from "lucide-react";
import styles from "./AdminNotices.module.css";
import { useData } from "@/context/DataContext";
import useDocumentTitle from "@/hooks/useDocumentTitle";

export default function AdminNotices() {
  useDocumentTitle("Manage Notices & News | Glorious Admin");
  const { notices, addNotice, updateNotice, deleteNotice, toggleNoticeImportant } = useData();

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [toast, setToast] = useState("");

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    title: "",
    category: "Notice",
    author: "Principal Desk",
    isImportant: false,
    summary: "",
    fullContent: "",
  });

  const categories = ["All", "Admission", "Academic", "Notice", "Event"];

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(""), 3500);
  };

  // Filter notices
  const filteredNotices = notices.filter((notice) => {
    const matchesCategory =
      selectedCategory === "All" || notice.category === selectedCategory;
    const query = searchQuery.toLowerCase();
    const matchesSearch =
      notice.title.toLowerCase().includes(query) ||
      (notice.summary && notice.summary.toLowerCase().includes(query));
    return matchesCategory && matchesSearch;
  });

  const handleOpenAdd = () => {
    setEditingId(null);
    setFormData({
      title: "",
      category: "Notice",
      author: "Principal Desk",
      isImportant: false,
      summary: "",
      fullContent: "",
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (notice) => {
    setEditingId(notice.id);
    setFormData({
      title: notice.title,
      category: notice.category,
      author: notice.author || "Principal Desk",
      isImportant: !!notice.isImportant,
      summary: notice.summary || "",
      fullContent: notice.fullContent || "",
    });
    setIsModalOpen(true);
  };

  const handleDelete = (id, title) => {
    if (window.confirm(`Are you sure you want to delete notice:\n"${title}"?`)) {
      deleteNotice(id);
      showToast("Notice removed successfully.");
    }
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    if (!formData.title.trim()) return;

    if (editingId) {
      updateNotice(editingId, formData);
      showToast("Notice updated successfully.");
    } else {
      addNotice(formData);
      showToast("New notice published to website.");
    }
    setIsModalOpen(false);
  };

  return (
    <div className={styles.pageWrapper}>
      {/* Toast Notification */}
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
              placeholder="Search circulars..."
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
          <span>Publish Notice</span>
        </button>
      </div>

      {/* Data Table */}
      <div className={styles.tableCard}>
        <div className={styles.tableWrapper}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Title & Summary</th>
                <th>Category</th>
                <th>Date & Author</th>
                <th>Priority</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredNotices.length > 0 ? (
                filteredNotices.map((notice) => (
                  <tr key={notice.id}>
                    <td className={styles.noticeTitleCol}>
                      <h4>{notice.title}</h4>
                      <p className={styles.noticeSummary}>{notice.summary}</p>
                    </td>
                    <td>
                      <span
                        className={`${styles.badge} ${
                          styles[`badge_${(notice.category || "").toLowerCase()}`] || ""
                        }`}
                      >
                        {notice.category}
                      </span>
                    </td>
                    <td>
                      <div className={styles.noticeDate}>{notice.date}</div>
                      <div className={styles.noticeAuthor}>by {notice.author}</div>
                    </td>
                    <td>
                      <button
                        type="button"
                        onClick={() => toggleNoticeImportant(notice.id)}
                        className={`${styles.importantToggle} ${
                          notice.isImportant ? styles.importantActive : ""
                        }`}
                        title="Click to toggle priority"
                      >
                        {notice.isImportant ? "★ Important" : "Normal"}
                      </button>
                    </td>
                    <td>
                      <div className={styles.actionsCell}>
                        <button
                          type="button"
                          onClick={() => handleOpenEdit(notice)}
                          className={styles.actionIconBtn}
                          title="Edit Notice"
                        >
                          <Edit2 size={15} />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(notice.id, notice.title)}
                          className={`${styles.actionIconBtn} ${styles.deleteBtn}`}
                          title="Delete Notice"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className={styles.emptyState}>
                    No notices found matching your criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Modal */}
      {isModalOpen && (
        <div className={styles.modalBackdrop} data-lenis-prevent="true">
          <div className={styles.modalContent} data-lenis-prevent="true">
            <div className={styles.modalHeader}>
              <h3>{editingId ? "Edit Notice / Circular" : "Publish New Notice"}</h3>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className={styles.closeModalBtn}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleFormSubmit} className={styles.modalForm} data-lenis-prevent="true">
              <label>
                <span>Notice Title *</span>
                <input
                  type="text"
                  required
                  placeholder="e.g. Admission Open for Session 2026-2027"
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
                    <option value="Notice">Notice</option>
                    <option value="Admission">Admission</option>
                    <option value="Academic">Academic</option>
                    <option value="Event">Event</option>
                  </select>
                </label>

                <label>
                  <span>Author / Desk</span>
                  <input
                    type="text"
                    placeholder="e.g. Principal Desk, Admission Cell"
                    value={formData.author}
                    onChange={(e) => setFormData({ ...formData, author: e.target.value })}
                  />
                </label>
              </div>

              <label>
                <span>Brief Summary (Shown on Cards) *</span>
                <textarea
                  required
                  rows={2}
                  data-lenis-prevent="true"
                  placeholder="Short summary highlighting key dates or instructions..."
                  value={formData.summary}
                  onChange={(e) => setFormData({ ...formData, summary: e.target.value })}
                />
              </label>

              <label>
                <span>Full Circular Content (Shown in Detail View)</span>
                <textarea
                  rows={5}
                  data-lenis-prevent="true"
                  placeholder="Complete announcement, detailed rules, timings, or venue details..."
                  value={formData.fullContent}
                  onChange={(e) => setFormData({ ...formData, fullContent: e.target.value })}
                />
              </label>

              <label style={{ flexDirection: "row", alignItems: "center", gap: 10, cursor: "pointer" }}>
                <input
                  type="checkbox"
                  checked={formData.isImportant}
                  onChange={(e) => setFormData({ ...formData, isImportant: e.target.checked })}
                  style={{ width: "auto" }}
                />
                <span>Pin as Important / Urgent Announcement</span>
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
                  {editingId ? "Save Changes" : "Publish to Live Site"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
