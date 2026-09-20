import { useState } from "react";
import {
  Plus,
  Search,
  Trash2,
  Edit2,
  X,
  Image as ImageIcon,
  Check,
} from "lucide-react";
import styles from "./AdminGallery.module.css";
import { useData } from "@/context/DataContext";
import useDocumentTitle from "@/hooks/useDocumentTitle";

const PRESET_IMAGES = [
  { url: "/images/hero_meditation.png", label: "Assembly Courtyard" },
  { url: "/images/blog1.png", label: "Cultural Event" },
  { url: "/images/blog2.png", label: "Painting Contest" },
  { url: "/images/blog3.png", label: "Sports Ground" },
  { url: "/images/how_we_work.png", label: "Science / Computer Lab" },
  { url: "/images/expert_guidance.png", label: "Classroom" },
  { url: "/images/guide1.png", label: "Faculty 1" },
  { url: "/images/guide2.png", label: "Faculty 2" },
  { url: "/images/guide3.png", label: "Faculty 3" },
  { url: "/images/guide4.png", label: "Faculty 4" },
];

const CATEGORIES = ["All", "Campus", "Events", "Sports", "Academics"];

export default function AdminGallery() {
  useDocumentTitle("Photo Gallery Manager | GPS Admin");
  const { gallery, addGalleryItem, updateGalleryItem, deleteGalleryItem } = useData();

  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchTerm, setSearchTerm] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);

  // Form State
  const [formTitle, setFormTitle] = useState("");
  const [formCategory, setFormCategory] = useState("Campus");
  const [formImage, setFormImage] = useState("/images/blog1.png");
  const [formCaption, setFormCaption] = useState("");

  const handleOpenAdd = () => {
    setEditingItem(null);
    setFormTitle("");
    setFormCategory("Campus");
    setFormImage("/images/blog1.png");
    setFormCaption("");
    setModalOpen(true);
  };

  const handleOpenEdit = (item) => {
    setEditingItem(item);
    setFormTitle(item.title);
    setFormCategory(item.category || "Campus");
    setFormImage(item.image);
    setFormCaption(item.caption || "");
    setModalOpen(true);
  };

  const handleSave = (e) => {
    e.preventDefault();
    if (!formTitle.trim()) return;

    if (editingItem) {
      updateGalleryItem(editingItem.id, {
        title: formTitle.trim(),
        category: formCategory,
        image: formImage,
        caption: formCaption.trim(),
      });
    } else {
      addGalleryItem({
        title: formTitle.trim(),
        category: formCategory,
        image: formImage,
        caption: formCaption.trim(),
      });
    }

    setModalOpen(false);
  };

  const handleDelete = (id, title) => {
    if (window.confirm(`Are you sure you want to remove "${title}" from the school gallery?`)) {
      deleteGalleryItem(id);
    }
  };

  const filteredItems = gallery.filter((item) => {
    const matchesCategory =
      selectedCategory === "All" || item.category === selectedCategory;
    const matchesSearch =
      item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.caption && item.caption.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  const getCategoryClass = (cat) => {
    switch (cat) {
      case "Campus":
        return styles.catCampus;
      case "Events":
        return styles.catEvents;
      case "Sports":
        return styles.catSports;
      case "Academics":
        return styles.catAcademics;
      default:
        return styles.catCampus;
    }
  };

  return (
    <div className={styles.galleryWrapper}>
      {/* Header */}
      <div className={styles.headerSection}>
        <div className={styles.headerTitle}>
          <h2>School Photo Gallery & Media Manager</h2>
          <p>
            Upload, organize, and showcase campus infrastructure, sports day, and academic events live on the public website.
          </p>
        </div>
        <button type="button" className={styles.addBtn} onClick={handleOpenAdd}>
          <Plus size={18} />
          <span>Add New Photo</span>
        </button>
      </div>

      {/* Filter & Search Bar */}
      <div className={styles.filterBar}>
        <div className={styles.categoryPills}>
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              type="button"
              className={`${styles.categoryBtn} ${
                selectedCategory === cat
                  ? `${styles.categoryBtnActive} ${styles[`catBtnActive_${cat.toLowerCase()}`] || ""}`
                  : ""
              }`}
              onClick={() => setSelectedCategory(cat)}
            >
              {cat}
              {cat !== "All" && (
                <span style={{ marginLeft: 6, opacity: 0.75, fontSize: "0.74rem" }}>
                  ({gallery.filter((i) => i.category === cat).length})
                </span>
              )}
            </button>
          ))}
        </div>

        <div className={styles.searchWrapper}>
          <Search size={16} className={styles.searchIcon} />
          <input
            type="text"
            placeholder="Search photos..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={styles.searchInput}
          />
        </div>
      </div>

      {/* Photo Grid */}
      {filteredItems.length > 0 ? (
        <div className={styles.galleryGrid}>
          {filteredItems.map((item) => (
            <div key={item.id} className={styles.photoCard}>
              <div className={styles.imageContainer}>
                <img
                  src={item.image}
                  alt={item.title}
                  className={styles.photoImg}
                  loading="lazy"
                  onError={(e) => {
                    e.target.src = "/images/blog1.png";
                  }}
                />
                <span className={`${styles.badgeCategory} ${getCategoryClass(item.category)}`}>
                  {item.category || "Campus"}
                </span>
              </div>
              <div className={styles.cardBody}>
                <h4 className={styles.photoTitle}>{item.title}</h4>
                <p className={styles.photoCaption}>
                  {item.caption || "No description provided."}
                </p>
                <div className={styles.cardActions}>
                  <button
                    type="button"
                    className={styles.actionBtn}
                    onClick={() => handleOpenEdit(item)}
                    title="Edit details"
                  >
                    <Edit2 size={14} />
                    <span>Edit</span>
                  </button>
                  <button
                    type="button"
                    className={`${styles.actionBtn} ${styles.deleteBtn}`}
                    onClick={() => handleDelete(item.id, item.title)}
                    title="Delete photo"
                  >
                    <Trash2 size={14} />
                    <span>Delete</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className={styles.emptyState}>
          <ImageIcon size={48} style={{ opacity: 0.4 }} />
          <p>No photos found matching your search or category filter.</p>
        </div>
      )}

      {/* Add / Edit Modal */}
      {modalOpen && (
        <div className={styles.modalBackdrop} data-lenis-prevent="true">
          <div className={styles.modalContent} data-lenis-prevent="true">
            <div className={styles.modalHeader}>
              <h3>{editingItem ? "Edit Photo Information" : "Add Photo to Gallery"}</h3>
              <button
                type="button"
                className={styles.closeBtn}
                onClick={() => setModalOpen(false)}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSave} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <div className={styles.formGroup}>
                <label className={styles.label}>Photo Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g., Annual Science Exhibition 2026"
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  className={styles.input}
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>Category</label>
                <select
                  value={formCategory}
                  onChange={(e) => setFormCategory(e.target.value)}
                  className={styles.select}
                >
                  <option value="Campus">Campus & Infrastructure</option>
                  <option value="Events">School Events & Cultural</option>
                  <option value="Sports">Athletics & Sports Day</option>
                  <option value="Academics">Academic Labs & Classrooms</option>
                </select>
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>Image Path / URL</label>
                <input
                  type="text"
                  required
                  placeholder="/images/blog1.png or external URL"
                  value={formImage}
                  onChange={(e) => setFormImage(e.target.value)}
                  className={styles.input}
                />

                <span style={{ fontSize: "0.75rem", color: "#94a3b8", marginTop: 4 }}>
                  Or pick from school asset library:
                </span>
                <div className={styles.presetGrid}>
                  {PRESET_IMAGES.map((preset) => (
                    <button
                      key={preset.url}
                      type="button"
                      className={`${styles.presetThumb} ${
                        formImage === preset.url ? styles.presetThumbSelected : ""
                      }`}
                      onClick={() => setFormImage(preset.url)}
                      title={preset.label}
                    >
                      <img src={preset.url} alt={preset.label} />
                    </button>
                  ))}
                </div>
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>Caption / Description</label>
                <textarea
                  placeholder="Brief description of the activity, venue, or students involved..."
                  value={formCaption}
                  onChange={(e) => setFormCaption(e.target.value)}
                  className={styles.textarea}
                  data-lenis-prevent="true"
                />
              </div>

              <div className={styles.modalFooter}>
                <button
                  type="button"
                  className={styles.cancelBtn}
                  onClick={() => setModalOpen(false)}
                >
                  Cancel
                </button>
                <button type="submit" className={styles.saveBtn}>
                  {editingItem ? "Update Photo" : "Add to Gallery"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
