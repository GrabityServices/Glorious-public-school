import { useState, useEffect, useRef, useCallback } from "react";
import { 
  Image as ImageIcon, 
  X, 
  Maximize2, 
  ChevronLeft, 
  ChevronRight, 
  Images, 
  ChevronUp, 
  ChevronDown, 
  Download, 
  Plus,
  Loader2,
  CheckCircle
} from "lucide-react";
import { AnimatePresence, m } from "framer-motion";
import styles from "./gallery.module.css";
import FadeUp from "@/components/motion/FadeUp";
import Image from "@/components/common/Image";
import ShimmerImage from "@/components/common/ShimmerImage";
import useDocumentTitle from "@/hooks/useDocumentTitle";
import { useData } from "@/context/DataContext";
import { GALLERY_CATEGORIES } from "@/data/galleryData";
import EmptyState from "@/components/common/EmptyState";

const PAGE_SIZE = 12;

export default function GalleryPage() {
  useDocumentTitle("Photo Gallery | Glorious Public School, Jhajha");
  const { gallery, loading } = useData();
  const [activeCategory, setActiveCategory] = useState("All");
  
  // Pagination / Load More state
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  // Lightbox Modal State
  const [activeModalIndex, setActiveModalIndex] = useState(null);
  const [slideDirection, setSlideDirection] = useState(1);
  const [showMoreImages, setShowMoreImages] = useState(true);
  const [moreImagesScope, setMoreImagesScope] = useState("album"); // "album" or "all"

  const thumbnailReelRef = useRef(null);
  const activeThumbnailRef = useRef(null);

  const galleryList = gallery || [];

  const filteredItems =
    activeCategory === "All"
      ? galleryList
      : galleryList.filter((item) => item.category === activeCategory);

  // Reset pagination when category changes
  useEffect(() => {
    setVisibleCount(PAGE_SIZE);
  }, [activeCategory]);

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

  // Active list shown inside the modal (either current album or all photos)
  const activeModalList = moreImagesScope === "all" ? galleryList : filteredItems;
  const currentItem = activeModalIndex !== null ? activeModalList[activeModalIndex] : null;

  // Next & Previous Navigation Handlers
  const handleNext = useCallback(() => {
    if (!activeModalList.length) return;
    setSlideDirection(1);
    setActiveModalIndex((prev) => (prev + 1) % activeModalList.length);
  }, [activeModalList.length]);

  const handlePrev = useCallback(() => {
    if (!activeModalList.length) return;
    setSlideDirection(-1);
    setActiveModalIndex((prev) => (prev - 1 + activeModalList.length) % activeModalList.length);
  }, [activeModalList.length]);

  const handleSelectImage = useCallback((idx) => {
    if (idx === activeModalIndex) return;
    setSlideDirection(idx > activeModalIndex ? 1 : -1);
    setActiveModalIndex(idx);
  }, [activeModalIndex]);

  const openModal = (item) => {
    // Determine index in active category view
    const idx = filteredItems.findIndex((i) => (i.id || i._id) === (item.id || item._id));
    setMoreImagesScope("album");
    setSlideDirection(1);
    setActiveModalIndex(idx >= 0 ? idx : 0);
    setShowMoreImages(true);
  };

  const closeModal = () => {
    setActiveModalIndex(null);
  };

  // Keyboard Navigation: Left, Right, Escape
  useEffect(() => {
    if (activeModalIndex === null) return;

    const handleKeyDown = (e) => {
      if (e.key === "ArrowRight") {
        e.preventDefault();
        handleNext();
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        handlePrev();
      } else if (e.key === "Escape") {
        e.preventDefault();
        closeModal();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = originalOverflow;
    };
  }, [activeModalIndex, handleNext, handlePrev]);

  // Auto-scroll active thumbnail into view
  useEffect(() => {
    if (activeModalIndex !== null && activeThumbnailRef.current) {
      activeThumbnailRef.current.scrollIntoView({
        behavior: "smooth",
        inline: "center",
        block: "nearest",
      });
    }
  }, [activeModalIndex, showMoreImages, moreImagesScope]);

  // Thumbnail Reel Scroll buttons
  const scrollThumbnails = (direction) => {
    if (thumbnailReelRef.current) {
      const scrollAmount = direction === "left" ? -240 : 240;
      thumbnailReelRef.current.scrollBy({ left: scrollAmount, behavior: "smooth" });
    }
  };

  // Drag swipe gesture handler
  const handleDragEnd = (event, info) => {
    const swipeThreshold = 50;
    if (info.offset.x > swipeThreshold || info.velocity.x > 400) {
      handlePrev();
    } else if (info.offset.x < -swipeThreshold || info.velocity.x < -400) {
      handleNext();
    }
  };

  // Framer motion variants for directional slide
  const slideVariants = {
    enter: (direction) => ({
      x: direction > 0 ? 60 : -60,
      opacity: 0,
      scale: 0.98,
    }),
    center: {
      x: 0,
      opacity: 1,
      scale: 1,
      transition: {
        x: { type: "spring", stiffness: 350, damping: 30 },
        opacity: { duration: 0.2 },
      },
    },
    exit: (direction) => ({
      x: direction > 0 ? -60 : 60,
      opacity: 0,
      scale: 0.98,
      transition: {
        x: { type: "spring", stiffness: 350, damping: 30 },
        opacity: { duration: 0.18 },
      },
    }),
  };

  return (
    <div className={styles.pageWrapper}>
      {/* Hero Header */}
      <section className={styles.heroHeader}>
        <div className={styles.container}>
          <FadeUp>
            <span className="section-subtitle">Moments & Memories</span>
            <h1 className={styles.title}>School Photo Gallery</h1>
            <p className={styles.subtitle}>
              Glimpses of daily campus life, celebrations, Jhajha Town Hall dance competitions, athletics, and laboratory discoveries.
            </p>
          </FadeUp>
        </div>
      </section>

      {/* Gallery Section */}
      <section className={styles.section}>
        <div className={styles.container}>
          {/* Category Tabs */}
          <div className={styles.categoryTabs}>
            {GALLERY_CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`${styles.tabBtn} ${
                  activeCategory === cat ? styles.tabBtnActive : ""
                }`}
              >
                {cat}
                <span className={styles.tabBadge}>
                  {cat === "All"
                    ? galleryList.length
                    : galleryList.filter((i) => i.category === cat).length}
                </span>
              </button>
            ))}
          </div>

          {/* Loading Shimmer Skeletons, Grid of Images, or Empty State */}
          {loading ? (
            <div className={styles.galleryGrid}>
              {Array.from({ length: 8 }).map((_, idx) => (
                <div key={idx} className={styles.skeletonCard}>
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
                  </div>
                </div>
              ))}
            </div>
          ) : filteredItems.length > 0 ? (
            <>
              <div className={styles.galleryGrid}>
                {displayedItems.map((item, idx) => (
                  <FadeUp key={item.id || item._id || idx} delay={0.04 * (idx % 6 + 1)}>
                    <div
                      className={styles.galleryCard}
                      onClick={() => openModal(item)}
                      role="button"
                      tabIndex={0}
                      onKeyDown={(e) => e.key === "Enter" && openModal(item)}
                    >
                      <div className={styles.imageWrap}>
                        <Image
                          src={item.image}
                          alt={item.title}
                          className={styles.img}
                          loading="lazy"
                        />
                        <div className={styles.overlay}>
                          <span className={styles.cardCat}>{item.category}</span>
                          <h3 className={styles.cardTitle}>{item.title}</h3>
                          <div className={styles.cardActions}>
                            <span className={styles.viewBadge}>
                              <Maximize2 size={15} />
                              <span>View Photo</span>
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className={styles.captionArea}>
                        <p>{item.caption || "Click to view full photo and album."}</p>
                      </div>
                    </div>
                  </FadeUp>
                ))}

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
                          <Loader2 size={18} className={styles.spin} />
                          <span>Loading More Photos...</span>
                        </>
                      ) : (
                        <>
                          <Plus size={18} />
                          <span>Load More Photos</span>
                          <span className={styles.remainingPill}>
                            +{Math.min(PAGE_SIZE, remainingCount)}
                          </span>
                        </>
                      )}
                    </button>
                  ) : (
                    <div className={styles.allLoadedText}>
                      <CheckCircle size={16} color="#059669" />
                      <span>All {filteredItems.length} photographs loaded</span>
                    </div>
                  )}
                </div>
              )}
            </>
          ) : (
            <FadeUp>
              <EmptyState
                icon={ImageIcon}
                title="No Photos Found"
                description={
                  activeCategory === "All"
                    ? "There are currently no photos uploaded to the gallery. Please check back later."
                    : `No photos currently available in the "${activeCategory}" album. Try selecting another album.`
                }
                actionText={activeCategory !== "All" ? "View All Photos" : undefined}
                onAction={activeCategory !== "All" ? () => setActiveCategory("All") : undefined}
              />
            </FadeUp>
          )}
        </div>
      </section>

      {/* Advanced Lightbox Modal with Next/Prev and "More Images" Strip */}
      <AnimatePresence>
        {activeModalIndex !== null && currentItem && (
          <m.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className={styles.modalOverlay}
            onClick={closeModal}
            data-lenis-prevent="true"
          >
            <m.div
              initial={{ scale: 0.95, opacity: 0, y: 15 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 15 }}
              transition={{ type: "spring", duration: 0.35 }}
              className={styles.modalContent}
              onClick={(e) => e.stopPropagation()}
              data-lenis-prevent="true"
            >
              {/* Top Navigation & Toolbar Bar */}
              <div className={styles.modalHeader}>
                <div className={styles.modalHeaderLeft}>
                  <span className={styles.modalCatBadge}>
                    <span className={styles.catDot} />
                    {currentItem.category}
                  </span>
                  <span className={styles.modalCounter}>
                    Photo <strong>{activeModalIndex + 1}</strong> of <strong>{activeModalList.length}</strong>
                  </span>
                </div>

                <div className={styles.modalHeaderRight}>
                  {/* More Images Toggle Button */}
                  <button
                    type="button"
                    className={`${styles.toolbarBtn} ${showMoreImages ? styles.toolbarBtnActive : ""}`}
                    onClick={() => setShowMoreImages((prev) => !prev)}
                    title={showMoreImages ? "Hide More Images Tray" : "Open More Images Tray"}
                  >
                    <Images size={16} />
                    <span className={styles.toolbarBtnLabel}>More Images ({activeModalList.length})</span>
                    {showMoreImages ? <ChevronDown size={15} /> : <ChevronUp size={15} />}
                  </button>

                  {/* Direct Image Download / View */}
                  {currentItem.image && (
                    <a
                      href={currentItem.image}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={styles.toolbarIconBtn}
                      title="Open full-resolution photo"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <Download size={17} />
                    </a>
                  )}

                  {/* Close Lightbox */}
                  <button
                    type="button"
                    className={styles.modalCloseBtn}
                    onClick={closeModal}
                    title="Close gallery viewer (Esc)"
                  >
                    <X size={20} />
                  </button>
                </div>
              </div>

              {/* Main Image Stage with Next & Prev Controls */}
              <div className={styles.stageArea}>
                {/* Previous Image Button */}
                <button
                  type="button"
                  className={`${styles.navArrow} ${styles.navArrowPrev}`}
                  onClick={handlePrev}
                  title="Previous Photo (Left Arrow)"
                  aria-label="Previous Photo"
                >
                  <ChevronLeft size={28} />
                </button>

                {/* Animated Image Canvas */}
                <div className={styles.imageCanvas}>
                  <AnimatePresence initial={false} custom={slideDirection} mode="wait">
                    <m.div
                      key={activeModalIndex}
                      custom={slideDirection}
                      variants={slideVariants}
                      initial="enter"
                      animate="center"
                      exit="exit"
                      drag="x"
                      dragConstraints={{ left: 0, right: 0 }}
                      dragElastic={0.2}
                      onDragEnd={handleDragEnd}
                      className={styles.imageMotionWrap}
                    >
                      <ShimmerImage
                        src={currentItem.image}
                        alt={currentItem.title}
                        className={styles.stageImg}
                        theme="dark"
                        showIcon={true}
                        loading="eager"
                        fallbackSrc="/images/dance-&-cultural-fest.webp"
                      />
                    </m.div>
                  </AnimatePresence>
                </div>

                {/* Next Image Button */}
                <button
                  type="button"
                  className={`${styles.navArrow} ${styles.navArrowNext}`}
                  onClick={handleNext}
                  title="Next Photo (Right Arrow)"
                  aria-label="Next Photo"
                >
                  <ChevronRight size={28} />
                </button>
              </div>

              {/* Photo Caption & Information */}
              <div className={styles.infoArea}>
                <div className={styles.infoText}>
                  <h3 className={styles.photoTitle}>{currentItem.title}</h3>
                  {currentItem.caption && (
                    <p className={styles.photoCaption}>{currentItem.caption}</p>
                  )}
                </div>
                <div className={styles.keyboardTip}>
                  <span><strong>←</strong> <strong>→</strong> keys to navigate • <strong>Esc</strong> to close</span>
                </div>
              </div>

              {/* Collapsible "More Images" Interactive Drawer / Reel */}
              <AnimatePresence>
                {showMoreImages && (
                  <m.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.28, ease: "easeInOut" }}
                    className={styles.moreImagesTray}
                  >
                    <div className={styles.trayHeader}>
                      <div className={styles.trayTitle}>
                        <Images size={14} />
                        <span>Browse Gallery</span>
                      </div>

                      {/* Scope Switcher: Current Category Album vs All Gallery */}
                      <div className={styles.scopeTabs}>
                        <button
                          type="button"
                          className={`${styles.scopeTab} ${moreImagesScope === "album" ? styles.scopeTabActive : ""}`}
                          onClick={() => {
                            setMoreImagesScope("album");
                            const currId = currentItem.id || currentItem._id;
                            const newIdx = filteredItems.findIndex((i) => (i.id || i._id) === currId);
                            setActiveModalIndex(newIdx >= 0 ? newIdx : 0);
                          }}
                        >
                          {activeCategory === "All" ? "All Photos" : `${activeCategory} Album`} ({filteredItems.length})
                        </button>
                        {activeCategory !== "All" && (
                          <button
                            type="button"
                            className={`${styles.scopeTab} ${moreImagesScope === "all" ? styles.scopeTabActive : ""}`}
                            onClick={() => {
                              setMoreImagesScope("all");
                              const currId = currentItem.id || currentItem._id;
                              const newIdx = galleryList.findIndex((i) => (i.id || i._id) === currId);
                              setActiveModalIndex(newIdx >= 0 ? newIdx : 0);
                            }}
                          >
                            All Gallery Photos ({galleryList.length})
                          </button>
                        )}
                      </div>

                      {/* Tray Scroll Arrows */}
                      <div className={styles.trayScrollControls}>
                        <button
                          type="button"
                          onClick={() => scrollThumbnails("left")}
                          className={styles.trayArrowBtn}
                          title="Scroll thumbnails left"
                        >
                          <ChevronLeft size={16} />
                        </button>
                        <button
                          type="button"
                          onClick={() => scrollThumbnails("right")}
                          className={styles.trayArrowBtn}
                          title="Scroll thumbnails right"
                        >
                          <ChevronRight size={16} />
                        </button>
                      </div>
                    </div>

                    {/* Horizontal Thumbnail Strip */}
                    <div className={styles.thumbnailsReel} ref={thumbnailReelRef}>
                      {activeModalList.map((item, idx) => {
                        const isActive = idx === activeModalIndex;
                        return (
                          <div
                            key={item.id || item._id || idx}
                            ref={isActive ? activeThumbnailRef : null}
                            className={`${styles.thumbCard} ${isActive ? styles.thumbCardActive : ""}`}
                            onClick={() => handleSelectImage(idx)}
                            role="button"
                            tabIndex={0}
                            title={`${item.title} (${idx + 1} of ${activeModalList.length})`}
                          >
                            <ShimmerImage
                              src={item.image}
                              alt={item.title}
                              className={styles.thumbImg}
                              loading="lazy"
                              theme="dark"
                              showIcon={false}
                              fallbackSrc="/images/dance-&-cultural-fest.webp"
                            />
                            <div className={styles.thumbIndexBadge}>
                              {idx + 1}
                            </div>
                            {isActive && (
                              <div className={styles.thumbActiveIndicator}>
                                <span>Active</span>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </m.div>
                )}
              </AnimatePresence>
            </m.div>
          </m.div>
        )}
      </AnimatePresence>
    </div>
  );
}
