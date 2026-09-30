import { useState, useRef } from "react";
import {
  Plus,
  Search,
  Edit2,
  Trash2,
  CheckCircle,
  X,
  Bell,
  Paperclip,
  Upload,
  FileText,
  Image as ImageIcon,
  Loader2,
  ExternalLink,
} from "lucide-react";
import styles from "./AdminNotices.module.css";
import { useData } from "@/context/DataContext";
import { useConfirm } from "@/context/ConfirmContext";
import useDocumentTitle from "@/hooks/useDocumentTitle";
import EmptyState from "@/components/common/EmptyState";

export default function AdminNotices() {
  useDocumentTitle("Manage Notices & News | Glorious Admin");
  const {
    notices,
    addNotice,
    updateNotice,
    deleteNotice,
    toggleNoticeImportant,
    uploadNoticeAttachment,
  } = useData();
  const confirm = useConfirm();

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
    attachmentUrl: "",
    attachmentType: "",
    attachmentName: "",
    attachmentSize: 0,
  });

  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const fileInputRef = useRef(null);

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
    setUploadError("");
    setFormData({
      title: "",
      category: "Notice",
      author: "Principal Desk",
      isImportant: false,
      summary: "",
      fullContent: "",
      attachmentUrl: "",
      attachmentType: "",
      attachmentName: "",
      attachmentSize: 0,
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (notice) => {
    setEditingId(notice.id || notice._id);
    setUploadError("");
    const attachUrl = notice.attachmentUrl || notice.pdfUrl || "";
    const isPdf =
      notice.attachmentType === "pdf" ||
      attachUrl.toLowerCase().endsWith(".pdf");
    setFormData({
      title: notice.title || "",
      category: notice.category || "Notice",
      author: notice.author || "Principal Desk",
      isImportant: !!notice.isImportant,
      summary: notice.summary || "",
      fullContent: notice.fullContent || "",
      attachmentUrl: attachUrl,
      attachmentType: isPdf ? "pdf" : attachUrl ? "image" : "",
      attachmentName: notice.attachmentName || (attachUrl ? attachUrl.split("/").pop() : ""),
      attachmentSize: notice.attachmentSize || 0,
    });
    setIsModalOpen(true);
  };

  const handleFileSelect = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 15 * 1024 * 1024) {
      setUploadError("File is too large. Maximum size is 15MB.");
      return;
    }

    setUploading(true);
    setUploadError("");
    try {
      const res = await uploadNoticeAttachment(file);
      if (res && res.fileUrl) {
        setFormData((prev) => ({
          ...prev,
          attachmentUrl: res.fileUrl,
          attachmentType: res.attachmentType,
          attachmentName: res.attachmentName,
          attachmentSize: res.attachmentSize,
        }));
        showToast("File uploaded successfully.");
      }
    } catch (err) {
      setUploadError(err.message || "Failed to upload file");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleRemoveAttachment = () => {
    setFormData((prev) => ({
      ...prev,
      attachmentUrl: "",
      attachmentType: "",
      attachmentName: "",
      attachmentSize: 0,
    }));
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleDelete = async (id, title) => {
    const confirmed = await confirm({
      title: "Delete Notice?",
      message: "Are you sure you want to permanently delete this notice? This action cannot be undone.",
      itemName: title,
      confirmText: "Yes, Delete",
      cancelText: "Cancel",
      variant: "danger",
    });
    if (confirmed) {
      deleteNotice(id);
      showToast("Notice permanently deleted.");
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
                      <h4>
                        <span>{notice.title}</span>
                        {(notice.attachmentUrl || notice.pdfUrl) && (
                          <a
                            href={notice.attachmentUrl || notice.pdfUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={styles.attachmentPill}
                            title="View / Download attached file"
                          >
                            {notice.attachmentType === "pdf" ||
                            (notice.attachmentUrl || notice.pdfUrl).toLowerCase().endsWith(".pdf") ? (
                              <>
                                <FileText size={12} color="#dc2626" />
                                <span>PDF</span>
                              </>
                            ) : (
                              <>
                                <ImageIcon size={12} color="#0284c7" />
                                <span>Image</span>
                              </>
                            )}
                          </a>
                        )}
                      </h4>
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
                  <td colSpan={5} style={{ padding: "32px 16px" }}>
                    <EmptyState
                      icon={Bell}
                      title="No Notices or Circulars Found"
                      description={
                        searchQuery || selectedCategory !== "All"
                          ? "No notices match your current search or category filter."
                          : "No notices have been published to the notice board yet."
                      }
                      actionText="Publish New Notice"
                      onAction={handleOpenAdd}
                      compact
                    />
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
              {/* Notice Title with Character Limit */}
              <label>
                <div className={styles.fieldHeader}>
                  <span>Notice Title *</span>
                  <span
                    className={`${styles.charCounter} ${
                      formData.title.length > 90 ? styles.charNearLimit : ""
                    } ${formData.title.length >= 100 ? styles.charAtLimit : ""}`}
                  >
                    {formData.title.length} / 100 chars
                  </span>
                </div>
                <input
                  type="text"
                  required
                  maxLength={100}
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
                  <div className={styles.fieldHeader}>
                    <span>Author / Desk</span>
                    <span
                      className={`${styles.charCounter} ${
                        formData.author.length > 35 ? styles.charNearLimit : ""
                      }`}
                    >
                      {formData.author.length} / 40 chars
                    </span>
                  </div>
                  <input
                    type="text"
                    maxLength={40}
                    placeholder="e.g. Principal Desk, Admission Cell"
                    value={formData.author}
                    onChange={(e) => setFormData({ ...formData, author: e.target.value })}
                  />
                </label>
              </div>

              {/* Card Summary with Character Limit */}
              <label>
                <div className={styles.fieldHeader}>
                  <span>Brief Summary (Shown on Cards) *</span>
                  <span
                    className={`${styles.charCounter} ${
                      formData.summary.length > 160 ? styles.charNearLimit : ""
                    } ${formData.summary.length >= 180 ? styles.charAtLimit : ""}`}
                  >
                    {formData.summary.length} / 180 chars
                  </span>
                </div>
                <textarea
                  required
                  rows={2}
                  maxLength={180}
                  data-lenis-prevent="true"
                  placeholder="Short summary highlighting key dates or instructions (max 180 chars)..."
                  value={formData.summary}
                  onChange={(e) => setFormData({ ...formData, summary: e.target.value })}
                />
              </label>

              {/* Full Description with Character Limit */}
              <label>
                <div className={styles.fieldHeader}>
                  <span>Full Circular Content (Shown in Detail View)</span>
                  <span
                    className={`${styles.charCounter} ${
                      formData.fullContent.length > 1100 ? styles.charNearLimit : ""
                    } ${formData.fullContent.length >= 1200 ? styles.charAtLimit : ""}`}
                  >
                    {formData.fullContent.length} / 1200 chars
                  </span>
                </div>
                <textarea
                  rows={4}
                  maxLength={1200}
                  data-lenis-prevent="true"
                  placeholder="Complete announcement, detailed rules, timings, or venue details (max 1200 chars)..."
                  value={formData.fullContent}
                  onChange={(e) => setFormData({ ...formData, fullContent: e.target.value })}
                />
              </label>

              {/* Attachment Upload Section */}
              <div className={styles.attachmentSection}>
                <div className={styles.attachmentTitleRow}>
                  <span className={styles.attachmentTitle}>
                    <Paperclip size={15} color="#dc2626" />
                    <span>Notice Photo or PDF Document</span>
                  </span>
                  <span className={styles.attachmentBadgeOptional}>Optional</span>
                </div>

                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileSelect}
                  accept=".jpg,.jpeg,.png,.webp,.gif,.pdf"
                  style={{ display: "none" }}
                />

                {uploadError && <div className={styles.uploadError}>{uploadError}</div>}

                {formData.attachmentUrl ? (
                  <div className={styles.filePreviewCard}>
                    <div className={styles.filePreviewLeft}>
                      {formData.attachmentType === "image" ? (
                        <img
                          src={formData.attachmentUrl}
                          alt="Notice Attachment Preview"
                          className={styles.fileThumbImg}
                        />
                      ) : (
                        <div className={styles.filePdfBadge}>
                          <FileText size={18} />
                          <span>PDF</span>
                        </div>
                      )}
                      <div className={styles.fileInfo}>
                        <span className={styles.fileName}>
                          {formData.attachmentName || "Attached Notice File"}
                        </span>
                        <span className={styles.fileMeta}>
                          {formData.attachmentType === "pdf" ? "PDF Document" : "Official Image"}
                          {formData.attachmentSize > 0 &&
                            ` • ${(formData.attachmentSize / 1024).toFixed(1)} KB`}
                        </span>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={handleRemoveAttachment}
                      className={styles.removeFileBtn}
                      title="Remove attachment"
                    >
                      <Trash2 size={13} />
                      <span>Remove</span>
                    </button>
                  </div>
                ) : (
                  <div
                    className={styles.uploadDropzone}
                    onClick={() => !uploading && fileInputRef.current?.click()}
                  >
                    <div className={styles.uploadIconWrap}>
                      {uploading ? (
                        <Loader2
                          size={20}
                          className="spin"
                          style={{ animation: "spin 1s linear infinite" }}
                        />
                      ) : (
                        <Upload size={20} />
                      )}
                    </div>
                    <div className={styles.uploadPrompt}>
                      {uploading ? (
                        "Uploading file to server..."
                      ) : (
                        <>
                          <span className={styles.uploadPromptHighlight}>Click to upload</span> photo or PDF circular
                        </>
                      )}
                    </div>
                    <div className={styles.uploadSubtext}>
                      Supports PNG, JPG, JPEG, WEBP, GIF, or PDF (Max 15MB)
                    </div>
                  </div>
                )}
              </div>

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
