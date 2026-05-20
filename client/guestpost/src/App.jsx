import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";

// Layout & Pages
import Layout from "./LandingPage/components/Layout";
import LandingPage from "./LandingPage/LandingPage";
import Register from "./pages/Register";
import Login from "./pages/Login";
import ForgotPassword from "./pages/ForgotPassword";
import Dashboard from "./pages/Dashboard";
import AddListing from "./pages/AddListing";
import AdminDashboard from "./pages/AdminDashboard";
import Orders from "./pages/Orders";
import OrderDetails from "./pages/OrderDetails";
import Profile from "./pages/Profile";
import SellerProfile from "./pages/SellerProfile";
import AdminUsers from "./pages/AdminUsers";
import AdminLogs from "./pages/AdminLogs";
import MyListings from "./pages/MyListings";
import EditListing from "./pages/EditListing";

/**
 * Enhanced ProtectedRoute
 * @param {Array} allowedRoles 
 */
const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  const userInfoString = localStorage.getItem("userInfo");
  if (!userInfoString) return <Navigate to="/login" />;
  
  const userInfo = JSON.parse(userInfoString);
  
  // RBAC Check: If specific roles are required and user doesn't have them
  if (allowedRoles.length > 0 && !allowedRoles.includes(userInfo.role)) {
    return <Navigate to="/marketplace" replace />;
  }

  return <Layout>{children}</Layout>;
};

function App() {
  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />

        {/* General Protected Routes (Available to all logged-in users) */}
        <Route path="/marketplace" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/orders" element={<ProtectedRoute><Orders /></ProtectedRoute>} />
        <Route path="/orders/:id" element={<ProtectedRoute><OrderDetails /></ProtectedRoute>} />
        <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
        <Route path="/seller/:id" element={<ProtectedRoute><SellerProfile /></ProtectedRoute>} />

        {/* Seller & Admin Only Routes */}
        <Route path="/add-listing" element={
          <ProtectedRoute allowedRoles={['seller', 'admin']}>
            <AddListing />
          </ProtectedRoute>
        } />
        <Route path="/my-listings" element={
          <ProtectedRoute allowedRoles={['seller', 'admin']}>
            <MyListings />
          </ProtectedRoute>
        } />
        <Route path="/edit-listing/:id" element={
          <ProtectedRoute allowedRoles={['seller', 'admin']}>
            <EditListing />
          </ProtectedRoute>
        } />

        {/* Admin Exclusive Routes */}
        <Route path="/admin" element={<ProtectedRoute allowedRoles={['admin']}><AdminDashboard /></ProtectedRoute>} />
        <Route path="/admin/users" element={<ProtectedRoute allowedRoles={['admin']}><AdminUsers /></ProtectedRoute>} />
        <Route path="/admin/logs" element={<ProtectedRoute allowedRoles={['admin']}><AdminLogs /></ProtectedRoute>} />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
}

export default App;