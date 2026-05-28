// backend/src/routes/professionalServices.routes.ts
import { Router } from "express";
import {
  createProfessionalService,
  getMyProfessionalServices,
  updateMyProfessionalService,
  deactivateMyProfessionalService,
  getPublicProfessionalServices,
  getPublicProfessionalServiceById,
} from "../controllers/professionalServices.controller";
import { requireFullyAuthenticated } from "../middleware/auth.middleware";
import { requireRole } from "../middleware/requireRole.middleware";

const router = Router();

// públicas
router.get("/public/professionals", getPublicProfessionalServices);
router.get("/public/professionals/:id", getPublicProfessionalServiceById);

// privadas para PRO
router.post(
  "/pro/services",
  requireFullyAuthenticated,
  requireRole("PRO"),
  createProfessionalService
);

router.get(
  "/pro/services/mine",
  requireFullyAuthenticated,
  requireRole("PRO"),
  getMyProfessionalServices
);

router.put(
  "/pro/services/:id",
  requireFullyAuthenticated,
  requireRole("PRO"),
  updateMyProfessionalService
);

router.patch(
  "/pro/services/:id/deactivate",
  requireFullyAuthenticated,
  requireRole("PRO"),
  deactivateMyProfessionalService
);

export default router;