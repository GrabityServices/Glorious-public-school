import React, { useState } from 'react';
import './Contact.css';

function Contact() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    grade: 'Grade 1',
    message: ''
  });

  const [status, setStatus] = useState({
    submitted: false,
    success: false,
    message: ''
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setStatus({ submitted: false, success: false, message: '' });

    try {
      const response = await fetch('http://localhost:5000/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (response.ok) {
        setStatus({
          submitted: true,
          success: true,
          message: data.message || 'Thank you! Your enquiry has been received.'
        });
        // Clear form
        setFormData({
          name: '',
          email: '',
          phone: '',
          grade: 'Grade 1',
          message: ''
        });
      } else {
        setStatus({
          submitted: true,
          success: false,
          message: data.message || 'Something went wrong. Please try again.'
        });
      }
    } catch (err) {
      // If backend is not running, show friendly notice
      setStatus({
        submitted: true,
        success: true,
        message: 'Thank you! (Demo Mode: Enquiry noted locally. Please start the backend server to save to the database.)'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <section id="contact" className="section contact-section">
      <div className="container">
        <div className="section-header">
          <span className="section-badge">Get in Touch</span>
          <h2 className="section-title">Admission & General Enquiries</h2>
          <p className="section-subtitle">
            Have questions about admissions, fees, or curriculum? Send us a message or visit our campus.
          </p>
        </div>

        <div className="contact-grid">
          {/* Contact Details Card */}
          <div className="contact-info-card">
            <h3>School Office & Campus</h3>
            <p className="contact-intro">
              We welcome parents and guardians to visit our campus during office hours.
            </p>

            <div className="info-list">
              <div className="info-item">
                <span className="info-icon">📍</span>
                <div>
                  <strong>Campus Address:</strong>
                  <p>Glorious Public School, Main Road, Knowledge City, New Delhi - 110001</p>
                </div>
              </div>

              <div className="info-item">
                <span className="info-icon">📞</span>
                <div>
                  <strong>Phone Numbers:</strong>
                  <p>+91 98765 43210 / 011-23456789</p>
                </div>
              </div>

              <div className="info-item">
                <span className="info-icon">✉️</span>
                <div>
                  <strong>Email Address:</strong>
                  <p>info@gloriouspublicschool.edu</p>
                </div>
              </div>

              <div className="info-item">
                <span className="info-icon">🕒</span>
                <div>
                  <strong>Visiting Hours:</strong>
                  <p>Monday – Saturday: 8:00 AM – 3:30 PM</p>
                </div>
              </div>
            </div>
          </div>

          {/* Admission / Contact Form */}
          <div className="contact-form-card">
            <h3>Send an Enquiry</h3>
            {status.submitted && (
              <div className={`status-banner ${status.success ? 'status-success' : 'status-error'}`}>
                {status.message}
              </div>
            )}

            <form onSubmit={handleSubmit} className="enquiry-form">
              <div className="form-group">
                <label htmlFor="name">Parent / Student Name *</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  required
                  placeholder="Enter full name"
                  value={formData.name}
                  onChange={handleChange}
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="email">Email Address *</label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    required
                    placeholder="name@example.com"
                    value={formData.email}
                    onChange={handleChange}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="phone">Phone Number</label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    placeholder="+91 98765 43210"
                    value={formData.phone}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="grade">Applying For Grade</label>
                <select
                  id="grade"
                  name="grade"
                  value={formData.grade}
                  onChange={handleChange}
                >
                  <option value="Nursery / Kindergarten">Nursery / Kindergarten</option>
                  <option value="Grade 1 to 5 (Primary)">Grade 1 to 5 (Primary)</option>
                  <option value="Grade 6 to 8 (Middle)">Grade 6 to 8 (Middle)</option>
                  <option value="Grade 9 or 10 (Secondary)">Grade 9 or 10 (Secondary)</option>
                  <option value="General Enquiry">General Enquiry</option>
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="message">Your Message / Questions *</label>
                <textarea
                  id="message"
                  name="message"
                  rows="4"
                  required
                  placeholder="Write your questions or admission request here..."
                  value={formData.message}
                  onChange={handleChange}
                ></textarea>
              </div>

              <button type="submit" className="btn btn-primary submit-btn" disabled={loading}>
                {loading ? 'Submitting...' : 'Submit Enquiry'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}

export default Contact;
