import dotenv from "dotenv";
dotenv.config();
import express from "express";
import axios from "axios";

const router = express.Router();

// --- Mood-to-Tag Classifier Route (Kept as is) ---
router.post("/moodtags", async (req, res) => {
  const { phrase } = req.body;
  if (!phrase || typeof phrase !== "string" || phrase.trim().length < 3) {
    return res.status(400).json({ error: "A valid phrase is required." });
  }

  const systemPrompt = `You are a smart movie mood classifier. Return a JSON array of 3-5 single-word mood tags based on the input phrase. Example: ["Dark", "Suspenseful", "Noir"]. Do not output anything else.`;

  try {
    const response = await axios.post(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        model: "mistralai/mistral-7b-instruct",
        messages: [{ role: "system", content: systemPrompt }, { role: "user", content: phrase }],
        temperature: 0.5
      },
      {
        headers: {
          "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
          "Content-Type": "application/json",
          "HTTP-Referer": "https://visualcineaste.vercel.app",
          "X-Title": "Visual Cineaste",
        }
      }
    );
    
    const reply = response.data?.choices?.[0]?.message?.content;
    try {
        res.status(200).json({ tags: JSON.parse(reply) });
    } catch (e) {
        res.status(200).json({ tags: [reply] });
    }

  } catch (err) {
    console.error("Mood API Error:", err.message);
    res.status(500).json({ error: "OpenRouter API error" });
  }
});

// --- Main GPT Discovery Route (PROFESSIONAL UPGRADE) ---
router.post("/gpt", async (req, res) => {
  const { messages, model, temperature } = req.body;

  if (!messages || !Array.isArray(messages)) {
    return res.status(400).json({ error: "Messages array is required" });
  }

  if (!process.env.OPENROUTER_API_KEY) {
    return res.status(500).json({ error: "Server configuration error: Missing API Key" });
  }

  // 🔥 1. PROFESSIONAL SYSTEM PROMPT
  // This forces the AI to be a "Senior Curator" and return specific JSON for your UI.
  const systemInstruction = {
    role: "system",
    content: `You are a sophisticated, high-end film curator and critic. 
    
    Your task is to recommend 5-6 films based on the user's input.
    
    CRITICAL INSTRUCTION: You must return ONLY a raw JSON array of objects. Do not include markdown formatting (like \`\`\`json).
    
    Structure for recommendations:
    [
      {
        "title": "Exact Movie Title",
        "year": "YYYY",
        "reason": "A concise, professional 1-sentence curator's note explaining why this fits the mood."
      }
    ]
    
    If the user asks a general question (e.g., "Who directed Inception?", "Explain Neo-Noir"), strictly return a JSON object like this:
    { "answer": "Your professional, concise, encyclopedic answer here." }
    `
  };

  // Prepend the system instruction to the user's message history
  const apiMessages = [systemInstruction, ...messages];

  try {
    // 2. Call OpenRouter API
    const response = await axios.post(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        // Mistral 7B Instruct is fast and follows instructions well. 
        // You can swap this for "openai/gpt-3.5-turbo" or "anthropic/claude-3-haiku" if you want.
        model: "mistralai/mistral-7b-instruct", 
        messages: apiMessages,
        temperature: 0.7, // Slightly creative but focused
        max_tokens: 1000,
      },
      {
        headers: {
          "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
          "Content-Type": "application/json",
          "HTTP-Referer": "https://visualcineaste.vercel.app",
          "X-Title": "Visual Cineaste",
        },
      }
    );

    const reply = response.data?.choices?.[0]?.message?.content;
    if (!reply) throw new Error("Empty response from AI");

    // 3. Clean the response
    // AI sometimes adds markdown code blocks despite being told not to. We strip them here.
    const cleanReply = reply.replace(/```json/g, "").replace(/```/g, "").trim();
    
    res.json({ reply: cleanReply });

  } catch (error) {
    console.error("❌ OpenRouter Error:", error.response?.data || error.message);
    res.status(500).json({ 
      error: "Failed to fetch from AI provider", 
      details: error.response?.data || error.message 
    });
  }
});

export default router;
