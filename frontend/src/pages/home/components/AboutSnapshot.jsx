import { Link } from "react-router-dom";
import { CheckCircle, Shield, Lightbulb, Compass, ArrowRight, Award } from "lucide-react";
import styles from "./AboutSnapshot.module.css";
import FadeUp from "@/components/motion/FadeUp";
import { SCHOOL_INFO } from "@/data/schoolData";

export default function AboutSnapshot() {
  const values = [
    {
      icon: <Compass size={20} />,
      title: "Erudite Leadership",
      desc: "Instilling deep scholarly knowledge, articulate expression, and critical decision-making.",
    },
    {
      icon: <Lightbulb size={20} />,
      title: "Creative Thinking",
      desc: "Nurturing creative problem-solving and bringing out the innate talent in every child.",
    },
    {
      icon: <Shield size={20} />,
      title: "Integrity & Ethics",
      desc: "Special emphasis on upright moral conduct, self-discipline, and compassion.",
    },
    {
      icon: <CheckCircle size={20} />,
      title: "All-Rounded Growth",
      desc: "Harmonizing academics with sports, public speaking, arts, and civic responsibility.",
    },
  ];

  return (
    <section className={styles.section}>
      <div className={styles.container}>
        <div className={styles.grid}>
          {/* Left Visual Column */}
          <FadeUp className={styles.imageCol}>
            <div className={styles.imageWrapper}>
              <img
                src="/images/blog2.png"
                alt="Students of Glorious Public School"
                className={styles.mainImage}
              />
              <div className={styles.imageBadge}>
                <Award size={20} className={styles.badgeIcon} />
                <div>
                  <strong>Character & Leadership</strong>
                  <span>Recognized English Medium</span>
                </div>
              </div>
              <div className={styles.wingPill}>
                <span>Co-Educational Campus</span>
              </div>
            </div>
          </FadeUp>

          {/* Right Text Column */}
          <div className={styles.textCol}>
            <FadeUp delay={0.1}>
              <span className="section-subtitle">About Glorious Public School</span>
              <h2 className={styles.title}>
                Dedicated to Create Erudite, Upright Leaders of Tomorrow
              </h2>
            </FadeUp>

            <FadeUp delay={0.16}>
              <p className={styles.leadText}>
                Glorious Public School strives to develop an all-rounded personality in every student. We nurture independent thinking, ethical discernment, and academic rigour, preparing young minds to thrive in an evolving world.
              </p>
            </FadeUp>

            {/* 4 Pillars Grid */}
            <div className={styles.valuesGrid}>
              {values.map((v, i) => (
                <FadeUp key={v.title} delay={0.18 + 0.06 * i} fullHeight>
                  <div className={styles.valueCard}>
                    <div className={styles.iconCircle}>{v.icon}</div>
                    <h3 className={styles.valueTitle}>{v.title}</h3>
                    <p className={styles.valueDesc}>{v.desc}</p>
                  </div>
                </FadeUp>
              ))}
            </div>

            <FadeUp delay={0.35}>
              <div className={styles.ctaWrapper}>
                <Link to="/about" className="btn btn-primary">
                  <span>Discover Our Vision & Story</span>
                  <ArrowRight size={16} />
                </Link>
                <Link to="/admissions" className="btn btn-secondary">
                  <span>Admission Guidelines</span>
                </Link>
              </div>
            </FadeUp>
          </div>
        </div>
      </div>
    </section>
  );
}
