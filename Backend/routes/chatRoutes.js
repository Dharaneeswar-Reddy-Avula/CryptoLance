// routes/chatRoutes.js
import express from 'express';
import authMiddleware from '../middlewares/authMiddleware.js';
import { getUsersForSidebar,getMessages,sendMessage,deleteMessage } from '../controllers/chatControllers.js';
const router = express.Router();

router.get("/users",authMiddleware,getUsersForSidebar);
router.get("/:id",authMiddleware,getMessages);
router.post("/send/:id",authMiddleware,sendMessage)
router.delete("/message/:messageId",authMiddleware,deleteMessage)
export default router;