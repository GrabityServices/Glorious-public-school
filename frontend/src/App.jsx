import React from 'react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import About from './components/About';
import Academics from './components/Academics';
import Notices from './components/Notices';
import Contact from './components/Contact';
import Footer from './components/Footer';
import './App.css';

function App() {
  return (
    <div className="app-container">
      {/* Navigation Bar */}
      <Navbar />

      {/* Main Content Sections */}
      <main>
        <Hero />
        <About />
        <Academics />
        <Notices />
        <Contact />
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}

export default App;
