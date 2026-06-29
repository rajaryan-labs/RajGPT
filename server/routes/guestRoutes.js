import express from "express";
import gemini from "../configs/gemini.js";
import axios from "axios";
import imagekit from "../configs/imagekit.js";
import Chat from "../models/Chat.js";

/**
 * Guest Routes
 * Provides unauthenticated access to AI text chat.
 * No credits, no chat persistence — purely stateless.
 */
const guestRouter = express.Router();

/**
 * POST /api/guest/text
 * Accepts a prompt and returns an AI-generated text response.
 * No authentication required. No data is saved.
 */
guestRouter.post("/text", async (req, res) => {
  try {
    const { prompt } = req.body;

    if (!prompt || !prompt.trim()) {
      return res.json({ success: false, message: "Prompt is required" });
    }

    const response = await gemini.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
    });

    const reply = response.text;
    res.json({ success: true, message: reply });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
});

guestRouter.post("/image", async (req, res) => {
  try {
    const { prompt, isPublished } = req.body;

    if (!prompt || !prompt.trim()) {
      return res.json({ success: false, message: "Prompt is required" });
    }

    // Encode the prompt
    const encodedPrompt = encodeURIComponent(prompt);

    // Construct AI generation URL
    const generatedImageUrl = `https://image.pollinations.ai/prompt/${encodedPrompt}?width=800&height=800&nologo=true`;

    // Trigger generation
    const aiImageResponse = await axios.get(generatedImageUrl, {
      responseType: "arraybuffer",
    });

    // Convert to Base64
    const base64Image = `data:image/png;base64,${Buffer.from(aiImageResponse.data, "binary").toString("base64")}`;

    // Upload to ImageKit Media Library
    const uploadResponse = await imagekit.files.upload({
      file: base64Image,
      fileName: `${Date.now()}-guest.png`,
      folder: "rajgpt",
    });

    const reply = {
      role: "assistant",
      content: uploadResponse.url,
      timestamp: Date.now(),
      isImage: true,
      isPublished,
    };

    // If published, save a dummy chat entry so it shows up in Community Images
    if (isPublished) {
      await Chat.create({
        userId: "guest",
        userName: "Unknown",
        name: "Guest Published Image",
        messages: [reply],
      });
    }

    res.json({ success: true, message: reply });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
});

export default guestRouter;
