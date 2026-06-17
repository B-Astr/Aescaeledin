import { Router } from "express";
import { searchSemanticContent } from "../controllers/search.controller";
import { requireFullyAuthenticated } from "../middleware/auth.middleware";

const router = Router();

router.get("/search", requireFullyAuthenticated, searchSemanticContent);

export default router;
