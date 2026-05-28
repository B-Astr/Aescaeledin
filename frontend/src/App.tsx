// frontend/src/App.tsx
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

// Pages principales
import HomePage from "./pages/HomePage";
import Login from "./pages/Login";
import AboutPage from "./pages/AboutPage";
import InfoPage from "./pages/InfoPage";
import ProfilePage from "./pages/ProfilePage";

// Jobs (empresa + público)
import JobsPage from "./pages/JobsPage";
import JobDetailPage from "./pages/JobDetailPage";
import CompanyJobsPage from "./pages/CompanyJobsPage";
import CreateJobPage from "./pages/CreateJobPage";
import EditJobPage from "./pages/EditJobPage";
import CompanyJobApplicationsPage from "./pages/CompanyJobApplicationsPage";

// Profesionales
import ProfessionalsPage from "./pages/ProfessionalsPage";
import ProfessionalServiceDetailPage from "./pages/ProfessionalServiceDetailPage";
import ProServicesPage from "./pages/ProServicesPage";
import CreateProfessionalServicePage from "./pages/CreateProfessionalServicePage";
import EditProfessionalServicePage from "./pages/EditProfessionalServicePage";
import ProfessionalServiceSelectionsPage from "./pages/ProfessionalServiceSelectionsPage";

// Empresas
import CompaniesPage from "./pages/CompaniesPage";
import CompanyRequestsPage from "./pages/CompanyRequestsPage";

// Seguridad
import ProtectedRoute from "./components/ProtectedRoute";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* PUBLICAS */}
        <Route path="/" element={<HomePage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/info" element={<InfoPage />} />
        <Route path="/login" element={<Login />} />

        <Route path="/jobs" element={<JobsPage />} />
        <Route path="/jobs/:id" element={<JobDetailPage />} />

        <Route path="/professionals" element={<ProfessionalsPage />} />
        <Route
          path="/professionals/:id"
          element={<ProfessionalServiceDetailPage />}
        />

        {/* PRIVADAS GENERALES */}
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <ProfilePage />
            </ProtectedRoute>
          }
        />

        {/* EMPRESA */}
        <Route
          path="/company/jobs"
          element={
            <ProtectedRoute allowedRoles={["EMPRESA"]}>
              <CompanyJobsPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/company/jobs/new"
          element={
            <ProtectedRoute allowedRoles={["EMPRESA"]}>
              <CreateJobPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/company/jobs/:id/edit"
          element={
            <ProtectedRoute allowedRoles={["EMPRESA"]}>
              <EditJobPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/company/jobs/:id/applications"
          element={
            <ProtectedRoute allowedRoles={["EMPRESA"]}>
              <CompanyJobApplicationsPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/company/requests"
          element={
            <ProtectedRoute allowedRoles={["EMPRESA"]}>
              <CompanyRequestsPage />
            </ProtectedRoute>
          }
        />

        {/* PROFESIONAL */}
        <Route
          path="/pro/services"
          element={
            <ProtectedRoute allowedRoles={["PRO"]}>
              <ProServicesPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/pro/services/new"
          element={
            <ProtectedRoute allowedRoles={["PRO"]}>
              <CreateProfessionalServicePage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/pro/services/:id/edit"
          element={
            <ProtectedRoute allowedRoles={["PRO"]}>
              <EditProfessionalServicePage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/pro/services/:id/selections"
          element={
            <ProtectedRoute allowedRoles={["PRO"]}>
              <ProfessionalServiceSelectionsPage />
            </ProtectedRoute>
          }
        />

        {/* SOLO PROFESIONAL VE EMPRESAS */}
        <Route
          path="/companies"
          element={
            <ProtectedRoute allowedRoles={["PRO"]}>
              <CompaniesPage />
            </ProtectedRoute>
          }
        />

        {/* FALLBACK */}
        <Route path="*" element={<Navigate to="/" replace />} />

      </Routes>
    </BrowserRouter>
  );
}
