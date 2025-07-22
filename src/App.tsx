
import React from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { NotificationToastContainer } from "@/components/ui/notification-toast";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ThemeProvider } from "@/hooks/useTheme";
import { SupervisorProvider } from "@/contexts/SupervisorContext";
import { Layout } from "@/components/Layout";
import { useAuth } from "@/hooks/useAuth";
import Index from "./pages/Index";
import Login from "./pages/Login";
import Products from "./pages/Products";
import Movements from "./pages/Movements";
import Reports from "./pages/Reports";
import Alerts from "./pages/Alerts";
import Users from "./pages/Users";
import Settings from "./pages/Settings";
import OrderRequests from "./pages/OrderRequests";
import OrderManagement from "./pages/OrderManagement";
import NotFound from "./pages/NotFound";

// Create QueryClient instance outside of component to prevent recreation
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

function ProtectedRoute({ children, allowedRoles }: { children: React.ReactNode, allowedRoles?: string[] }) {
  const { user, userProfile, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Carregando...</p>
        </div>
      </div>
    );
  }
  
  if (!user) {
    console.log('No user found, redirecting to login');
    return <Navigate to="/login" replace />;
  }

  // Check role-based access if allowedRoles is specified
  if (allowedRoles && userProfile && !allowedRoles.includes(userProfile.role)) {
    console.log('User role not allowed for this route, redirecting to dashboard');
    return <Navigate to="/" replace />;
  }
  
  return <>{children}</>;
}

function AuthRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Carregando...</p>
        </div>
      </div>
    );
  }
  
  if (user) {
    console.log('User already authenticated, redirecting to dashboard');
    return <Navigate to="/" replace />;
  }
  
  return <>{children}</>;
}

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="system" storageKey="almoxarifado-theme">
        <SupervisorProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <NotificationToastContainer />
            <BrowserRouter>
            <Routes>
              <Route path="/login" element={
                <AuthRoute>
                  <Login />
                </AuthRoute>
              } />
              <Route path="/" element={
                <ProtectedRoute>
                  <Index />
                </ProtectedRoute>
              } />
              <Route path="/products" element={
                <ProtectedRoute allowedRoles={['admin', 'gestor_almoxarifado']}>
                  <Layout>
                    <Products />
                  </Layout>
                </ProtectedRoute>
              } />
              <Route path="/movements" element={
                <ProtectedRoute allowedRoles={['admin', 'gestor_almoxarifado']}>
                  <Layout>
                    <Movements />
                  </Layout>
                </ProtectedRoute>
              } />
              <Route path="/order-requests" element={
                <ProtectedRoute allowedRoles={['admin', 'gestor_almoxarifado', 'supervisor_geral']}>
                  <Layout>
                    <OrderRequests />
                  </Layout>
                </ProtectedRoute>
              } />
              <Route path="/order-management" element={
                <ProtectedRoute allowedRoles={['admin', 'gestor_almoxarifado', 'supervisor_geral']}>
                  <Layout>
                    <OrderManagement />
                  </Layout>
                </ProtectedRoute>
              } />
              <Route path="/reports" element={
                <ProtectedRoute allowedRoles={['admin', 'gestor_almoxarifado']}>
                  <Layout>
                    <Reports />
                  </Layout>
                </ProtectedRoute>
              } />
              <Route path="/alerts" element={
                <ProtectedRoute allowedRoles={['admin', 'gestor_almoxarifado']}>
                  <Layout>
                    <Alerts />
                  </Layout>
                </ProtectedRoute>
              } />
              <Route path="/users" element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <Layout>
                    <Users />
                  </Layout>
                </ProtectedRoute>
              } />
              <Route path="/settings" element={
                <ProtectedRoute allowedRoles={['admin', 'gestor_almoxarifado']}>
                  <Layout>
                    <Settings />
                  </Layout>
                </ProtectedRoute>
              } />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </SupervisorProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
};

export default App;
