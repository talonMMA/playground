import OpenAI from 'openai';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize OpenAI Client
// Use process.env.OPENAI_API_KEY
export const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
    dangerouslyAllowBrowser: false, // Ensure this is only used server-side
});

// Initialize Gemini Client
// Use process.env.GOOGLE_API_KEY
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY || '');

export const getGeminiModel = () => {
    return genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
};
