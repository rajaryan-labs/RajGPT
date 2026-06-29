import User from "../models/User.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import Chat from "../models/Chat.js";

// Generate JWT
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: "30d",
  });
};

/**
 * API Controller to register a new user.
 * Checks for existing email, creates the user (password hashed via schema hook),
 * and returns a JWT token.
 */
export const registerUser = async (req, res) => {
  const { name, email, password } = req.body;

  try {
    const userExists = await User.findOne({ email });

    if (userExists) {
      return res.json({ success: false, message: "User Already exists" });
    }

    const user = await User.create({ name, email, password });

    const token = generateToken(user._id);
    res.json({ success: true, token });
  } catch (error) {
    return res.json({ success: false, message: error.message });
  }
};

/**
 * API Controller to login an existing user.
 * Validates the email and password, and returns a JWT token on success.
 */
export const loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (user) {
      const isMatch = await bcrypt.compare(password, user.password);

      if (isMatch) {
        const token = generateToken(user._id);
        return res.json({ success: true, token });
      }
    }

    return res.json({ success: false, message: "Invalid Email or Password" });
  } catch (error) {
    return res.json({ success: false, message: error.message });
  }
};

/**
 * API Controller to get the current authenticated user's data.
 */
export const getUser = async (req, res) => {
  try {
    const user = req.user;
    return res.json({ success: true, user });
  } catch (error) {
    return res.json({ success: false, message: error.message });
  }
};

/**
 * API Controller to get all published images for the community gallery.
 * Uses MongoDB aggregation to find messages with isImage=true and isPublished=true.
 */
export const getPublishedImages = async (req, res) => {
  try {
    const publishedImageMessages = await Chat.aggregate([
      { $unwind: "$messages" },
      {
        $match: {
          "messages.isImage": true,
          "messages.isPublished": true,
        },
      },
      {
        $project: {
          _id: 0,
          chatId: "$_id",
          messageId: "$messages._id",
          userId: "$userId",
          imageUrl: "$messages.content",
          userName: "$userName",
        },
      },
    ]);
    res.json({
      success: true,
      images: publishedImageMessages.reverse(),
    });
  } catch (error) {
    return res.json({ success: false, message: error.message });
  }
};

/**
 * API Controller to unpublish a community image.
 * Ensures the logged in user owns the image before unpublishing.
 */
export const unpublishImage = async (req, res) => {
  try {
    const userId = req.user._id;
    const { chatId, messageId } = req.body;

    const chat = await Chat.findOne({ _id: chatId, userId });
    if (!chat) {
      return res.json({ success: false, message: "Chat not found or unauthorized" });
    }

    const message = chat.messages.id(messageId);
    if (!message) {
      return res.json({ success: false, message: "Image not found" });
    }

    if (message.isPublished) {
      message.isPublished = false;
      await chat.save();
    }

    return res.json({ success: true, message: "Image removed from community" });
  } catch (error) {
    return res.json({ success: false, message: error.message });
  }
};

