import React, { useEffect } from 'react'
import { Routes, Route } from "react-router-dom";

import "./App.css";

import Welcome from './pages/Welcome';
import LandingPage from './pages/Landing Page/LandingPage';
import LoginPage from './pages/Login/LoginPage';
import Dashboard from './pages/Dashboard';
import ScanReport from './pages/ScanReport';
import RepoReportsPage from './pages/RepoReportsPage';

function App() {
  return (
    <>
      <div className="h-full w-full">
        <Routes>
          <Route path="/" element={<LandingPage/>}/>
          <Route path="/login" element={<LoginPage/>}/>
          
          <Route path="/dashboard" element={<Dashboard/>}/>
          <Route path="/welcome" element={<Welcome/>}/>
          <Route path="/scanreport" element={<ScanReport/>} />
          <Route path="/reports" element={<RepoReportsPage/>}/>

        

        </Routes>
      </div>
    </>
  );
}

export default App;
