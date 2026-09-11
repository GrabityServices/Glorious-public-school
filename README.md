# 🏫 Glorious Public School - Official Website

Welcome to the official web application for **Glorious Public School**. This project is built with a clean, simple, and transparent structure:
- **Frontend**: Standard **React** with **Pure CSS** (no complex frameworks, no hidden tricks).
- **Backend**: Lightweight **Node.js & Express** REST API for announcements and enquiries.
- **Unified Runner**: Run both frontend and backend together with a single `npm start` command!

---

## ⚡ Quick Start (Run Both Frontend & Backend Together)

Make sure you have [Node.js](https://nodejs.org/) installed.

1. **Install dependencies** (only needed once):
   ```bash
   # In the backend folder
   cd backend && npm install

   # In the frontend folder
   cd ../frontend && npm install
   ```

2. **Start both Frontend & Backend at the same time**:
   From the main project folder (`Glorious-public-school`), run:
   ```bash
   npm start
   ```

- 🌐 **Frontend**: opens at **`http://localhost:3000`**
- ⚙️ **Backend**: runs at **`http://localhost:5000`**
- ⏹️ To stop both servers anytime, simply press `Ctrl + C` in the terminal.

---

## 📁 Project Structure

```text
Glorious-public-school/
│
├── .gitignore                       # Git ignore rules (node_modules, dist, env, etc.)
├── start.js                         # Simple runner to start frontend & backend simultaneously
├── package.json                     # Root script runner (npm start)
│
├── backend/                         # Backend API server (Node.js + Express)
│   ├── data/
│   │   └── announcements.json       # School notices & circulars data
│   ├── package.json                 # Express & CORS dependencies
│   └── server.js                    # Main server file with API routes
│
├── frontend/                        # Frontend User Interface (React + Pure CSS)
│   ├── public/                      # Static assets
│   ├── src/
│   │   ├── components/              # School page components
│   │   │   ├── Navbar.jsx           # Header navigation & school logo
│   │   │   ├── Navbar.css           # Navigation styling
│   │   │   ├── Hero.jsx             # Welcome banner & key school statistics
│   │   │   ├── Hero.css             # Hero section styling
│   │   │   ├── About.jsx            # Mission, vision, and campus facilities
│   │   │   ├── About.css            # About section styling
│   │   │   ├── Academics.jsx        # Pre-Primary, Primary, Middle & Secondary wings
│   │   │   ├── Academics.css        # Academics section styling
│   │   │   ├── Notices.jsx          # Live Notice Board (connects to backend)
│   │   │   ├── Notices.css          # Notice board styling
│   │   │   ├── Contact.jsx          # Contact info & admission enquiry form
│   │   │   ├── Contact.css          # Contact form styling
│   │   │   ├── Footer.jsx           # School footer with links & office timings
│   │   │   └── Footer.css           # Footer styling
│   │   ├── App.jsx                  # Main page assembler
│   │   ├── App.css                  # General page layout styling
│   │   ├── index.css                # Global CSS variables, colors, and resets
│   │   └── main.jsx                 # React root entry point
│   ├── index.html                   # HTML template
│   ├── package.json                 # React & Vite dependencies
│   └── vite.config.js               # Simple Vite configuration
│
└── README.md                        # Documentation & setup guide
```

---

## 🛠️ Running Individually (Optional)

If you ever wish to run them in separate terminals:

### Backend Only:
```bash
cd backend
npm start
```

### Frontend Only:
```bash
cd frontend
npm run dev
```

---

## 🌐 Backend API Endpoints

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/health` | Checks if the backend server is running smoothly |
| `GET` | `/api/announcements` | Fetches the latest school notices and circulars |
| `POST` | `/api/contact` | Submits an admission inquiry or parent message |

---

## 🎨 Styling with Pure CSS

This website uses clean, standard **Pure CSS** (`.css` files):
- **Global Theme & Colors**: Found in `frontend/src/index.css`. You can easily change the school colors (navy blue `--primary-color`, gold `--secondary-color`, etc.).
- **Component Styles**: Each component has its own dedicated `.css` file (e.g., `Hero.css`, `Navbar.css`, `Notices.css`) making it effortless to customize without touching complicated configuration files.

---

## ✨ Features Included

1. **Brand Navigation Bar**: Includes school badge (`GPS`), brand title, and responsive mobile navigation menu.
2. **Hero Banner**: Eye-catching banner with school motto, quick statistics (students count, pass rate, faculty count), and action buttons.
3. **About Section**: Core values, infrastructure highlights (Smart Classrooms, Laboratories, Library, Sports).
4. **Academic Wings**: Distinct breakdown of Kindergarten, Primary, Middle, and Secondary Wings.
5. **Interactive Notice Board**: Fetches announcements directly from the backend API, with fallback support if backend is temporarily offline.
6. **Admission / Enquiry Form**: Parents can submit questions and admission applications directly to the backend.
7. **Complete Footer**: Campus address, office timings, phone numbers, and quick links.
