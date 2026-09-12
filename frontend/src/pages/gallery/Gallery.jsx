import { useState } from "react";
import { Link } from "react-router-dom";
import { Image as ImageIcon, X, Maximize2 } from "lucide-react";
import { AnimatePresence, m } from "framer-motion";
import styles from "./gallery.module.css";
import FadeUp from "@/components/motion/FadeUp";
import Image from "@/components/common/Image";
import useDocumentTitle from "@/hooks/useDocumentTitle";
import { GALLERY_CATEGORIES, GALLERY_ITEMS } from "@/data/galleryData";

export default function GalleryPage() {
  useDocumentTitle("Photo Gallery | Glorious Public School, Jhajha");
  const [activeCategory, setActiveCategory] = useState("All");
  const [activeModalItem, setActiveModalItem] = useState(null);

  const filteredItems =
    activeCategory === "All"
      ? GALLERY_ITEMS
      : GALLERY_ITEMS.filter((item) => item.category === activeCategory);

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
              </button>
            ))}
          </div>

          {/* Grid of Images */}
          <div className={styles.galleryGrid}>
            {filteredItems.map((item, idx) => (
              <FadeUp key={item.id} delay={0.08 * (idx + 1)}>
                <div
                  className={styles.galleryCard}
                  onClick={() => setActiveModalItem(item)}
                >
                  <div className={styles.imageWrap}>
                    <Image
                      src={item.image}
                      alt={item.title}
                      className={styles.img}
                    />
                    <div className={styles.overlay}>
                      <span className={styles.cardCat}>{item.category}</span>
                      <h3 className={styles.cardTitle}>{item.title}</h3>
                      <Maximize2 size={20} className={styles.expandIcon} />
                    </div>
                  </div>
                  <div className={styles.captionArea}>
                    <p>{item.caption}</p>
                  </div>
                </div>
              </FadeUp>
            ))}
          </div>
        </div>
      </section>

      {/* Lightbox Modal */}
      <AnimatePresence>
        {activeModalItem && (
          <m.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className={styles.modalOverlay}
            onClick={() => setActiveModalItem(null)}
          >
            <m.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className={styles.modalContent}
              onClick={(e) => e.stopPropagation()}
            >
              <button
                className={styles.closeBtn}
                onClick={() => setActiveModalItem(null)}
              >
                <X size={24} />
              </button>
              <Image
                src={activeModalItem.image}
                alt={activeModalItem.title}
                className={styles.modalImg}
              />
              <div className={styles.modalInfo}>
                <span className={styles.modalCat}>{activeModalItem.category}</span>
                <h3>{activeModalItem.title}</h3>
                <p>{activeModalItem.caption}</p>
              </div>
            </m.div>
          </m.div>
        )}
      </AnimatePresence>
    </div>
  );
}
