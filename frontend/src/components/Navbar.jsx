import React, { useState } from 'react';
import './Navbar.css';

function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);

  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };

  return (
    <header className="navbar-header">
      <div className="container navbar-container">
        <div className="navbar-brand">
          <div className="school-logo">GPS</div>
          <div className="brand-text">
            <span className="school-name">Glorious Public School</span>
            <span className="school-tagline">Excellence in Education</span>
          </div>
        </div>

        {/* Hamburger button for mobile */}
        <button className="mobile-toggle" onClick={toggleMenu} aria-label="Toggle navigation">
          <span className="bar"></span>
          <span className="bar"></span>
          <span className="bar"></span>
        </button>

        {/* Navigation links */}
        <nav className={`nav-menu ${menuOpen ? 'active' : ''}`}>
          <a href="#home" className="nav-link" onClick={() => setMenuOpen(false)}>Home</a>
          <a href="#about" className="nav-link" onClick={() => setMenuOpen(false)}>About Us</a>
          <a href="#academics" className="nav-link" onClick={() => setMenuOpen(false)}>Academics</a>
          <a href="#notices" className="nav-link" onClick={() => setMenuOpen(false)}>Notice Board</a>
          <a href="#contact" className="nav-link nav-btn" onClick={() => setMenuOpen(false)}>Enquire Now</a>
        </nav>
      </div>
    </header>
  );
}

export default Navbar;
