import express from "express";
import { protect } from "../middlewares/auth.js";
import {
  imageMessageController,
  textMessageController,
} from "../controllers/messageController.js";

/**
 * Message Routes
 * Defines endpoints for handling AI interactions (text generation and image generation).
 * Protected routes require a valid user token.
 */
const messageRouter = express.Router();

messageRouter.post("/text", protect, textMessageController);
messageRouter.post("/image", protect, imageMessageController);

export default messageRouter;
