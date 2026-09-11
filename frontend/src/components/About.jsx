import React from 'react';
import './About.css';

function About() {
  const pillars = [
    {
      title: "Smart Classrooms",
      desc: "Equipped with modern multimedia projectors and interactive digital boards for visual learning.",
      icon: "💻"
    },
    {
      title: "Advanced Laboratories",
      desc: "Fully equipped Physics, Chemistry, Biology, and Computer labs fostering practical inquiry.",
      icon: "🔬"
    },
    {
      title: "Vast Library & Resource Center",
      desc: "Over 8,000 books, journals, and digital learning modules to enrich young minds.",
      icon: "📚"
    },
    {
      title: "Sports & Physical Fitness",
      desc: "Dedicated facilities for football, cricket, basketball, yoga, and athletic training.",
      icon: "⚽"
    }
  ];

  return (
    <section id="about" className="section about-section">
      <div className="container">
        <div className="section-header">
          <span className="section-badge">About Glorious Public School</span>
          <h2 className="section-title">Committed to Academic & Moral Excellence</h2>
          <p className="section-subtitle">
            Founded with a vision to nurture well-rounded personalities, Glorious Public School balances rigorous 
            academics with moral values and creative growth.
          </p>
        </div>

        <div className="about-grid">
          <div className="about-story">
            <h3>Our Mission & Philosophy</h3>
            <p>
              At Glorious Public School, we believe that education is not merely the transmission of facts, 
              but the ignition of curiosity and character. Every student is recognized as a unique individual 
              with infinite potential.
            </p>
            <p>
              We maintain an optimal student-to-teacher ratio to ensure personalized guidance, continuous assessment, 
              and an encouraging environment where students thrive academically, socially, and emotionally.
            </p>
            <div className="mission-highlights">
              <div className="highlight-item">
                <span className="bullet">✓</span> Focus on Conceptual Learning
              </div>
              <div className="highlight-item">
                <span className="bullet">✓</span> Safe & Eco-friendly Green Campus
              </div>
              <div className="highlight-item">
                <span className="bullet">✓</span> Strong Ethical & Cultural Values
              </div>
            </div>
          </div>

          <div className="pillars-grid">
            {pillars.map((item, index) => (
              <div key={index} className="pillar-card">
                <div className="pillar-icon">{item.icon}</div>
                <h4 className="pillar-title">{item.title}</h4>
                <p className="pillar-desc">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

export default About;
