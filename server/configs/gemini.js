import { GoogleGenAI } from "@google/genai";

/**
 * Gemini API Configuration
 * Initializes the Google GenAI client using the API key from environment variables.
 * This client is used to interact with Gemini models.
 */
const gemini = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

export default gemini;
