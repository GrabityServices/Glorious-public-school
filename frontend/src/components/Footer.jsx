import React from 'react';
import './Footer.css';

function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="footer">
      <div className="container footer-container">
        <div className="footer-col brand-col">
          <div className="footer-logo">
            <span className="logo-badge">GPS</span>
            <span className="logo-title">Glorious Public School</span>
          </div>
          <p className="footer-desc">
            Empowering students with knowledge, moral values, and global perspectives to become 
            responsible citizens and compassionate leaders.
          </p>
        </div>

        <div className="footer-col">
          <h4 className="footer-heading">Quick Links</h4>
          <ul className="footer-links">
            <li><a href="#home">Home</a></li>
            <li><a href="#about">About Our School</a></li>
            <li><a href="#academics">Curriculum & Wings</a></li>
            <li><a href="#notices">Notice Board</a></li>
            <li><a href="#contact">Admission Enquiry</a></li>
          </ul>
        </div>

        <div className="footer-col">
          <h4 className="footer-heading">Academics</h4>
          <ul className="footer-links">
            <li><a href="#academics">Kindergarten / Nursery</a></li>
            <li><a href="#academics">Primary School (Grades 1-5)</a></li>
            <li><a href="#academics">Middle School (Grades 6-8)</a></li>
            <li><a href="#academics">Secondary School (Grades 9-10)</a></li>
            <li><a href="#academics">Science & Computer Labs</a></li>
          </ul>
        </div>

        <div className="footer-col">
          <h4 className="footer-heading">Contact Info</h4>
          <p className="footer-text">📍 Knowledge City, New Delhi - 110001</p>
          <p className="footer-text">📞 +91 98765 43210</p>
          <p className="footer-text">✉️ info@gloriouspublicschool.edu</p>
          <p className="footer-text">🕒 Office Hours: 8:00 AM - 3:30 PM</p>
        </div>
      </div>

      <div className="footer-bottom">
        <div className="container bottom-content">
          <p>© {currentYear} Glorious Public School. All rights reserved.</p>
          <p className="motto">Nurturing Excellence, Inspiring Futures</p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
