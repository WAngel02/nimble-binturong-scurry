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
import UnderConstruction from "./pages/UnderConstruction";
import AppointmentsPage from "./pages/admin/AppointmentsPage";
import AdminRoutes from "./components/admin/AdminRoutes";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            {/* Rutas Públicas */}
            <Route path="/" element={<Index />} />
            <Route path="/agendar-cita" element={<AppointmentPage />} />
            <Route path="/admin/login" element={<AdminLogin />} />

            {/* Rutas para Admin y Doctor */}
            <Route element={<AdminRoutes allowedRoles={['admin', 'doctor']} />}>
              <Route path="/admin/dashboard" element={<DashboardPage />} />
              <Route path="/admin/appointments" element={<AppointmentsPage />} />
              <Route path="/admin/help" element={<UnderConstruction />} />
              <Route path="/admin/settings" element={<UnderConstruction />} />
            </Route>

            {/* Rutas solo para Admin */}
            <Route element={<AdminRoutes allowedRoles={['admin']} />}>
              <Route path="/admin/doctores" element={<DoctoresPage />} />
              <Route path="/admin/pacientes" element={<PacientesPage />} />
              <Route path="/admin/pacientes/:id" element={<PatientProfilePage />} />
              <Route path="/admin/administration" element={<UnderConstruction />} />
            </Route>

            {/* Ruta para página no encontrada */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;