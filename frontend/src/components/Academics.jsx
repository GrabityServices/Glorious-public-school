import React from 'react';
import './Academics.css';

function Academics() {
  const wings = [
    {
      level: "Pre-Primary Wing",
      grades: "Nursery, LKG, UKG",
      description: "Play-way and experiential methodology focusing on sensory development, language skills, motor coordination, and foundational numeracy in a caring ambiance.",
      features: ["Activity-based learning", "Phonics & Storytelling", "Safe play zones"]
    },
    {
      level: "Primary Wing",
      grades: "Grade 1 to Grade 5",
      description: "Building strong academic fundamentals in Languages, Mathematics, Science, and Social Studies alongside art, music, physical fitness, and digital literacy.",
      features: ["Language proficiency", "Basic computer training", "Creative arts & craft"]
    },
    {
      level: "Middle Wing",
      grades: "Grade 6 to Grade 8",
      description: "Encouraging scientific reasoning, analytical problem-solving, collaborative projects, and introducing computer coding and inter-disciplinary studies.",
      features: ["Science laboratory sessions", "Robotics & Coding", "Club activities & Debating"]
    },
    {
      level: "Secondary Wing",
      grades: "Grade 9 and Grade 10",
      description: "Rigorous preparation for board examinations with specialized subject faculty, regular mock evaluations, remedial doubt sessions, and career counseling.",
      features: ["Board exam curriculum", "Career guidance sessions", "Comprehensive mock tests"]
    }
  ];

  return (
    <section id="academics" className="section academics-section">
      <div className="container">
        <div className="section-header">
          <span className="section-badge">Academic Wings</span>
          <h2 className="section-title">Comprehensive Learning Curriculum</h2>
          <p className="section-subtitle">
            From early childhood discovery to structured secondary board education, our curriculum is carefully 
            crafted to ensure progressive learning milestones.
          </p>
        </div>

        <div className="academics-grid">
          {wings.map((wing, index) => (
            <div key={index} className="academic-card">
              <div className="card-header">
                <span className="academic-badge">{wing.grades}</span>
                <h3 className="card-title">{wing.level}</h3>
              </div>
              <p className="card-desc">{wing.description}</p>
              <div className="card-features">
                <strong>Key Highlights:</strong>
                <ul>
                  {wing.features.map((feat, fIndex) => (
                    <li key={fIndex}>{feat}</li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default Academics;
