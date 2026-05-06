import express from "express";
import { getPlans, purchasePlan } from "../controllers/creditController.js";
import { protect } from "../middlewares/auth.js";

/**
 * Credit Routes
 * Defines endpoints for retrieving available credit plans and processing purchases.
 */
const creditRouter = express.Router();

creditRouter.get("/plan", getPlans);
creditRouter.post("/purchase", protect, purchasePlan);

export default creditRouter;
