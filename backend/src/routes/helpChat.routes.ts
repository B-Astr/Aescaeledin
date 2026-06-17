import { Router } from "express";
import { sendHelpChatMessage } from "../controllers/helpChat.controller";
import { requireFullyAuthenticated } from "../middleware/auth.middleware";

const router = Router();

router.post("/help-chat", requireFullyAuthenticated, sendHelpChatMessage);

export default router;
