// import { OpenAI } from "openai";

// const openai = new OpenAI({
//   apiKey: process.env.GEMINI_API_KEY,
//   baseURL: "https://generativelanguage.googleapis.com/v1beta/openai/",
// });

// export default openai;

import { GoogleGenAI } from "@google/genai";

/**
 * OpenAI-compatible API Configuration (via Gemini API)
 * Initializes a client using the OpenAI compatibility layer provided by the Gemini API.
 * This allows using OpenAI SDK/patterns with the Gemini backend.
 */
const openai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  baseURL: "https://generativelanguage.googleapis.com/v1beta/openai/",
});

export default openai;
