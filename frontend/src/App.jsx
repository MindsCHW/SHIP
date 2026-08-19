import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from './components/ProtectedRoute';
import LoginPage from './pages/auth/LoginPage';
import ForgotPassword from './pages/auth/ForgotPassword';
import RatingPage from './pages/RatingPage';
import RolePermissionPage from './pages/RolePermissionPage';
import RoadSummaryPage from './pages/RoadSummaryPage';
import RatingDetailPage from './pages/RatingDetailPage';
import DashboardPage from './pages/DashboardPage';
import ClonePage from './pages/ClonePage';
import NotificationPage from './pages/NotificationPage';
import UserManagementPage from './pages/UserManagementPage';
import MasterListPage from './pages/MasterListPage';
import InspectionEnginePage from './pages/InspectionEnginePage';
import RoadwaySamplingPage from './pages/RoadwaySampling/RoadwaySamplingPage';
import SurveyLibraryPage from './pages/SurveyLibraryPage';
import SurveyProcessingPage from './pages/SurveyProcessingPage';
import ImageReviewPage from './pages/ImageReviewPage';
import InspectorApp from './pages/InspectorApp';
import ProfilePage from './pages/ProfilePage';
import ReportsPage from './pages/ReportsPage';
import ShipDashboard from './pages/Ship/ShipDashboard';
import SkipGalleryPage from './pages/SkipGalleryPage';

function App() {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />

      {/* Protected Routes */}
      <Route path="/" element={<ProtectedRoute><Navigate to="/dashboard" replace /></ProtectedRoute>} />
      <Route path="/dashboard" element={<ProtectedRoute allowedRoles={['Admin', 'Administrator', 'HO', 'SPV', 'User']}><DashboardPage /></ProtectedRoute>} />
      <Route path="/demo" element={<ProtectedRoute allowedRoles={['Admin', 'Administrator']}><ClonePage /></ProtectedRoute>} />
      <Route path="/notifications" element={<ProtectedRoute allowedRoles={['Admin', 'Administrator', 'HO', 'SPV', 'User']}><NotificationPage /></ProtectedRoute>} />
      <Route path="/users" element={<ProtectedRoute allowedRoles={['Admin', 'Administrator']}><UserManagementPage /></ProtectedRoute>} />
      <Route path="/master-list" element={<ProtectedRoute allowedRoles={['Admin', 'Administrator']}><MasterListPage /></ProtectedRoute>} />
      <Route path="/inspection-engine" element={<ProtectedRoute allowedRoles={['Admin', 'Administrator']}><InspectionEnginePage /></ProtectedRoute>} />
      <Route path="/roadway-sampling" element={<ProtectedRoute allowedRoles={['Admin', 'Administrator']}><RoadwaySamplingPage /></ProtectedRoute>} />
      <Route path="/survey-library" element={<ProtectedRoute allowedRoles={['Admin', 'Administrator']}><SurveyLibraryPage /></ProtectedRoute>} />
      <Route path="/survey-processing" element={<ProtectedRoute allowedRoles={['Admin', 'Administrator']}><SurveyProcessingPage /></ProtectedRoute>} />
      <Route path="/skip-gallery" element={<ProtectedRoute allowedRoles={['Admin', 'Administrator', 'HO', 'SPV', 'User']}><SkipGalleryPage /></ProtectedRoute>} />
      <Route path="/image-review" element={<ProtectedRoute allowedRoles={['Admin', 'Administrator', 'HO']}><ImageReviewPage /></ProtectedRoute>} />
      <Route path="/rating" element={<ProtectedRoute allowedRoles={['Admin', 'Administrator', 'HO', 'SPV', 'User']}><RatingPage /></ProtectedRoute>} />
      <Route path="/rating/inspector/:batchId" element={<ProtectedRoute allowedRoles={['Admin', 'Administrator', 'HO', 'SPV', 'User']}><InspectorApp /></ProtectedRoute>} />
      <Route path="/role" element={<ProtectedRoute allowedRoles={['Admin', 'Administrator']}><RolePermissionPage /></ProtectedRoute>} />
      <Route path="/rating/:roadId" element={<ProtectedRoute allowedRoles={['Admin', 'Administrator', 'HO', 'SPV', 'User']}><RoadSummaryPage /></ProtectedRoute>} />
      <Route path="/rating/:roadId/detail/:detailId" element={<ProtectedRoute allowedRoles={['Admin', 'Administrator', 'HO', 'SPV', 'User']}><RatingDetailPage /></ProtectedRoute>} />
      <Route path="/profile" element={<ProtectedRoute allowedRoles={['Admin', 'Administrator', 'HO', 'SPV', 'User']}><ProfilePage /></ProtectedRoute>} />
      <Route path="/reports" element={<ProtectedRoute allowedRoles={['Admin', 'Administrator', 'HO']}><ReportsPage /></ProtectedRoute>} />
      <Route path="/ship" element={<ProtectedRoute allowedRoles={['Admin', 'Administrator', 'HO']}><ShipDashboard /></ProtectedRoute>} />
    </Routes>
  );
}

export default App;
