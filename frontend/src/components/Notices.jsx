import React, { useState, useEffect } from 'react';
import './Notices.css';

// Default notices in case backend server is not running yet
const fallbackNotices = [
  {
    id: 1,
    title: "Admissions Open for Academic Session 2026-27",
    date: "2026-09-01",
    category: "Admission",
    description: "Admissions are now open for Nursery to Class 10. Registration forms are available online and at the school admin desk."
  },
  {
    id: 2,
    title: "Annual Sports Meet & Athletic Events",
    date: "2026-09-18",
    category: "Events",
    description: "Glorious Public School Annual Sports Meet will be held on the school grounds. All students must wear their respective house uniforms."
  },
  {
    id: 3,
    title: "Parent-Teacher Meeting (PTM)",
    date: "2026-09-25",
    category: "Academic",
    description: "Quarterly PTM for all grades will be held between 9:00 AM and 1:00 PM. Parents are cordially invited to discuss their ward's progress."
  }
];

function Notices() {
  const [notices, setNotices] = useState(fallbackNotices);
  const [loading, setLoading] = useState(true);
  const [source, setSource] = useState('Checking backend...');

  useEffect(() => {
    // Fetch notices from the simple backend server
    fetch('http://localhost:5000/api/announcements')
      .then((res) => {
        if (!res.ok) {
          throw new Error('Network response was not ok');
        }
        return res.json();
      })
      .then((data) => {
        setNotices(data);
        setSource('Live from Backend');
        setLoading(false);
      })
      .catch((err) => {
        console.log('Backend not connected or running. Using local notices.', err.message);
        setSource('Local Noticeboard (Start backend to sync live)');
        setLoading(false);
      });
  }, []);

  return (
    <section id="notices" className="section notices-section">
      <div className="container">
        <div className="section-header">
          <span className="section-badge">Notice Board</span>
          <h2 className="section-title">Latest School Announcements</h2>
          <p className="section-subtitle">
            Stay updated with recent circulars, events, examination timetables, and school news.
          </p>
          <div className="backend-indicator">
            <span className={`status-dot ${source.includes('Live') ? 'online' : 'offline'}`}></span>
            <small>{source}</small>
          </div>
        </div>

        <div className="notices-grid">
          {notices.map((notice) => (
            <div key={notice.id} className="notice-card">
              <div className="notice-header">
                <span className="notice-category">{notice.category}</span>
                <span className="notice-date">{notice.date}</span>
              </div>
              <h3 className="notice-title">{notice.title}</h3>
              <p className="notice-desc">{notice.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default Notices;
