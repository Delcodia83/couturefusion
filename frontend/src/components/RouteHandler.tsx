import React, { Suspense, lazy } from 'react';
import { Routes, Route } from 'react-router-dom';
import { AuthWrapper } from './AuthWrapper';
import { UserRole } from '../utils/firebaseAdapter';

// Lazy load pages
const Login = lazy(() => import("../pages/Login"));
const Register = lazy(() => import("../pages/Register"));
const ClientDashboard = lazy(() => import("../pages/ClientDashboard"));
const ClientProfile = lazy(() => import("../pages/ClientProfile"));
const TailorDashboard = lazy(() => import("../pages/TailorDashboard"));
const TailorProfile = lazy(() => import("../pages/TailorProfile"));
const AdminDashboard = lazy(() => import("../pages/AdminDashboard"));

// Page loading component
const PageLoader = () => (
  <div className="flex min-h-screen items-center justify-center">
    <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-primary"></div>
  </div>
);

export function RouteHandler() {
  return (
    <Routes>
      <Route path="/login" element={
        <Suspense fallback={<PageLoader />}>
          <Login />
        </Suspense>
      } />
      <Route path="/register" element={
        <Suspense fallback={<PageLoader />}>
          <Register />
        </Suspense>
      } />
      
      {/* Client routes */}
      <Route path="/client-dashboard" element={
        <AuthWrapper requiredRoles={[UserRole.CLIENT]}>
          <Suspense fallback={<PageLoader />}>
            <ClientDashboard />
          </Suspense>
        </AuthWrapper>
      } />
      <Route path="/client-profile" element={
        <AuthWrapper requiredRoles={[UserRole.CLIENT]}>
          <Suspense fallback={<PageLoader />}>
            <ClientProfile />
          </Suspense>
        </AuthWrapper>
      } />
      
      {/* Tailor routes */}
      <Route path="/tailor-dashboard" element={
        <AuthWrapper requiredRoles={[UserRole.TAILOR]}>
          <Suspense fallback={<PageLoader />}>
            <TailorDashboard />
          </Suspense>
        </AuthWrapper>
      } />
      <Route path="/tailor-profile" element={
        <AuthWrapper requiredRoles={[UserRole.TAILOR]}>
          <Suspense fallback={<PageLoader />}>
            <TailorProfile />
          </Suspense>
        </AuthWrapper>
      } />
      
      {/* Admin routes */}
      <Route path="/admin-dashboard" element={
        <AuthWrapper requiredRoles={[UserRole.ADMIN]}>
          <Suspense fallback={<PageLoader />}>
            <AdminDashboard />
          </Suspense>
        </AuthWrapper>
      } />
    </Routes>
  );
}