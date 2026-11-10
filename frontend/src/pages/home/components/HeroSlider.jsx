import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { ChevronLeft, ChevronRight, Sparkles } from "lucide-react";
import { AnimatePresence, m } from "framer-motion";
import styles from "./HeroSlider.module.css";
import { easeCalm } from "@/lib/motion/easing";
import { useData } from "@/context/DataContext";
import { DEFAULT_HERO_SLIDES } from "@/data/sliderData";

const FALLBACK_HERO_IMG = "/images/glorious-public-school.png";

export default function HeroSlider() {
  const { schoolInfo, loading } = useData();
  const slides = useMemo(() => {
    return Array.isArray(schoolInfo?.heroSlides) && schoolInfo.heroSlides.length > 0
      ? schoolInfo.heroSlides
      : DEFAULT_HERO_SLIDES;
  }, [schoolInfo?.heroSlides]);

  const [current, setCurrent] = useState(0);
  const [direction, setDirection] = useState(1);
  const [isPaused, setIsPaused] = useState(false);
  const [loadedMap, setLoadedMap] = useState({});

  const touchStartX = useRef(0);
  const touchEndX = useRef(0);
  const imgRef = useRef(null);
  const lastPaginateTime = useRef(0);
  const preloadedSetRef = useRef(new Set());
  const failedUrlsRef = useRef(new Set());

  // Clamp current index if slides length changes
  useEffect(() => {
    if (current >= slides.length) {
      setCurrent(0);
    }
  }, [slides.length, current]);

  // Pre-warm all slide images ONCE to eliminate network delays on next/prev
  useEffect(() => {
    if (loading || !Array.isArray(slides)) return;

    slides.forEach((s) => {
      const url = s?.image;
      if (url && !preloadedSetRef.current.has(url)) {
        preloadedSetRef.current.add(url);
        const img = new Image();
        img.src = url;
        img.onload = () => {
          setLoadedMap((prev) => (prev[url] ? prev : { ...prev, [url]: true }));
        };
        img.onerror = () => {
          failedUrlsRef.current.add(url);
          setLoadedMap((prev) => (prev[url] ? prev : { ...prev, [url]: "failed" }));
        };
      }
    });
  }, [loading, slides]);

  // Throttled paginate to prevent rapid spam clicking and duplicate transitions
  const paginate = useCallback(
    (newDirection) => {
      const now = Date.now();
      if (now - lastPaginateTime.current < 260) {
        return; // Ignore spam clicks within 260ms
      }
      lastPaginateTime.current = now;

      setDirection(newDirection);
      setCurrent((prev) => {
        let nextIndex = prev + newDirection;
        if (nextIndex < 0) return slides.length - 1;
        if (nextIndex >= slides.length) return 0;
        return nextIndex;
      });
    },
    [slides.length]
  );

  // Auto-play timer (5s) — only advance once initial data is loaded and not paused
  useEffect(() => {
    if (isPaused || loading) return;
    const interval = setInterval(() => {
      paginate(1);
    }, 5000);
    return () => clearInterval(interval);
  }, [isPaused, loading, paginate]);

  const activeSlide = !loading ? slides[current] || slides[0] : null;
  const rawSrc = activeSlide?.image || FALLBACK_HERO_IMG;
  // If known to be failed or missing, immediately use the fallback image without issuing a network request
  const activeSrc = failedUrlsRef.current.has(rawSrc) ? FALLBACK_HERO_IMG : rawSrc;
  const isImageReady = !loading && Boolean(loadedMap[activeSrc]);

  // Check if browser already has this image cached in memory
  useEffect(() => {
    if (!loading && imgRef.current && imgRef.current.complete && imgRef.current.naturalWidth > 0) {
      setLoadedMap((prev) => (prev[activeSrc] ? prev : { ...prev, [activeSrc]: true }));
    }
  }, [loading, activeSrc]);

  const markLoaded = (src) => {
    if (!src) return;
    setLoadedMap((prev) => (prev[src] === true ? prev : { ...prev, [src]: true }));
  };

  const handleImageError = (failedSrc, e) => {
    failedUrlsRef.current.add(failedSrc);
    setLoadedMap((prev) => ({ ...prev, [failedSrc]: "failed" }));
    if (e?.currentTarget && !e.currentTarget.src.endsWith(FALLBACK_HERO_IMG)) {
      e.currentTarget.src = FALLBACK_HERO_IMG;
    }
  };

  // Touch handlers for mobile swipe
  const handleTouchStart = (e) => {
    touchStartX.current = e.touches[0].clientX;
    setIsPaused(true);
  };

  const handleTouchEnd = (e) => {
    touchEndX.current = e.changedTouches[0].clientX;
    const diff = touchStartX.current - touchEndX.current;
    if (diff > 50) {
      paginate(1); // Swipe left -> next
    } else if (diff < -50) {
      paginate(-1); // Swipe right -> prev
    }
    setIsPaused(false);
  };

  const slideVariants = {
    enter: (dir) => ({
      x: dir > 0 ? "100%" : "-100%",
      opacity: 0,
      scale: 1.02,
    }),
    center: {
      x: 0,
      opacity: 1,
      scale: 1,
      transition: {
        x: { type: "spring", stiffness: 280, damping: 28 },
        opacity: { duration: 0.35, ease: easeCalm },
      },
    },
    exit: (dir) => ({
      x: dir > 0 ? "-100%" : "100%",
      opacity: 0,
      scale: 0.98,
      transition: {
        x: { type: "spring", stiffness: 280, damping: 28 },
        opacity: { duration: 0.3, ease: easeCalm },
      },
    }),
  };

  return (
    <div
      className={styles.sliderContainer}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      role="region"
      aria-label="School Campus Visual Showcase"
    >
      {/* Slider Viewport */}
      <div className={styles.viewport}>
        {/* Shimmer Skeleton shown while initial data is fetching OR image is preparing */}
        <div
          className={`${styles.shimmerOverlay} ${isImageReady ? styles.shimmerHidden : ""}`}
          aria-hidden="true"
        >
          <div className={styles.shimmerWave} />
          <div className={styles.shimmerCardSkeleton}>
            <div className={styles.shimmerTagBar} />
            <div className={styles.shimmerTitleBar} />
            <div className={styles.shimmerCaptionBar} />
          </div>
        </div>

        {!loading && activeSlide && (
          <AnimatePresence initial={false} custom={direction}>
            <m.div
              key={activeSlide.id || activeSlide.image || current}
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              className={styles.slide}
            >
              <img
                ref={imgRef}
                src={activeSrc}
                alt={activeSlide.title || "Glorious Public School Campus"}
                className={`${styles.slideImage} ${
                  isImageReady ? styles.slideImageLoaded : styles.slideImageLoading
                }`}
                loading="eager"
                decoding="async"
                onLoad={() => markLoaded(activeSrc)}
                onError={(e) => handleImageError(activeSrc, e)}
              />
              <div className={styles.gradientScrim} />

              {/* Minimal floating caption card */}
              <div className={styles.captionCard}>
                {activeSlide.tag && (
                  <div className={styles.tagBadge}>
                    <Sparkles size={13} />
                    <span>{activeSlide.tag}</span>
                  </div>
                )}
                {activeSlide.title && <h3 className={styles.slideTitle}>{activeSlide.title}</h3>}
                {activeSlide.caption && <p className={styles.slideCaption}>{activeSlide.caption}</p>}
              </div>
            </m.div>
          </AnimatePresence>
        )}
      </div>

      {/* Manual Arrow Controls */}
      <button
        type="button"
        onClick={() => paginate(-1)}
        className={`${styles.navBtn} ${styles.prevBtn}`}
        aria-label="Previous slide"
        disabled={loading}
      >
        <ChevronLeft size={22} />
      </button>

      <button
        type="button"
        onClick={() => paginate(1)}
        className={`${styles.navBtn} ${styles.nextBtn}`}
        aria-label="Next slide"
        disabled={loading}
      >
        <ChevronRight size={22} />
      </button>

      {/* Indicator Dots */}
      {!loading && (
        <div className={styles.dotsWrapper}>
          {slides.map((slide, idx) => (
            <button
              key={slide.id || idx}
              type="button"
              onClick={() => {
                if (idx === current) return;
                setDirection(idx > current ? 1 : -1);
                setCurrent(idx);
              }}
              className={`${styles.dot} ${idx === current ? styles.activeDot : ""}`}
              aria-label={`Go to slide ${idx + 1}: ${slide.tag || "Slide"}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
