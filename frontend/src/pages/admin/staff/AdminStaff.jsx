import { useState } from "react";
import { Plus, Search, Edit2, Trash2, CheckCircle, X, Award, Briefcase, GraduationCap } from "lucide-react";
import styles from "./AdminStaff.module.css";
import { useData } from "@/context/DataContext";
import useDocumentTitle from "@/hooks/useDocumentTitle";

export default function AdminStaff() {
  useDocumentTitle("Manage Faculty & Staff | Glorious Admin");
  const { staff, addStaff, updateStaff, deleteStaff } = useData();

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedWing, setSelectedWing] = useState("All");
  const [toast, setToast] = useState("");

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    role: "",
    qualification: "",
    experience: "",
    wing: "Secondary",
    image: "/images/guide1.png",
    bio: "",
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
      member.name.toLowerCase().includes(query) ||
      member.role.toLowerCase().includes(query) ||
      (member.qualification && member.qualification.toLowerCase().includes(query));
    return matchesWing && matchesSearch;
  });

  const handleOpenAdd = () => {
    setEditingId(null);
    setFormData({
      name: "",
      role: "Senior Educator",
      qualification: "M.Sc., B.Ed.",
      experience: "5+ Years Experience",
      wing: "Secondary",
      image: "/images/user1.png",
      bio: "Dedicated faculty member fostering intellectual curiosity and academic discipline in students.",
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (member) => {
    setEditingId(member.id);
    setFormData({
      name: member.name,
      role: member.role,
      qualification: member.qualification || "",
      experience: member.experience || "",
      wing: member.wing || "Secondary",
      image: member.image || "/images/guide1.png",
      bio: member.bio || "",
    });
    setIsModalOpen(true);
  };

  const handleDelete = (id, name) => {
    if (window.confirm(`Are you sure you want to remove faculty member:\n"${name}"?`)) {
      deleteStaff(id);
      showToast("Faculty profile removed.");
    }
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    if (editingId) {
      updateStaff(editingId, formData);
      showToast("Staff profile updated successfully.");
    } else {
      addStaff(formData);
      showToast("New teacher profile added to website.");
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
          filteredStaff.map((member) => (
            <div key={member.id} className={styles.staffCard}>
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
                  onClick={() => handleDelete(member.id, member.name)}
                  className={`${styles.actionBtn} ${styles.deleteBtn}`}
                >
                  <Trash2 size={14} />
                  <span>Delete</span>
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className={styles.emptyState}>
            No faculty members found matching your search.
          </div>
        )}
      </div>

      {/* Add / Edit Modal */}
      {isModalOpen && (
        <div className={styles.modalBackdrop}>
          <div className={styles.modalContent}>
            <div className={styles.modalHeader}>
              <h3>{editingId ? "Edit Faculty Profile" : "Add Teacher Profile"}</h3>
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
                <span>Full Name *</span>
                <input
                  type="text"
                  required
                  placeholder="e.g. Dr. R. K. Sharma or Mrs. Ananya Verma"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </label>

              <div className={styles.formGrid}>
                <label>
                  <span>Role / Designation *</span>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Senior Secondary Mathematics Lead"
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

              <div className={styles.formGrid}>
                <label>
                  <span>Educational Qualification</span>
                  <input
                    type="text"
                    placeholder="e.g. M.Sc. (Mathematics), B.Ed."
                    value={formData.qualification}
                    onChange={(e) => setFormData({ ...formData, qualification: e.target.value })}
                  />
                </label>

                <label>
                  <span>Teaching Experience</span>
                  <input
                    type="text"
                    placeholder="e.g. 14+ Years Experience"
                    value={formData.experience}
                    onChange={(e) => setFormData({ ...formData, experience: e.target.value })}
                  />
                </label>
              </div>

              <label>
                <span>Photo Avatar</span>
                <select
                  value={formData.image}
                  onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                >
                  <option value="/images/guide1.png">Male Faculty 1 (/images/guide1.png)</option>
                  <option value="/images/guide2.png">Female Faculty 1 (/images/guide2.png)</option>
                  <option value="/images/guide3.png">Male Faculty 2 (/images/guide3.png)</option>
                  <option value="/images/user1.png">Female Faculty 2 (/images/user1.png)</option>
                  <option value="/images/user2.png">Sports Coach (/images/user2.png)</option>
                  <option value="/images/user3.png">Language Teacher (/images/user3.png)</option>
                </select>
              </label>

              <label>
                <span>Bio / Teaching Philosophy</span>
                <textarea
                  rows={3}
                  placeholder="Short background, teaching methodology, achievements, subjects taught..."
                  value={formData.bio}
                  onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
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
