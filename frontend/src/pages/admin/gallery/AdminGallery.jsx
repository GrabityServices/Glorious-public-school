import { useState, useRef, useEffect } from "react";
import {
  Plus,
  Search,
  Trash2,
  Edit2,
  X,
  Upload,
  Image as ImageIcon,
  AlertCircle,
  Loader2,
  CheckCircle,
} from "lucide-react";
import styles from "./AdminGallery.module.css";
import { useData } from "@/context/DataContext";
import { useConfirm } from "@/context/ConfirmContext";
import useDocumentTitle from "@/hooks/useDocumentTitle";
import EmptyState from "@/components/common/EmptyState";
import ShimmerImage from "@/components/common/ShimmerImage";
import { GALLERY_CATEGORIES } from "@/data/galleryData";

const PAGE_SIZE = 12;

export default function AdminGallery() {
  useDocumentTitle("Photo Gallery Manager | GPS Admin");
  const {
    gallery,
    loading,
    addGalleryItem,
    updateGalleryItem,
    deleteGalleryItem,
    uploadGalleryImage,
  } = useData();
  const confirm = useConfirm();

  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchTerm, setSearchTerm] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);

  // Pagination / Load More state
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  // Reset pagination when category filter or search query changes
  useEffect(() => {
    setVisibleCount(PAGE_SIZE);
  }, [selectedCategory, searchTerm]);

  // Form State
  const [formTitle, setFormTitle] = useState("");
  const [formCategory, setFormCategory] = useState("Campus");
  const [formImage, setFormImage] = useState("");
  const [formCaption, setFormCaption] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const fileInputRef = useRef(null);

  const handleOpenAdd = () => {
    setEditingItem(null);
    setFormTitle("");
    setFormCategory("Campus");
    setFormImage("");
    setFormCaption("");
    setUploadError("");
    setModalOpen(true);
  };

  const handleOpenEdit = (item) => {
    setEditingItem(item);
    setFormTitle(item.title || "");
    setFormCategory(item.category || "Campus");
    setFormImage(item.image || "");
    setFormCaption(item.caption || "");
    setUploadError("");
    setModalOpen(true);
  };

  // Upload photograph directly from device / local storage
  const handlePhotoUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 15 * 1024 * 1024) {
      setUploadError("Photo size must be under 15MB.");
      return;
    }

    setIsUploading(true);
    setUploadError("");
    try {
      const res = await uploadGalleryImage(file);
      if (res && res.fileUrl) {
        setFormImage(res.fileUrl);
      }
    } catch (err) {
      setUploadError(err.message || "Failed to upload photo. Please try again.");
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!formTitle.trim()) return;
    if (!formImage) {
      setUploadError("Please select and upload a photograph from your device.");
      return;
    }

    const payload = {
      title: formTitle.trim(),
      category: formCategory,
      image: formImage,
      caption: formCaption.trim(),
    };

    if (editingItem) {
      const editId = editingItem.id || editingItem._id;
      await updateGalleryItem(editId, payload);
    } else {
      await addGalleryItem(payload);
    }

    setModalOpen(false);
  };

  const handleDelete = async (item) => {
    const itemId = item.id || item._id;
    const confirmed = await confirm({
      title: "Delete Photograph?",
      message:
        "Are you sure you want to permanently remove this photo from the school photo gallery? Any uploaded file will also be deleted from disk. This action cannot be undone.",
      itemName: item.title,
      confirmText: "Yes, Delete",
      cancelText: "Cancel",
      variant: "danger",
    });
    if (confirmed) {
      await deleteGalleryItem(itemId);
    }
  };

  const filteredItems = gallery.filter((item) => {
    const matchesCategory =
      selectedCategory === "All" || item.category === selectedCategory;
    const matchesSearch =
      (item.title && item.title.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (item.caption && item.caption.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  // Chunk items for performance
  const displayedItems = filteredItems.slice(0, visibleCount);
  const hasMore = visibleCount < filteredItems.length;
  const remainingCount = filteredItems.length - visibleCount;

  const handleLoadMore = () => {
    setIsLoadingMore(true);
    setTimeout(() => {
      setVisibleCount((prev) => prev + PAGE_SIZE);
      setIsLoadingMore(false);
    }, 250);
  };

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
      case "Other":
        return styles.catOther;
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
          {GALLERY_CATEGORIES.map((cat) => (
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
              <span className={styles.categoryCountBadge}>
                {cat === "All"
                  ? gallery.length
                  : gallery.filter((i) => i.category === cat).length}
              </span>
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

      {/* Loading Shimmer Skeletons or Photo Grid */}
      {loading ? (
        <div className={styles.galleryGrid}>
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className={styles.skeletonCard}>
              <div className={styles.skeletonThumbnail}>
                <div className={styles.youtubeShimmerWave} />
              </div>
              <div className={styles.skeletonBody}>
                <div className={styles.skeletonPill}>
                  <div className={styles.youtubeShimmerWave} />
                </div>
                <div className={styles.skeletonTitle}>
                  <div className={styles.youtubeShimmerWave} />
                </div>
                <div className={styles.skeletonLine}>
                  <div className={styles.youtubeShimmerWave} />
                </div>
                <div className={styles.skeletonActions}>
                  <div className={styles.skeletonButton}>
                    <div className={styles.youtubeShimmerWave} />
                  </div>
                  <div className={styles.skeletonButton}>
                    <div className={styles.youtubeShimmerWave} />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : filteredItems.length > 0 ? (
        <>
          <div className={styles.galleryGrid}>
            {displayedItems.map((item) => {
              const itemId = item.id || item._id;
              return (
                <div key={itemId} className={styles.photoCard}>
                  <div className={styles.imageContainer}>
                    <ShimmerImage
                      src={item.image}
                      alt={item.title}
                      className={styles.photoImg}
                      loading="lazy"
                      fallbackSrc="/images/dance-&-cultural-fest.webp"
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
                        className={styles.editBtn}
                        onClick={() => handleOpenEdit(item)}
                        title="Edit Photo Info"
                      >
                        <Edit2 size={14} />
                        <span>Edit</span>
                      </button>
                      <button
                        type="button"
                        className={styles.deleteBtn}
                        onClick={() => handleDelete(item)}
                        title="Delete Photo"
                      >
                        <Trash2 size={14} />
                        <span>Delete</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}

            {/* Skeleton placeholders while loading more */}
            {isLoadingMore &&
              Array.from({ length: Math.min(3, remainingCount) }).map((_, i) => (
                <div key={`loading-more-${i}`} className={styles.skeletonCard}>
                  <div className={styles.skeletonThumbnail}>
                    <div className={styles.youtubeShimmerWave} />
                  </div>
                  <div className={styles.skeletonBody}>
                    <div className={styles.skeletonPill}>
                      <div className={styles.youtubeShimmerWave} />
                    </div>
                    <div className={styles.skeletonTitle}>
                      <div className={styles.youtubeShimmerWave} />
                    </div>
                    <div className={styles.skeletonLine}>
                      <div className={styles.youtubeShimmerWave} />
                    </div>
                    <div className={styles.skeletonActions}>
                      <div className={styles.skeletonButton}>
                        <div className={styles.youtubeShimmerWave} />
                      </div>
                      <div className={styles.skeletonButton}>
                        <div className={styles.youtubeShimmerWave} />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
          </div>

          {/* Load More Pagination Section */}
          {filteredItems.length > PAGE_SIZE && (
            <div className={styles.loadMoreSection}>
              <div className={styles.loadMoreProgressWrap}>
                <div className={styles.loadMoreCounter}>
                  Showing <strong>{displayedItems.length}</strong> of <strong>{filteredItems.length}</strong> photographs
                </div>
                <div className={styles.progressBar}>
                  <div
                    className={styles.progressFill}
                    style={{
                      width: `${Math.min(
                        100,
                        (displayedItems.length / filteredItems.length) * 100
                      )}%`,
                    }}
                  />
                </div>
              </div>

              {hasMore ? (
                <button
                  type="button"
                  className={styles.loadMoreBtn}
                  onClick={handleLoadMore}
                  disabled={isLoadingMore}
                >
                  {isLoadingMore ? (
                    <>
                      <Loader2 size={16} className={styles.spin} />
                      <span>Loading Photos...</span>
                    </>
                  ) : (
                    <>
                      <Plus size={16} />
                      <span>Load More Photos</span>
                      <span className={styles.remainingPill}>
                        +{Math.min(PAGE_SIZE, remainingCount)}
                      </span>
                    </>
                  )}
                </button>
              ) : (
                <div className={styles.allLoadedText}>
                  <CheckCircle size={15} color="#10b981" />
                  <span>All {filteredItems.length} photographs loaded</span>
                </div>
              )}
            </div>
          )}
        </>
      ) : (
        <EmptyState
          icon={ImageIcon}
          title="No Photographs Found"
          description={
            searchTerm || selectedCategory !== "All"
              ? "No photos match your current filter. Clear search or pick another category."
              : "No gallery photographs uploaded yet. Click above to add your first photo."
          }
          actionText="Add New Photo"
          onAction={handleOpenAdd}
        />
      )}

      {/* Add / Edit Modal */}
      {modalOpen && (
        <div
          className={styles.modalOverlay}
          data-lenis-prevent="true"
          onClick={(e) => {
            if (e.target === e.currentTarget) setModalOpen(false);
          }}
        >
          <div className={styles.modalContent} data-lenis-prevent="true">
            <div className={styles.modalHeader}>
              <div>
                <h3>{editingItem ? "Edit Photograph" : "Upload New Photograph"}</h3>
                <p style={{ fontSize: "0.82rem", color: "#64748b", margin: 0 }}>
                  Upload high-resolution event, campus, or laboratory pictures.
                </p>
              </div>
              <button
                type="button"
                className={styles.closeBtn}
                onClick={() => setModalOpen(false)}
                title="Close"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSave} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              {/* Photo Title */}
              <div className={styles.formGroup}>
                <div className={styles.labelHeader}>
                  <label className={styles.label}>Photo Title *</label>
                  <span className={styles.charCount}>{formTitle.length}/90 chars</span>
                </div>
                <input
                  type="text"
                  required
                  maxLength={90}
                  placeholder="e.g., Annual Science Exhibition 2026 or Modern Computer Lab"
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  className={styles.input}
                />
              </div>

              {/* Category */}
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
                  <option value="Other">Other / Miscellaneous Activities</option>
                </select>
              </div>

              {/* Single Feature: Upload Photograph from Device */}
              <div className={styles.photoUploadSection}>
                <div className={styles.labelHeader}>
                  <span className={styles.photoHeading}>
                    <ImageIcon size={15} /> Photograph File *
                  </span>
                  {formImage && (
                    <span className={styles.photoUploadedTag}>
                      {formImage.startsWith("/uploads/") ? "Uploaded from Device" : "Selected Photo"}
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

                {formImage ? (
                  <div className={styles.selectedPhotoCard}>
                    <div className={styles.photoPreviewWrap}>
                      <img
                        src={formImage}
                        alt="Gallery preview"
                        className={styles.photoPreviewImg}
                        onError={(e) => {
                          e.target.src = "/images/dance-&-cultural-fest.webp";
                        }}
                      />
                    </div>

                    <div className={styles.photoMeta}>
                      <div className={styles.photoMetaTitle}>
                        {formImage.split("/").pop()}
                      </div>
                      <p className={styles.photoMetaSub}>
                        {formImage.startsWith("/uploads/")
                          ? "Stored in dedicated gallery storage"
                          : "School media asset"}
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
                          onClick={() => setFormImage("")}
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
                          : "Click to Select Photograph from Device"}
                      </span>
                      <span className={styles.dropzoneSub}>
                        Supports JPG, PNG, WEBP, or JFIF (Max 15MB)
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

              {/* Caption / Description */}
              <div className={styles.formGroup}>
                <div className={styles.labelHeader}>
                  <label className={styles.label}>Caption / Description</label>
                  <span className={styles.charCount}>{formCaption.length}/300 chars</span>
                </div>
                <textarea
                  maxLength={300}
                  placeholder="Brief description of the activity, venue, students, or facilities involved..."
                  value={formCaption}
                  onChange={(e) => setFormCaption(e.target.value)}
                  className={styles.textarea}
                  data-lenis-prevent="true"
                />
              </div>

              {/* Modal Footer */}
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
