import { useState, useEffect, useRef, useCallback } from "react";
import { ChevronLeft, ChevronRight, Sparkles } from "lucide-react";
import { AnimatePresence, m } from "framer-motion";
import styles from "./HeroSlider.module.css";
import { easeCalm } from "@/lib/motion/easing";
import { useData } from "@/context/DataContext";
import { DEFAULT_HERO_SLIDES } from "@/data/sliderData";

export default function HeroSlider() {
  const { schoolInfo } = useData();
  const slides =
    Array.isArray(schoolInfo?.heroSlides) && schoolInfo.heroSlides.length > 0
      ? schoolInfo.heroSlides
      : DEFAULT_HERO_SLIDES;

  const [current, setCurrent] = useState(0);
  const [direction, setDirection] = useState(1);
  const [isPaused, setIsPaused] = useState(false);
  const touchStartX = useRef(0);
  const touchEndX = useRef(0);

  // Clamp current index if slides length changes
  useEffect(() => {
    if (current >= slides.length) {
      setCurrent(0);
    }
  }, [slides.length, current]);

  const paginate = useCallback(
    (newDirection) => {
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

  // Auto-play timer (5s)
  useEffect(() => {
    if (isPaused) return;
    const interval = setInterval(() => {
      paginate(1);
    }, 5000);
    return () => clearInterval(interval);
  }, [isPaused, paginate]);

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

  const activeSlide = slides[current] || slides[0];

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
        <AnimatePresence initial={false} custom={direction}>
          {activeSlide && (
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
                src={activeSlide.image || "/images/glorious-public-school.png"}
                alt={activeSlide.title || "School Campus"}
                className={styles.slideImage}
                onError={(e) => {
                  e.target.src = "/images/glorious-public-school.png";
                }}
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
          )}
        </AnimatePresence>
      </div>

      {/* Manual Arrow Controls */}
      <button
        type="button"
        onClick={() => paginate(-1)}
        className={`${styles.navBtn} ${styles.prevBtn}`}
        aria-label="Previous slide"
      >
        <ChevronLeft size={22} />
      </button>

      <button
        type="button"
        onClick={() => paginate(1)}
        className={`${styles.navBtn} ${styles.nextBtn}`}
        aria-label="Next slide"
      >
        <ChevronRight size={22} />
      </button>

      {/* Indicator Dots */}
      <div className={styles.dotsWrapper}>
        {slides.map((slide, idx) => (
          <button
            key={slide.id || idx}
            type="button"
            onClick={() => {
              setDirection(idx > current ? 1 : -1);
              setCurrent(idx);
            }}
            className={`${styles.dot} ${idx === current ? styles.activeDot : ""}`}
            aria-label={`Go to slide ${idx + 1}: ${slide.tag || "Slide"}`}
          />
        ))}
      </div>
    </div>
  );
}
