// backend/src/routes/jobApplications.routes.ts
import { Router } from "express";
import {
  applyToJob,
  checkIfApplied,
  getApplicationsForCompanyJob,
  updateApplicationStatus,
} from "../controllers/jobApplications.controller";
import { requireFullyAuthenticated } from "../middleware/auth.middleware";

const router = Router();

// Cliente consulta si ya postuló
router.get("/jobs/:id/applied", requireFullyAuthenticated, checkIfApplied);

// Cliente postula
router.post("/jobs/:id/apply", requireFullyAuthenticated, applyToJob);

// Empresa ve postulaciones de SU job
router.get(
  "/company/jobs/:id/applications",
  requireFullyAuthenticated,
  getApplicationsForCompanyJob
);

// Empresa actualiza estado de una postulación
router.patch(
  "/company/jobs/:jobId/applications/:appId/status",
  requireFullyAuthenticated,
  updateApplicationStatus
);

export default router;