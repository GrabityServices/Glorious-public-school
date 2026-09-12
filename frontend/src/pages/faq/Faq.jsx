import { useState } from "react";
import { Link } from "react-router-dom";
import { ChevronDown, HelpCircle, Phone, ArrowRight } from "lucide-react";
import { AnimatePresence, m } from "framer-motion";
import styles from "./faq.module.css";
import FadeUp from "@/components/motion/FadeUp";
import useDocumentTitle from "@/hooks/useDocumentTitle";
import { SCHOOL_FAQS } from "@/data/faqData";
import { SCHOOL_INFO } from "@/data/schoolData";

export default function FaqPage() {
  useDocumentTitle("Parent & Student FAQ | Glorious Public School");
  const [openIdx, setOpenIdx] = useState(0);

  const toggle = (idx) => {
    setOpenIdx(openIdx === idx ? null : idx);
  };

  return (
    <div className={styles.pageWrapper}>
      {/* Hero Header */}
      <section className={styles.heroHeader}>
        <div className={styles.container}>
          <FadeUp>
            <span className="section-subtitle">Help & Queries</span>
            <h1 className={styles.title}>Frequently Asked Questions</h1>
            <p className={styles.subtitle}>
              Answers to common parent questions regarding admissions from Nursery to Class 10th, school timings, transport routes, and hostel facilities.
            </p>
          </FadeUp>
        </div>
      </section>

      {/* Accordion Section */}
      <section className={styles.section}>
        <div className={styles.container}>
          <div className={styles.accordionContainer}>
            {SCHOOL_FAQS.map((faq, idx) => {
              const isOpen = openIdx === idx;
              return (
                <FadeUp key={idx} delay={0.05 * (idx + 1)}>
                  <div className={`${styles.accordionItem} ${isOpen ? styles.itemOpen : ""}`}>
                    <button
                      className={styles.questionBtn}
                      onClick={() => toggle(idx)}
                      aria-expanded={isOpen}
                    >
                      <span className={styles.questionText}>{faq.q}</span>
                      <ChevronDown
                        size={20}
                        className={`${styles.arrowIcon} ${isOpen ? styles.arrowRotated : ""}`}
                      />
                    </button>

                    <AnimatePresence>
                      {isOpen && (
                        <m.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.25 }}
                          className={styles.answerWrap}
                        >
                          <p className={styles.answerText}>{faq.a}</p>
                        </m.div>
                      )}
                    </AnimatePresence>
                  </div>
                </FadeUp>
              );
            })}
          </div>

          {/* Still Have Questions Box */}
          <div className={styles.helpBox}>
            <h3>Still have questions?</h3>
            <p>Our admissions desk at Koltex, Petrol Pump, Jhajha is always ready to assist parents.</p>
            <div className={styles.helpBtns}>
              <a href={`tel:${SCHOOL_INFO.phone}`} className="btn btn-gold">
                <Phone size={16} />
                <span>Call {SCHOOL_INFO.phone}</span>
              </a>
              <Link to="/contact" className="btn btn-secondary">
                <span>Contact Us Form</span>
                <ArrowRight size={16} />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
