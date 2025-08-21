import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/providers/AuthProvider";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import AppointmentPage from "./pages/AppointmentPage";
import AdminLogin from "./pages/admin/Login";
import DashboardPage from "./pages/admin/DashboardPage";
import DoctoresPage from "./pages/admin/DoctoresPage";
import PacientesPage from "./pages/admin/PacientesPage";
import PatientProfilePage from "./pages/admin/PatientProfilePage";
import ProtectedRoute from "./components/ProtectedRoute";
import AdminLayout from "./components/admin/AdminLayout";
import UnderConstruction from "./pages/UnderConstruction";
import AppointmentsPage from "./pages/admin/AppointmentsPage";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Index />} />
            <Route path="/agendar-cita" element={<AppointmentPage />} />

            {/* Admin Routes */}
            <Route path="/admin/login" element={<AdminLogin />} />
            <Route 
              path="/admin/dashboard" 
              element={
                <ProtectedRoute allowedRoles={['admin', 'doctor']}>
                  <AdminLayout>
                    <DashboardPage />
                  </AdminLayout>
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/admin/doctores" 
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <AdminLayout>
                    <DoctoresPage />
                  </AdminLayout>
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/admin/pacientes" 
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <AdminLayout>
                    <PacientesPage />
                  </AdminLayout>
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/admin/pacientes/:id" 
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <AdminLayout>
                    <PatientProfilePage />
                  </AdminLayout>
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/admin/appointments" 
              element={
                <ProtectedRoute allowedRoles={['admin', 'doctor']}>
                  <AdminLayout>
                    <AppointmentsPage />
                  </AdminLayout>
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/admin/administration" 
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <AdminLayout>
                    <UnderConstruction />
                  </AdminLayout>
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/admin/help" 
              element={
                <ProtectedRoute allowedRoles={['admin', 'doctor']}>
                  <AdminLayout>
                    <UnderConstruction />
                  </AdminLayout>
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/admin/settings" 
              element={
                <ProtectedRoute allowedRoles={['admin', 'doctor']}>
                  <AdminLayout>
                    <UnderConstruction />
                  </AdminLayout>
                </ProtectedRoute>
              } 
            />

            {/* Catch-all */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;