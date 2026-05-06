import express from "express";
import {
  createChat,
  deleteChat,
  getChat,
} from "../controllers/chatController.js";
import { protect } from "../middlewares/auth.js";

/**
 * Chat Routes
 * Defines endpoints for managing chat sessions.
 * All routes here are protected and require a valid user token.
 */
const chatRouter = express.Router();

chatRouter.get("/create", protect, createChat);
chatRouter.get("/get", protect, getChat);
chatRouter.post("/delete", protect, deleteChat);

export default chatRouter;
