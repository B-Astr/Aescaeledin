// backend/src/routes/companyRequests.routes.ts
import { Router } from "express";
import {
  getPublicCompanies,
  requestEmploymentAtCompany,
  getRequestsForCompany,
} from "../controllers/companyRequests.controller";
import { requireFullyAuthenticated } from "../middleware/auth.middleware";

const router = Router();

router.get("/public/companies", getPublicCompanies);

router.post(
  "/companies/:id/request",
  requireFullyAuthenticated,
  requestEmploymentAtCompany
);

router.get(
  "/company/requests",
  requireFullyAuthenticated,
  getRequestsForCompany
);

export default router;