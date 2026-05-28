// backend/src/routes/companyJobs.routes.ts
import { Router } from "express";
import {
  createJobPost,
  getMyJobPosts,
  updateMyJobPost,
  deactivateMyJobPost,
  getPublicJobPosts,
  getPublicJobById,
} from "../controllers/companyJobs.controller";
import { requireFullyAuthenticated } from "../middleware/auth.middleware";
import { requireRole } from "../middleware/requireRole.middleware";

const router = Router();

// públicas
router.get("/public/jobs", getPublicJobPosts);
router.get("/public/jobs/:id", getPublicJobById);

// privadas para EMPRESA
router.post(
  "/company/jobs",
  requireFullyAuthenticated,
  requireRole("EMPRESA"),
  createJobPost
);

router.get(
  "/company/jobs/mine",
  requireFullyAuthenticated,
  requireRole("EMPRESA"),
  getMyJobPosts
);

router.put(
  "/company/jobs/:id",
  requireFullyAuthenticated,
  requireRole("EMPRESA"),
  updateMyJobPost
);

router.patch(
  "/company/jobs/:id/deactivate",
  requireFullyAuthenticated,
  requireRole("EMPRESA"),
  deactivateMyJobPost
);

export default router;