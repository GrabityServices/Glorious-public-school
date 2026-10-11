import { useState, useRef, useEffect } from "react";
import {
  Plus,
  Search,
  Trash2,
  Edit2,
  X,
  Upload,
  Image as ImageIcon,
  Video,
  Play,
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

const extractYouTubeId = (input = "") => {
  const str = String(input).trim();
  if (!str) return "";
  const iframeMatch = str.match(/src=["']([^"']+)["']/i);
  const target = iframeMatch ? iframeMatch[1] : str;
  const regExp = /(?:youtube\.com\/(?:[^/]+\/.+\/|(?:v|e(?:mbed)?|shorts|live)\/|.*[?&]v=)|youtu\.be\/)([^"&?/\s]{11})/i;
  const match = target.match(regExp);
  if (match && match[1]) return match[1];
  if (/^[a-zA-Z0-9_-]{11}$/.test(target)) return target;
  return "";
};

export default function AdminGallery() {
  useDocumentTitle("Photo & Video Gallery Manager | GPS Admin");
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
  const [formMediaType, setFormMediaType] = useState("image"); // "image" | "video"
  const [formTitle, setFormTitle] = useState("");
  const [formCategory, setFormCategory] = useState("Campus");
  const [formImage, setFormImage] = useState("");
  const [formVideoUrl, setFormVideoUrl] = useState("");
  const [formCaption, setFormCaption] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const fileInputRef = useRef(null);

  const handleOpenAdd = (defaultType = "image") => {
    setEditingItem(null);
    setFormMediaType(defaultType === "video" ? "video" : "image");
    setFormTitle("");
    setFormCategory(defaultType === "video" ? "Events" : "Campus");
    setFormImage("");
    setFormVideoUrl("");
    setFormCaption("");
    setUploadError("");
    setModalOpen(true);
  };

  const handleOpenEdit = (item) => {
    const isVid = item.mediaType === "video" || Boolean(item.videoUrl || item.youtubeId);
    setEditingItem(item);
    setFormMediaType(isVid ? "video" : "image");
    setFormTitle(item.title || "");
    setFormCategory(item.category || "Campus");
    setFormImage(item.image || "");
    setFormVideoUrl(item.videoUrl || (item.youtubeId ? `https://www.youtube.com/embed/${item.youtubeId}` : ""));
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

    if (formMediaType === "video") {
      const ytId = extractYouTubeId(formVideoUrl);
      if (!ytId) {
        setUploadError("Please enter a valid YouTube video URL or embed link (e.g. https://www.youtube.com/watch?v=... or https://youtu.be/...).");
        return;
      }
      const embedUrl = `https://www.youtube.com/embed/${ytId}`;
      const thumbUrl = `https://img.youtube.com/vi/${ytId}/hqdefault.jpg`;
      const payload = {
        title: formTitle.trim(),
        category: formCategory,
        mediaType: "video",
        videoUrl: embedUrl,
        youtubeId: ytId,
        image: thumbUrl,
        caption: formCaption.trim(),
      };
      if (editingItem) {
        const editId = editingItem.id || editingItem._id;
        await updateGalleryItem(editId, payload);
      } else {
        await addGalleryItem(payload);
      }
      setSelectedCategory("Videos");
      setModalOpen(false);
      return;
    }

    if (!formImage) {
      setUploadError("Please select and upload a photograph from your device.");
      return;
    }

    const payload = {
      title: formTitle.trim(),
      category: formCategory,
      mediaType: "image",
      videoUrl: "",
      youtubeId: "",
      image: formImage,
      caption: formCaption.trim(),
    };

    if (editingItem) {
      const editId = editingItem.id || editingItem._id;
      await updateGalleryItem(editId, payload);
    } else {
      await addGalleryItem(payload);
    }

    if (selectedCategory === "Videos") {
      setSelectedCategory("All");
    }
    setModalOpen(false);
  };

  const handleDelete = async (item) => {
    const itemId = item.id || item._id;
    const isVid = item.mediaType === "video" || Boolean(item.videoUrl || item.youtubeId);
    const confirmed = await confirm({
      title: isVid ? "Delete Video?" : "Delete Photograph?",
      message: isVid
        ? "Are you sure you want to remove this YouTube video from the school gallery?"
        : "Are you sure you want to permanently remove this photo from the school photo gallery? Any uploaded file will also be deleted from disk. This action cannot be undone.",
      itemName: item.title,
      confirmText: "Yes, Delete",
      cancelText: "Cancel",
      variant: "danger",
    });
    if (confirmed) {
      await deleteGalleryItem(itemId);
    }
  };

  const isVideoItem = (item) =>
    item.mediaType === "video" || Boolean(item.videoUrl || item.youtubeId);

  const photoItems = gallery.filter((item) => !isVideoItem(item));
  const videoItems = gallery.filter((item) => isVideoItem(item));

  const filteredItems = gallery.filter((item) => {
    const isVid = isVideoItem(item);
    const matchesCategory =
      selectedCategory === "Videos"
        ? isVid
        : !isVid && (selectedCategory === "All" || item.category === selectedCategory);
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

  const previewYtId = formMediaType === "video" ? extractYouTubeId(formVideoUrl) : "";

  return (
    <div className={styles.galleryWrapper}>
      {/* Header */}
      <div className={styles.headerSection}>
        <div className={styles.headerTitle}>
          <h2>School Photo & Video Gallery Manager</h2>
          <p>
            Upload campus photographs or add YouTube embedded videos to showcase live on the public Gallery page.
          </p>
        </div>
        <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
          <button
            type="button"
            className={styles.addBtn}
            style={{ background: "#dc2626" }}
            onClick={() => handleOpenAdd("video")}
          >
            <Video size={18} />
            <span>Add YouTube Video</span>
          </button>
          <button
            type="button"
            className={styles.addBtn}
            onClick={() => handleOpenAdd("image")}
          >
            <Plus size={18} />
            <span>Add New Photo</span>
          </button>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className={styles.filterBar}>
        <div className={styles.categoryPills}>
          {[
            ...GALLERY_CATEGORIES.map((cat) => ({
              id: cat,
              label: cat,
              count:
                cat === "All"
                  ? photoItems.length
                  : photoItems.filter((i) => i.category === cat).length,
            })),
            { id: "Videos", label: "Video Gallery", count: videoItems.length },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              className={`${styles.categoryBtn} ${
                selectedCategory === tab.id
                  ? `${styles.categoryBtnActive} ${styles[`catBtnActive_${tab.id.toLowerCase()}`] || ""}`
                  : ""
              }`}
              onClick={() => setSelectedCategory(tab.id)}
            >
              {tab.label}
              <span className={styles.categoryCountBadge}>{tab.count}</span>
            </button>
          ))}
        </div>

        <div className={styles.searchWrapper}>
          <Search size={16} className={styles.searchIcon} />
          <input
            type="text"
            placeholder="Search photos & videos..."
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
              const isVid = item.mediaType === "video" || Boolean(item.videoUrl || item.youtubeId);
              return (
                <div key={itemId} className={styles.photoCard}>
                  <div className={styles.imageContainer}>
                    <ShimmerImage
                      src={item.image || (item.youtubeId ? `https://img.youtube.com/vi/${item.youtubeId}/hqdefault.jpg` : "/images/dance-&-cultural-fest.webp")}
                      alt={item.title}
                      className={styles.photoImg}
                      loading="lazy"
                      fallbackSrc="/images/dance-&-cultural-fest.webp"
                    />
                    <span className={`${styles.badgeCategory} ${getCategoryClass(item.category)}`}>
                      {item.category || "Campus"}
                    </span>
                    {isVid && (
                      <span
                        style={{
                          position: "absolute",
                          top: "10px",
                          right: "10px",
                          background: "#dc2626",
                          color: "#ffffff",
                          padding: "4px 10px",
                          borderRadius: "999px",
                          fontSize: "0.72rem",
                          fontWeight: 700,
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "5px",
                          boxShadow: "0 4px 10px rgba(0,0,0,0.3)",
                        }}
                      >
                        <Play size={11} fill="#ffffff" /> VIDEO
                      </span>
                    )}
                  </div>
                  <div className={styles.cardBody}>
                    <h4 className={styles.photoTitle}>{item.title}</h4>
                    <p className={styles.photoCaption}>
                      {item.caption || (isVid ? "YouTube Embedded Video" : "No description provided.")}
                    </p>
                    <div className={styles.cardActions}>
                      <button
                        type="button"
                        className={styles.editBtn}
                        onClick={() => handleOpenEdit(item)}
                        title={isVid ? "Edit Video Info" : "Edit Photo Info"}
                      >
                        <Edit2 size={14} />
                        <span>Edit</span>
                      </button>
                      <button
                        type="button"
                        className={styles.deleteBtn}
                        onClick={() => handleDelete(item)}
                        title={isVid ? "Delete Video" : "Delete Photo"}
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
                  Showing <strong>{displayedItems.length}</strong> of <strong>{filteredItems.length}</strong> media items
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
                      <span>Loading Media...</span>
                    </>
                  ) : (
                    <>
                      <Plus size={16} />
                      <span>Load More Media</span>
                      <span className={styles.remainingPill}>
                        +{Math.min(PAGE_SIZE, remainingCount)}
                      </span>
                    </>
                  )}
                </button>
              ) : (
                <div className={styles.allLoadedText}>
                  <CheckCircle size={15} color="#10b981" />
                  <span>All {filteredItems.length} gallery items loaded</span>
                </div>
              )}
            </div>
          )}
        </>
      ) : (
        <EmptyState
          icon={selectedCategory === "Videos" ? Video : ImageIcon}
          title={selectedCategory === "Videos" ? "No YouTube Videos Added Yet" : "No Gallery Items Found"}
          description={
            searchTerm
              ? "No items match your search query. Try clearing the search box."
              : selectedCategory === "Videos"
              ? "Add a YouTube embedded video link to display in the public Video Gallery section."
              : selectedCategory !== "All"
              ? `No items found in "${selectedCategory}". Pick another category or add new media.`
              : "No gallery photographs or videos uploaded yet. Click above to add your first photo or video."
          }
          actionText={selectedCategory === "Videos" ? "Add YouTube Video" : "Add New Photo"}
          onAction={() => handleOpenAdd(selectedCategory === "Videos" ? "video" : "image")}
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
                <h3>
                  {editingItem
                    ? formMediaType === "video"
                      ? "Edit YouTube Video"
                      : "Edit Photograph"
                    : formMediaType === "video"
                    ? "Add YouTube Embedded Video"
                    : "Upload New Photograph"}
                </h3>
                <p style={{ fontSize: "0.82rem", color: "#64748b", margin: 0 }}>
                  {formMediaType === "video"
                    ? "Paste any YouTube video link or embed URL to showcase in the Gallery Video Section."
                    : "Upload high-resolution event, campus, or laboratory pictures."}
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
              {/* Media Type Toggle: Photo vs YouTube Video */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                <button
                  type="button"
                  onClick={() => {
                    setFormMediaType("image");
                    setUploadError("");
                  }}
                  style={{
                    padding: "10px 12px",
                    borderRadius: "8px",
                    border: formMediaType === "image" ? "2px solid #2563eb" : "1px solid #cbd5e1",
                    background: formMediaType === "image" ? "#eff6ff" : "#f8fafc",
                    color: formMediaType === "image" ? "#1d4ed8" : "#475569",
                    fontWeight: 700,
                    fontSize: "0.85rem",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "8px",
                    cursor: "pointer",
                  }}
                >
                  <ImageIcon size={16} />
                  <span>Photograph Upload</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setFormMediaType("video");
                    setUploadError("");
                  }}
                  style={{
                    padding: "10px 12px",
                    borderRadius: "8px",
                    border: formMediaType === "video" ? "2px solid #dc2626" : "1px solid #cbd5e1",
                    background: formMediaType === "video" ? "#fef2f2" : "#f8fafc",
                    color: formMediaType === "video" ? "#dc2626" : "#475569",
                    fontWeight: 700,
                    fontSize: "0.85rem",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "8px",
                    cursor: "pointer",
                  }}
                >
                  <Video size={16} />
                  <span>YouTube Video Embed</span>
                </button>
              </div>

              {/* Title */}
              <div className={styles.formGroup}>
                <div className={styles.labelHeader}>
                  <label className={styles.label}>
                    {formMediaType === "video" ? "Video Title *" : "Photo Title *"}
                  </label>
                  <span className={styles.charCount}>{formTitle.length}/90 chars</span>
                </div>
                <input
                  type="text"
                  required
                  maxLength={90}
                  placeholder={
                    formMediaType === "video"
                      ? "e.g., Annual Cultural Fest Dance Performance 2026"
                      : "e.g., Annual Science Exhibition 2026 or Modern Computer Lab"
                  }
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

              {formMediaType === "video" ? (
                <div className={styles.photoUploadSection}>
                  <div className={styles.labelHeader}>
                    <span className={styles.photoHeading}>
                      <Video size={15} /> YouTube Video Embedded Link / URL *
                    </span>
                  </div>
                  <input
                    type="text"
                    required
                    placeholder="Paste YouTube link (e.g. https://www.youtube.com/watch?v=... or https://www.youtube.com/embed/...)"
                    value={formVideoUrl}
                    onChange={(e) => {
                      setFormVideoUrl(e.target.value);
                      setUploadError("");
                    }}
                    className={styles.input}
                  />
                  <span style={{ fontSize: "0.76rem", color: "#64748b" }}>
                    Supports standard YouTube URLs, youtu.be share links, YouTube Shorts, or full &lt;iframe&gt; embed codes.
                  </span>

                  {previewYtId && (
                    <div
                      style={{
                        marginTop: "10px",
                        borderRadius: "10px",
                        overflow: "hidden",
                        border: "1px solid #cbd5e1",
                        background: "#0f172a",
                        aspectRatio: "16 / 9",
                      }}
                    >
                      <iframe
                        src={`https://www.youtube.com/embed/${previewYtId}`}
                        title="YouTube video preview"
                        style={{ width: "100%", height: "100%", border: 0 }}
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                      />
                    </div>
                  )}

                  {uploadError && (
                    <div className={styles.errorAlert}>
                      <AlertCircle size={15} />
                      <span>{uploadError}</span>
                    </div>
                  )}
                </div>
              ) : (
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
              )}

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
                  {editingItem
                    ? formMediaType === "video"
                      ? "Update Video"
                      : "Update Photo"
                    : formMediaType === "video"
                    ? "Add Video to Gallery"
                    : "Add Photo to Gallery"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
