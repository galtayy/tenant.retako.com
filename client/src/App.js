import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';

// Genel Bileşenler
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';

// Sayfalar
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import PropertyForm from './pages/PropertyForm';
import ReportCreate from './pages/ReportCreate';
import ReportDetails from './pages/ReportDetails';
import PhotoUpload from './pages/PhotoUpload';
import ViewReport from './pages/ViewReport';
import NotFound from './pages/NotFound';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Genel Rotalar */}
          <Route path="/" element={<Layout />}>
            <Route index element={<Home />} />
            <Route path="login" element={<Login />} />
            <Route path="register" element={<Register />} />
            
            {/* Korumalı Rotalar */}
            <Route element={<ProtectedRoute />}>
              <Route path="dashboard" element={<Dashboard />} />
              <Route path="properties/new" element={<PropertyForm />} />
              <Route path="properties/:propertyId/reports/new" element={<ReportCreate />} />
              <Route path="reports/:reportId" element={<ReportDetails />} />
              <Route path="reports/:reportId/photos" element={<PhotoUpload />} />
            </Route>
            
            {/* Ev Sahibi için Rapor Görüntüleme (Token ile) */}
            <Route path="view-report/:token" element={<ViewReport />} />
            
            {/* 404 Sayfası */}
            <Route path="*" element={<NotFound />} />
          </Route>
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
