# 🏫 Glorious Public School - Official Website

Welcome to the official web application for **Glorious Public School**. Built with a clean, editorial, and soothing aesthetic (inspired by modern mindful design principles):
- **Multi-Page Experience**: Real multi-page navigation with dedicated pages for Home, About Us, Academics, Why Glorious, Notice Board, and Contact/Admissions.
- **Pure CSS Styling with `:root` Variables**: Easily adjust colors, spacing, and typography in one central place.
- **Smooth Animations**: Breathing preloader, floating hero badges, smooth page transitions, and interactive tabs.
- **Backend API Integration**: Lightweight Node.js & Express REST API powering live school circulars and admission enquiries.
- **Unified Runner**: Run both frontend and backend together with a single `npm start` command!

---

## ⚡ Quick Start (Run Frontend & Backend Together)

From the main project folder (`Glorious-public-school`), run:

```bash
npm start
```

- 🌐 **Frontend**: opens at **`http://localhost:5173`** (or `3000`)
- ⚙️ **Backend**: runs at **`http://localhost:5000`**
- ⏹️ To stop both servers, press `Ctrl + C` in the terminal.

---

## 🧭 Multi-Page Routes

| Route | Page | Description |
| :--- | :--- | :--- |
| `/` | **Home** | Hero with floating badges, stats, wings preview, arch section, notices, & CTA |
| `/about` | **About Us** | Mission & philosophy, campus video tour, Principal's message, facilities & values |
| `/academics` | **Academics** | Pre-Primary, Primary, Middle, and Secondary wings with interactive curriculum tabs |
| `/why-us` | **Why Glorious** | Signature organic arch design, holistic checklist, & 5-star parent testimonials |
| `/notices` | **Notice Board** | Live filterable circulars (synced with backend `/api/announcements`) & calendar |
| `/contact` | **Contact / Admissions** | Campus visit booking form (synced with backend `/api/contact`) & interactive FAQ |

---

## 🎨 Changing Colors with `:root` Variables

Open [`frontend/src/index.css`](frontend/src/index.css) to change colors across the entire website instantly:

```css
:root {
  --color-bg: #f7f8f4;               /* Calming organic off-white */
  --color-bg-alt: #edf1e8;           /* Subtle warm section background */
  --color-surface: #ffffff;          /* Card & panel surfaces */
  --color-primary: #1b392b;          /* Deep forest pine green */
  --color-primary-hover: #132b20;    /* Hover state for primary */
  --color-accent: #c48a47;           /* Warm honey bronze / gold */
  --color-accent-light: #fcf4e8;     /* Soft gold badge background */
  --color-card-dark: #1b392b;        /* Signature dark card background */
}
```

---

## 📁 Project Structure

```text
Glorious-public-school/
│
├── .gitignore                       # Clean Git rules
├── package.json                     # Root runner (npm start)
│
├── backend/                         # Node.js + Express API
│   ├── data/
│   │   └── announcements.json       # School notices & circulars data
│   ├── package.json
│   └── server.js                    # API server with /api/announcements & /api/contact
│
└── frontend/                        # Multi-page React app + Pure CSS
    ├── src/
    │   ├── components/              # Reusable school components
    │   │   ├── Preloader.jsx        # Breathing pulse preloader (Screenshot 1)
    │   │   ├── Navbar.jsx           # Editorial navbar with leaf SVG (Screenshot 2)
    │   │   ├── Hero.jsx             # Hero with floating badges & stats (Screenshot 2)
    │   │   ├── About.jsx            # Two-column about with video frame (Screenshot 3)
    │   │   ├── Academics.jsx        # 4 vertical cards (Screenshot 4)
    │   │   ├── WhyChooseUs.jsx      # Organic arch mask visual (Screenshot 5)
    │   │   ├── Notices.jsx          # Filterable notice board
    │   │   ├── Contact.jsx          # Admissions enquiry form
    │   │   ├── Footer.jsx           # Dark forest school footer
    │   │   └── ScrollToTop.jsx      # Auto smooth scroll on page change
    │   ├── pages/                   # Dedicated multi-page views
    │   │   ├── Home.jsx             # Main landing page
    │   │   ├── AboutPage.jsx        # Detailed About Us page
    │   │   ├── AcademicsPage.jsx    # Detailed Academics & curriculum tabs
    │   │   ├── WhyUsPage.jsx        # Distinctive advantages & parent reviews
    │   │   ├── NoticesPage.jsx      # Official Notice Board & event calendar
    │   │   └── ContactPage.jsx      # Admissions desk & interactive FAQ
    │   ├── App.jsx                  # React Router setup
    │   └── index.css                # Root CSS variables & smooth keyframe animations
    ├── index.html                   # Fonts & metadata
    └── package.json
```
