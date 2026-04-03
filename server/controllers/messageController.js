import Chat from "../models/Chat.js";
import openai from "../configs/openai.js";

// Text-based AI Chat Message Controller
export const textMessageController = async (req, res) => {
  try {
    const userId = req.user._id;
    const { chatId, prompt } = req.body;

    const chat = await Chat.findOne({ userId, _id: chatId });
    chat.messages.push({
      role: "user",
      content: prompt,
      timestamp: Date.now(),
      isImage: false,
    });

    const { choices } = await openai.chat.completions.create({
      model: "gemini-2.0-flash",
      messages: [
        { role: "system", content: "You are a helpful assistant." },
        {
          role: "user",
          content: prompt,
        },
      ],
    });

    const reply = choices[0].message.content;

    chat.messages.push({
      role: "assistant",
      content: reply,
      timestamp: Date.now(),
      isImage: false,
    });

    await chat.save();

    res.json({ success: true, message: reply });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};
