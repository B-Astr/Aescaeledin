// backend/src/routes/professionalServiceSelections.routes.ts
import { Router } from "express";
import {
  selectProfessionalService,
  getSelectionsForProfessionalService,
} from "../controllers/professionalServiceSelections.controller";
import { requireFullyAuthenticated } from "../middleware/auth.middleware";

const router = Router();

// Cliente selecciona servicio
router.post(
  "/professionals/:id/select",
  requireFullyAuthenticated,
  selectProfessionalService
);

// Profesional ve quién seleccionó SU servicio
router.get(
  "/pro/services/:id/selections",
  requireFullyAuthenticated,
  getSelectionsForProfessionalService
);

export default router;