import jwt from "jsonwebtoken";
import User from "../models/User.js";

/**
 * Protect Middleware
 * Secures routes by verifying the provided JWT token.
 * Validates the token, checks if the user exists, and attaches the user object to the request.
 */
export const protect = async (req, res, next) => {
  let token = req.headers.authorization;

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.id;

    const user = await User.findById(userId);

    if (!user) {
      return res.json({
        success: false,
        message: "Not Authorised User Not found",
      });
    }

    req.user = user;
    next();
  } catch (error) {
    res.status(401).json({ message: "Not authorised Token failed" });
  }
};
