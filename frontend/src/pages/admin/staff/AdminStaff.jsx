import { useState, useRef } from "react";
import {
  Plus,
  Search,
  Edit2,
  Trash2,
  CheckCircle,
  X,
  Upload,
  User,
  AlertCircle,
  Loader2,
  GraduationCap,
} from "lucide-react";
import styles from "./AdminStaff.module.css";
import { useData } from "@/context/DataContext";
import { useConfirm } from "@/context/ConfirmContext";
import useDocumentTitle from "@/hooks/useDocumentTitle";
import EmptyState from "@/components/common/EmptyState";

export default function AdminStaff() {
  useDocumentTitle("Manage Faculty & Staff | Glorious Admin");
  const { staff, addStaff, updateStaff, deleteStaff, uploadStaffPhoto } = useData();
  const confirm = useConfirm();

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedWing, setSelectedWing] = useState("All");
  const [toast, setToast] = useState("");

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const fileInputRef = useRef(null);

  const [formData, setFormData] = useState({
    name: "",
    role: "Senior Educator",
    qualification: "M.Sc., B.Ed.",
    experience: "5+ Years Experience",
    wing: "Secondary",
    image: "",
    bio: "Dedicated faculty member fostering intellectual curiosity and academic discipline in students.",
  });

  const wings = ["All", "Administration", "Pre-Primary", "Primary", "Secondary", "Sports"];

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(""), 3500);
  };

  const filteredStaff = staff.filter((member) => {
    const matchesWing = selectedWing === "All" || member.wing === selectedWing;
    const query = searchQuery.toLowerCase();
    const matchesSearch =
      (member.name && member.name.toLowerCase().includes(query)) ||
      (member.role && member.role.toLowerCase().includes(query)) ||
      (member.qualification && member.qualification.toLowerCase().includes(query));
    return matchesWing && matchesSearch;
  });

  const handleOpenAdd = () => {
    setEditingId(null);
    setUploadError("");
    setFormData({
      name: "",
      role: "Senior Educator",
      qualification: "M.Sc., B.Ed.",
      experience: "5+ Years Experience",
      wing: "Secondary",
      image: "",
      bio: "Dedicated faculty member fostering intellectual curiosity and academic discipline in students.",
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (member) => {
    setEditingId(member.id || member._id);
    setUploadError("");
    setFormData({
      name: member.name || "",
      role: member.role || "",
      qualification: member.qualification || "",
      experience: member.experience || "",
      wing: member.wing || "Secondary",
      image: member.image || "",
      bio: member.bio || "",
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id, name) => {
    const confirmed = await confirm({
      title: "Remove Faculty Member?",
      message:
        "Are you sure you want to permanently remove this teacher from the faculty directory? Any custom uploaded photo will also be removed. This action cannot be undone.",
      itemName: name,
      confirmText: "Yes, Delete",
      cancelText: "Cancel",
      variant: "danger",
    });
    if (confirmed) {
      await deleteStaff(id);
      showToast("Faculty profile permanently removed.");
    }
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    const dataToSave = {
      ...formData,
      image: formData.image || "/images/guide1.png",
    };

    if (editingId) {
      await updateStaff(editingId, dataToSave);
      showToast("Staff profile updated successfully.");
    } else {
      await addStaff(dataToSave);
      showToast("New teacher profile added to website.");
    }
    setIsModalOpen(false);
  };

  // Upload custom teacher photo from local storage / computer
  const handlePhotoUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      setUploadError("Photo size must be under 10MB.");
      return;
    }

    setIsUploading(true);
    setUploadError("");
    try {
      const res = await uploadStaffPhoto(file);
      if (res && res.fileUrl) {
        setFormData((prev) => ({ ...prev, image: res.fileUrl }));
        showToast("Teacher photo uploaded from storage successfully.");
      }
    } catch (err) {
      setUploadError(err.message || "Failed to upload photo. Please try again.");
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
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

      {/* Action Header */}
      <div className={styles.actionHeader}>
        <div className={styles.controlsRow}>
          <div className={styles.searchWrap}>
            <Search size={16} className={styles.searchIcon} />
            <input
              type="text"
              placeholder="Search faculty by name or subject..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={styles.searchInput}
            />
          </div>

          <select
            value={selectedWing}
            onChange={(e) => setSelectedWing(e.target.value)}
            className={styles.categorySelect}
          >
            {wings.map((wing) => (
              <option key={wing} value={wing}>
                {wing === "All" ? "All Wings" : `${wing} Wing`}
              </option>
            ))}
          </select>
        </div>

        <button type="button" onClick={handleOpenAdd} className={styles.addBtn}>
          <Plus size={18} />
          <span>Add Teacher Profile</span>
        </button>
      </div>

      {/* Staff Cards Grid */}
      <div className={styles.staffGrid}>
        {filteredStaff.length > 0 ? (
          filteredStaff.map((member) => {
            const memberId = member.id || member._id;
            return (
              <div key={memberId} className={styles.staffCard}>
                <div className={styles.avatarWrap}>
                  <img
                    src={member.image || "/images/guide1.png"}
                    alt={member.name}
                    className={styles.avatarImg}
                    onError={(e) => {
                      e.target.src = "/images/guide1.png";
                    }}
                  />
                </div>

                <h3 className={styles.staffName}>{member.name}</h3>
                <p className={styles.staffRole}>{member.role}</p>
                <span
                  className={`${styles.wingBadge} ${
                    styles[`wing_${(member.wing || "").toLowerCase().replace(/[^a-z]/g, "")}`] || ""
                  }`}
                >
                  {member.wing} Wing
                </span>

                <div className={styles.staffInfo}>
                  <div>{member.qualification}</div>
                  <div className={styles.staffExperience}>{member.experience}</div>
                </div>

                <p className={styles.staffBio}>{member.bio}</p>

                <div className={styles.cardFooter}>
                  <button
                    type="button"
                    onClick={() => handleOpenEdit(member)}
                    className={styles.actionBtn}
                  >
                    <Edit2 size={14} />
                    <span>Edit Profile</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(memberId, member.name)}
                    className={`${styles.actionBtn} ${styles.deleteBtn}`}
                  >
                    <Trash2 size={14} />
                    <span>Delete</span>
                  </button>
                </div>
              </div>
            );
          })
        ) : (
          <div style={{ gridColumn: "1 / -1" }}>
            <EmptyState
              icon={GraduationCap}
              title="No Faculty Members Found"
              description={
                searchQuery || selectedWing !== "All"
                  ? "No faculty members match your current search or wing filter. Clear your filter or add a teacher."
                  : "No teachers or staff currently added to the faculty database."
              }
              actionText="Add Teacher Profile"
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
                <h3>{editingId ? "Edit Faculty Profile" : "Add Teacher Profile"}</h3>
                <p className={styles.modalSubtitle}>
                  Publish educator details, academic qualifications, and teaching experience.
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
              {/* Full Name */}
              <label>
                <div className={styles.labelHeader}>
                  <span>Full Name *</span>
                  <span className={styles.charCount}>
                    {formData.name.length}/60 chars
                  </span>
                </div>
                <input
                  type="text"
                  required
                  maxLength={60}
                  placeholder="e.g. Sudhanshu Kumar or Dr. R. K. Sharma"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </label>

              {/* Role & Academic Wing */}
              <div className={styles.formGrid}>
                <label>
                  <div className={styles.labelHeader}>
                    <span>Role / Designation *</span>
                    <span className={styles.charCount}>
                      {formData.role.length}/70 chars
                    </span>
                  </div>
                  <input
                    type="text"
                    required
                    maxLength={70}
                    placeholder="e.g. Senior Educator or PGT Mathematics Lead"
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  />
                </label>

                <label>
                  <span>Academic Wing</span>
                  <select
                    value={formData.wing}
                    onChange={(e) => setFormData({ ...formData, wing: e.target.value })}
                  >
                    <option value="Administration">Administration</option>
                    <option value="Pre-Primary">Pre-Primary</option>
                    <option value="Primary">Primary</option>
                    <option value="Secondary">Secondary</option>
                    <option value="Sports">Sports</option>
                  </select>
                </label>
              </div>

              {/* Educational Qualification & Teaching Experience */}
              <div className={styles.formGrid}>
                <label>
                  <div className={styles.labelHeader}>
                    <span>Educational Qualification</span>
                    <span className={styles.charCount}>
                      {formData.qualification.length}/80 chars
                    </span>
                  </div>
                  <input
                    type="text"
                    maxLength={80}
                    placeholder="e.g. M.Sc. (Physics), B.Ed., CTET"
                    value={formData.qualification}
                    onChange={(e) =>
                      setFormData({ ...formData, qualification: e.target.value })
                    }
                  />
                </label>

                <label>
                  <div className={styles.labelHeader}>
                    <span>Teaching Experience</span>
                    <span className={styles.charCount}>
                      {formData.experience.length}/40 chars
                    </span>
                  </div>
                  <input
                    type="text"
                    maxLength={40}
                    placeholder="e.g. 5+ Years Experience"
                    value={formData.experience}
                    onChange={(e) =>
                      setFormData({ ...formData, experience: e.target.value })
                    }
                  />
                </label>
              </div>

              {/* Photo Upload: Single Direct Feature from Local Storage */}
              <div className={styles.photoUploadSection}>
                <div className={styles.labelHeader}>
                  <span className={styles.photoHeading}>
                    <User size={15} /> Teacher Photograph *
                  </span>
                  {formData.image && (
                    <span className={styles.photoUploadedTag}>
                      {formData.image.startsWith("/uploads/")
                        ? "Photo Uploaded from Storage"
                        : "Current Photo"}
                    </span>
                  )}
                </div>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/jfif,image/bmp"
                  style={{ display: "none" }}
                  onChange={handlePhotoUpload}
                />

                {formData.image ? (
                  <div className={styles.selectedPhotoCard}>
                    <div className={styles.photoPreviewWrap}>
                      <img
                        src={formData.image}
                        alt="Teacher photo preview"
                        className={styles.photoPreviewImg}
                        onError={(e) => {
                          e.target.src = "/images/guide1.png";
                        }}
                      />
                    </div>

                    <div className={styles.photoMeta}>
                      <div className={styles.photoMetaTitle}>
                        {formData.image.split("/").pop()}
                      </div>
                      <p className={styles.photoMetaSub}>
                        {formData.image.startsWith("/uploads/")
                          ? "Saved in dedicated uploads storage"
                          : "School directory image"}
                      </p>

                      <div className={styles.photoBtnRow}>
                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          disabled={isUploading}
                          className={styles.changePhotoBtn}
                        >
                          {isUploading ? (
                            <>
                              <Loader2 size={13} className={styles.spinIcon} />
                              <span>Uploading...</span>
                            </>
                          ) : (
                            <>
                              <Upload size={13} />
                              <span>Change Photo from Device</span>
                            </>
                          )}
                        </button>
                        <button
                          type="button"
                          onClick={() => setFormData((prev) => ({ ...prev, image: "" }))}
                          className={styles.removePhotoBtn}
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div
                    className={styles.uploadDropzone}
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <div className={styles.dropzoneIconWrap}>
                      {isUploading ? (
                        <Loader2 size={24} className={styles.spinIcon} />
                      ) : (
                        <Upload size={24} />
                      )}
                    </div>
                    <div className={styles.dropzoneText}>
                      <span className={styles.dropzoneTitle}>
                        {isUploading
                          ? "Uploading photo from storage..."
                          : "Click to Select Teacher Photo from Storage"}
                      </span>
                      <span className={styles.dropzoneSub}>
                        Supports JPG, PNG, WEBP, or JFIF (Max 10MB)
                      </span>
                    </div>
                  </div>
                )}

                {uploadError && (
                  <div className={styles.errorAlert}>
                    <AlertCircle size={15} />
                    <span>{uploadError}</span>
                  </div>
                )}
              </div>

              {/* Bio / Teaching Philosophy */}
              <label>
                <div className={styles.labelHeader}>
                  <span>Bio / Teaching Philosophy</span>
                  <span className={styles.charCount}>
                    {formData.bio.length}/400 chars
                  </span>
                </div>
                <textarea
                  rows={3}
                  maxLength={400}
                  placeholder="Dedicated faculty member fostering intellectual curiosity and academic discipline in students..."
                  value={formData.bio}
                  onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                />
              </label>

              {/* Modal Actions */}
              <div className={styles.modalActions}>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className={styles.cancelBtn}
                >
                  Cancel
                </button>
                <button type="submit" className={styles.saveBtn}>
                  {editingId ? "Save Profile" : "Add to Faculty Directory"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
