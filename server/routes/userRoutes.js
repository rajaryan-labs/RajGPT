import express from "express";
import {
  getPublishedImages,
  getUser,
  loginUser,
  registerUser,
  unpublishImage,
} from "../controllers/userController.js";
import { protect } from "../middlewares/auth.js";

/**
 * User Routes
 * Defines endpoints for user authentication, retrieving user data,
 * and fetching publicly published images for the community.
 */
const userRouter = express.Router();
userRouter.post("/register", registerUser);
userRouter.post("/login", loginUser);
userRouter.get("/data", protect, getUser);
userRouter.get("/published-images", getPublishedImages);
userRouter.post("/unpublish-image", protect, unpublishImage);

export default userRouter;
