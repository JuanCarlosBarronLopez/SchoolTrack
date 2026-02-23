import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes as RouterRoutes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import { lazy, Suspense } from "react";
import ErrorBoundary from "@/components/ErrorBoundary";

const Index = lazy(() => import("./pages/Index"));
const Auth = lazy(() => import("./pages/Auth"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const Students = lazy(() => import("./pages/Students"));
const Vehicles = lazy(() => import("./pages/Vehicles"));
const RoutesPage = lazy(() => import("./pages/Routes"));
const Drivers = lazy(() => import("./pages/Drivers"));
const Profile = lazy(() => import("./pages/Profile"));
const Users = lazy(() => import("./pages/Users"));
const LocationTracking = lazy(() => import("./pages/LocationTracking"));
const AdminLocations = lazy(() => import("./pages/AdminLocations"));
const NotFound = lazy(() => import("./pages/NotFound"));

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <ErrorBoundary>
            <Suspense fallback={
              <div className="flex h-screen w-full items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-blue-500 border-opacity-50"></div>
              </div>
            }>
              <RouterRoutes>
                <Route path="/" element={<Index />} />
                <Route path="/auth" element={<Auth />} />
                <Route
                  path="/dashboard"
                  element={
                    <ProtectedRoute>
                      <Dashboard />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/students"
                  element={
                    <ProtectedRoute>
                      <Students />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/vehicles"
                  element={
                    <ProtectedRoute>
                      <Vehicles />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/routes"
                  element={
                    <ProtectedRoute>
                      <RoutesPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/drivers"
                  element={
                    <ProtectedRoute>
                      <Drivers />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/profile"
                  element={
                    <ProtectedRoute>
                      <Profile />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/users"
                  element={
                    <ProtectedRoute requiredRole="admin">
                      <Users />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/location"
                  element={
                    <ProtectedRoute>
                      <LocationTracking />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin/locations"
                  element={
                    <ProtectedRoute requiredRole="admin">
                      <AdminLocations />
                    </ProtectedRoute>
                  }
                />
                <Route path="*" element={<NotFound />} />
              </RouterRoutes>
            </Suspense>
          </ErrorBoundary>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
