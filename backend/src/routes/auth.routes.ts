// backend/src/routes/auth.routes.ts
import { Router } from "express";
import {
  googleLogin,
  me,
  completeLogin,
  updateProfile,
} from "../controllers/auth.controller";
import {
  authenticateToken,
  requireFullyAuthenticated,
} from "../middleware/auth.middleware";
import { setupOtp, verifyOtp } from "../controllers/otp.controller";

const router = Router();

router.post("/google", googleLogin);

router.post("/otp/setup", authenticateToken, setupOtp);

router.post("/otp/verify", authenticateToken, verifyOtp);

router.get("/me", requireFullyAuthenticated, me);

router.put("/profile", requireFullyAuthenticated, updateProfile);

router.post("/complete-login", authenticateToken, completeLogin);

export default router;
