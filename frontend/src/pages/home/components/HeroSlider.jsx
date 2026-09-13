import { useState, useEffect, useRef, useCallback } from "react";
import { ChevronLeft, ChevronRight, Sparkles } from "lucide-react";
import { AnimatePresence, m } from "framer-motion";
import styles from "./HeroSlider.module.css";
import { easeCalm } from "@/lib/motion/easing";

const SLIDES = [
  {
    id: "campus",
    image: "/images/hero_meditation.png",
    tag: "Campus & Assembly",
    title: "Vibrant Campus Grounds & Morning Assemblies",
    caption: "Instilling discipline, community spirit, and moral focus every morning.",
  },
  {
    id: "classrooms",
    image: "/images/expert_guidance.png",
    tag: "Smart Classrooms",
    title: "Interactive Classrooms & Dedicated Mentorship",
    caption: "Nurturing creative curiosity, individual attention, and lifelong love for learning.",
  },
  {
    id: "labs",
    image: "/images/how_we_work.png",
    tag: "Science & IT Labs",
    title: "Modern Practical Labs & Digital Education",
    caption: "Hands-on science experiments and foundational computer literacy.",
  },
  {
    id: "sports",
    image: "/images/blog3.png",
    tag: "Athletics & Fitness",
    title: "Sports Tournaments & Physical Excellence",
    caption: "Encouraging sportsmanship, athletic agility, and healthy teamwork.",
  },
  {
    id: "culture",
    image: "/images/blog1.png",
    tag: "Arts & Culture",
    title: "Annual Celebrations & Stage Confidence",
    caption: "Fostering cultural heritage, music, drama, and expressive leadership.",
  },
];

export default function HeroSlider() {
  const [current, setCurrent] = useState(0);
  const [direction, setDirection] = useState(1);
  const [isPaused, setIsPaused] = useState(false);
  const touchStartX = useRef(0);
  const touchEndX = useRef(0);

  const paginate = useCallback((newDirection) => {
    setDirection(newDirection);
    setCurrent((prev) => {
      let nextIndex = prev + newDirection;
      if (nextIndex < 0) return SLIDES.length - 1;
      if (nextIndex >= SLIDES.length) return 0;
      return nextIndex;
    });
  }, []);

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

  const activeSlide = SLIDES[current];

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
          <m.div
            key={activeSlide.id}
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            className={styles.slide}
          >
            <img
              src={activeSlide.image}
              alt={activeSlide.title}
              className={styles.slideImage}
            />
            <div className={styles.gradientScrim} />

            {/* Minimal floating caption card */}
            <div className={styles.captionCard}>
              <div className={styles.tagBadge}>
                <Sparkles size={13} />
                <span>{activeSlide.tag}</span>
              </div>
              <h3 className={styles.slideTitle}>{activeSlide.title}</h3>
              <p className={styles.slideCaption}>{activeSlide.caption}</p>
            </div>
          </m.div>
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
        {SLIDES.map((slide, idx) => (
          <button
            key={slide.id}
            type="button"
            onClick={() => {
              setDirection(idx > current ? 1 : -1);
              setCurrent(idx);
            }}
            className={`${styles.dot} ${idx === current ? styles.activeDot : ""}`}
            aria-label={`Go to slide ${idx + 1}: ${slide.tag}`}
          />
        ))}
      </div>
    </div>
  );
}
