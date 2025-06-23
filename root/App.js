// src/App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Admin from './pages/Admin';
import Developer from './pages/Developer';
import QC from './pages/QC';
import './App.css'; // Import your CSS file

function App() {
  return (
    <Router>
      <div className="container">
        <Routes>
          <Route path="/admin" element={<Admin />} />
          <Route path="/developer" element={<Developer />} />
          <Route path="/qc" element={<QC />} />
          <Route path="/" element={<div>Home Page</div>} /> {/* Default route */}
        </Routes>
      </div>
    </Router>
  );
}

export default App;
