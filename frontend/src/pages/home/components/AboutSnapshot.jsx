import { Link } from "react-router-dom";
import { CheckCircle, Shield, Lightbulb, Compass, ArrowRight } from "lucide-react";
import styles from "./AboutSnapshot.module.css";
import FadeUp from "@/components/motion/FadeUp";
import { SCHOOL_INFO } from "@/data/schoolData";

export default function AboutSnapshot() {
  const values = [
    {
      icon: <Compass size={22} />,
      title: "Erudite Leadership",
      desc: "Instilling deep scholarly knowledge, articulate expression, and critical decision-making.",
    },
    {
      icon: <Lightbulb size={22} />,
      title: "Creative & Independent Thinking",
      desc: "Nurturing creative problem-solving and bringing out the innate talent in every child.",
    },
    {
      icon: <Shield size={22} />,
      title: "Character, Ethics & Integrity",
      desc: "Special emphasis on upright moral conduct, self-discipline, and compassion.",
    },
    {
      icon: <CheckCircle size={22} />,
      title: "All-Rounded Personality",
      desc: "Harmonizing academics with sports, public speaking, arts, and civic responsibility.",
    },
  ];

  return (
    <section className={styles.section}>
      <div className={styles.container}>
        <div className={styles.grid}>
          {/* Left Text Column */}
          <div className={styles.textCol}>
            <FadeUp>
              <span className="section-subtitle">Welcome to Glorious</span>
              <h2 className={styles.title}>
                Dedicated to Create Erudite, Upright Leaders of Tomorrow
              </h2>
            </FadeUp>

            <FadeUp delay={0.15}>
              <p className={styles.leadText}>
                {SCHOOL_INFO.aboutText}
              </p>
            </FadeUp>

            <FadeUp delay={0.2}>
              <div className={styles.directorQuote}>
                <p>
                  "We believe education is not merely the accumulation of facts, but the training of the mind to think freely and the heart to act justly."
                </p>
                <div className={styles.quoteAuthor}>
                  <strong>— Administration & Faculty</strong>
                  <span>Glorious Public School, Jhajha</span>
                </div>
              </div>
            </FadeUp>

            <FadeUp delay={0.25}>
              <div className={styles.ctaWrapper}>
                <Link to="/about" className="btn btn-primary">
                  <span>Read Full About Us</span>
                  <ArrowRight size={16} />
                </Link>
                <Link to="/contact" className="btn btn-secondary">
                  <span>Get in Touch</span>
                </Link>
              </div>
            </FadeUp>
          </div>

          {/* Right Values Cards Column */}
          <div className={styles.cardsCol}>
            <div className={styles.valuesGrid}>
              {values.map((v, i) => (
                <FadeUp key={v.title} delay={0.1 * (i + 1)}>
                  <div className={styles.valueCard}>
                    <div className={styles.iconCircle}>{v.icon}</div>
                    <h3 className={styles.valueTitle}>{v.title}</h3>
                    <p className={styles.valueDesc}>{v.desc}</p>
                  </div>
                </FadeUp>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
