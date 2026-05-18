import Chat from "../models/Chat.js";
import User from "../models/User.js";
import gemini from "../configs/gemini.js";
import axios from "axios";
import imagekit from "../configs/imagekit.js";

/**
 * API Controller for text-based chat messages.
 * Uses the Gemini API to generate a response, saves both user and AI messages,
 * and deducts 1 credit from the user's account.
 */
export const textMessageController = async (req, res) => {
  try {
    const userId = req.user._id;
    // Check credits
    if (req.user.credits < 1) {
      return res.json({
        success: false,
        message: "You Don't Have Enough Credits to Use This Feature",
      });
    }
    const { chatId, prompt } = req.body;

    const chat = await Chat.findOne({ userId, _id: chatId });
    if (!chat) {
      return res.json({ success: false, message: "Chat not found" });
    }
    chat.messages.push({
      role: "user",
      content: prompt,
      timestamp: Date.now(),
      isImage: false,
    });

    const response = await gemini.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
    });

    const reply = response.text;
    res.json({ success: true, message: reply });

    chat.messages.push({
      role: "assistant",
      content: reply,
      timestamp: Date.now(),
      isImage: false,
    });

    await chat.save();

    await User.updateOne({ _id: userId }, { $inc: { credits: -1 } });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

/**
 * API Controller for AI image generation.
 * Generates an image using ImageKit (which internally calls an AI generator),
 * uploads it to the media library, saves the message, and deducts 2 credits.
 */
export const imageMessageController = async (req, res) => {
  try {
    const userId = req.user._id;
    // Check credits
    if (req.user.credits < 2) {
      return res.json({
        success: false,
        message: "You Don't Have Enough Credits to Use This Feature",
      });
    }
    const { prompt, chatId, isPublished } = req.body;
    // Find chat
    const chat = await Chat.findOne({ userId, _id: chatId });
    if (!chat) {
      return res.json({ success: false, message: "Chat not found" });
    }
    // Push user message
    chat.messages.push({
      role: "user",
      content: prompt,
      timestamp: Date.now(),
      isImage: false,
    });

    // Encode the prompt
    const encodedPrompt = encodeURIComponent(prompt);

    // Construct AI generation URL using a free reliable service (pollinations.ai) since ImageKit AI is returning 500
    const generatedImageUrl = `https://image.pollinations.ai/prompt/${encodedPrompt}?width=800&height=800&nologo=true`;

    // Trigger generation by fetching from the AI service
    const aiImageResponse = await axios.get(generatedImageUrl, {
      responseType: "arraybuffer",
    });

    // Convert to Base64
    const base64Image = `data:image/png;base64,${Buffer.from(aiImageResponse.data, "binary").toString("base64")}`;

    // Upload to ImageKit Media Library
    const uploadResponse = await imagekit.files.upload({
      file: base64Image,
      fileName: `${Date.now()}.png`,
      folder: "rajgpt",
    });

    const reply = {
      role: "assistant",
      content: uploadResponse.url,
      timestamp: Date.now(),
      isImage: true,
      isPublished,
    };

    res.json({ success: true, message: reply });
    chat.messages.push(reply);
    await chat.save();

    // Deduct credit
    await User.updateOne({ _id: userId }, { $inc: { credits: -2 } });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};
