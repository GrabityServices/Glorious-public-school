# 🎓 Glorious Public School — Official Web Portal

An engaging, academic web portal for **Glorious Public School** (Nursery to Class 10th in Jhajha, Jamui, Bihar), built with **React 19**, **Vite**, and **React Router 7**.

---

## 🏫 About Glorious Public School

* **Motto:** *"Dedicated to create erudite, upright leaders of tomorrow's world."*
* **Grades:** Nursery, LKG, UKG up to Class 10th (Secondary Board)
* **Campus Address:** Koltex, Petrol Pump, Jhajha, Jamui, Bihar 811308
* **Helpline:** +91 9534105012
* **Email:** gpsjhajha@gmail.com
* **School Hours:** Mon - Fri: 8:00 AM - 2:30 PM | Sat: 8:00 AM - 1:00 PM | Sun: Closed

---

## ✨ Features & Modules

- 🎓 **Online Student Admission System (`/admissions`)** — Simple digital application with instant registration code generator, age eligibility matrix, and required documents checklist.
- 📚 **Comprehensive Academics Directory (`/academics`)** — Interactive wing tabs covering Pre-Primary (Nursery, LKG, UKG), Primary (1st–5th), Middle (6th–8th), and Secondary (9th–10th) with subject breakdowns, evaluation rules, and bell schedule.
- 🚌 **Campus Infrastructure & Facilities (`/facilities`)** — Safe school bus/van transport covering Jhajha and Jamui routes, residential boarding hostel, digital library (3,500+ books), science & computer technology labs, and expansive sports grounds.
- 🏆 **Events & Celebrations (`/events`)** — Showcasing cultural events including the Inter-School Dance & Cultural Fest at Jhajha Town Hall, Independence Day painting competition, Annual Sports Meet, and Science Exhibition.
- 📢 **Official Notice Board (`/news`)** — Circulars, examination schedules, winter timing notices, and holiday announcements with categorized search and reader view.
- 🖼️ **Photo Gallery (`/gallery`)** — High-resolution categorized photo albums with interactive lightbox viewer.
- 👩‍🏫 **Teachers & Staff Directory (`/staff`)** — Profiles of 18+ experienced faculty, principal, and administrative leadership.
- 🗓️ **Academic Holiday Calendar (`/holiday`)** — Annual calendar of state and national holidays, seasonal breaks, and festival celebrations.
- ❓ **Parent & Student FAQ (`/faq`)** — Smooth collapsible accordion answering admission procedures, age criteria, bus routes, and hostel rules.
- 📍 **Contact & Campus Coordinates (`/contact`)** — Detailed campus map, office timings, helpline links, and inquiry submission form.
- 🔐 **Student & Parent Portal Login (`/login`)** — Clean interface with role toggles (Student, Parent, Staff).

---

## 🗂️ Project Structure

```
meditation/
├── index.html                   # HTML entry point with educational fonts & metadata
├── vite.config.js               # Vite configuration with @ path alias
├── package.json                 # React 19, React Router 7, Vite dependencies
│
├── src/
│   ├── main.jsx                 # React root mount with BrowserRouter
│   ├── App.jsx                  # Main application wrapper
│   │
│   ├── routes/
│   │   ├── AppRoutes.jsx        # Complete declarative school route definitions
│   │   └── index.js
│   │
│   ├── pages/                   # Feature-based pages with colocated styles
│   │   ├── home/                # Homepage with Hero, Philosophy, Wings, Notice ticker
│   │   ├── about/               # Heritage, mission, vision, leadership
│   │   ├── academics/           # Nursery to 10th wings, subjects, routine
│   │   ├── admissions/          # Online application form & age criteria
│   │   ├── facilities/          # Transport, hostel, library, labs, sports
│   │   ├── events/              # Events list & detail viewer (Jhajha Town Hall, etc.)
│   │   ├── news/                # Notice board with circular reader
│   │   ├── gallery/             # Filterable photo albums & lightbox
│   │   ├── staff/               # Faculty and leadership profiles
│   │   ├── holiday/             # Academic holiday calendar table
│   │   ├── faq/                 # Collapsible parent FAQ accordion
│   │   ├── contact/             # Jhajha address, hours, query form
│   │   ├── login/               # Student & parent portal login
│   │   ├── privacy/             # Student records privacy policy
│   │   ├── terms/               # Student code of conduct
│   │   └── not-found/           # School-themed 404 page
│   │
│   ├── components/
│   │   ├── common/              # Universal Image component
│   │   ├── layout/              # TopHeader, Navbar, Footer, and Layout
│   │   └── motion/              # Framer Motion animation wrappers
│   │
│   ├── data/                    # School data layer
│   │   ├── schoolData.js        # Address, phone, email, hours, stats
│   │   ├── academicsData.js     # Nursery to 10th wing syllabus & schedule
│   │   ├── admissionsData.js    # Age matrix, application steps, documents
│   │   ├── facilitiesData.js    # Transport routes, hostel, labs, sports
│   │   ├── eventsData.js        # Jhajha Town Hall competition, sports day
│   │   ├── newsData.js          # Circulars & admission notices
│   │   ├── galleryData.js       # Categorized image catalog
│   │   ├── staffData.js         # Teacher & staff directory
│   │   ├── faqData.js           # School parent FAQs
│   │   └── holidayData.js       # Annual holiday list
│   │
│   └── styles/
│       └── globals.css          # School academic theme tokens (Royal Navy & Gold)
│
└── public/
    ├── favicon.ico
    ├── robots.txt
    ├── sitemap.xml
    └── images/                  # Visual assets & photography
```

---

## ⚙️ Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Start local development server
npm run dev

# 3. Build for production
npm run build

# 4. Preview production build
npm run preview
```
