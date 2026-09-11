import React from 'react';
import './Hero.css';

function Hero() {
  return (
    <section id="home" className="hero-section">
      <div className="container hero-container">
        <div className="hero-content">
          <span className="hero-badge">Welcome to Glorious Public School</span>
          <h1 className="hero-title">
            Shaping Leaders of Tomorrow with <span className="highlight">Excellence</span> & <span className="highlight">Integrity</span>
          </h1>
          <p className="hero-description">
            Providing holistic education from Nursery to Class 10 with state-of-the-art facilities, 
            experienced mentors, and a supportive learning environment.
          </p>
          <div className="hero-actions">
            <a href="#contact" className="btn btn-secondary">Apply for Admission</a>
            <a href="#about" className="btn btn-outline">Discover More</a>
          </div>

          <div className="hero-stats">
            <div className="stat-item">
              <span className="stat-number">15+</span>
              <span className="stat-label">Years of Trust</span>
            </div>
            <div className="stat-item">
              <span className="stat-number">1200+</span>
              <span className="stat-label">Bright Students</span>
            </div>
            <div className="stat-item">
              <span className="stat-number">100%</span>
              <span className="stat-label">Board Pass Rate</span>
            </div>
            <div className="stat-item">
              <span className="stat-number">45+</span>
              <span className="stat-label">Expert Faculty</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default Hero;
