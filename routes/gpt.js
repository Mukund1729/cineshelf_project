import dotenv from "dotenv";
dotenv.config();
import express from "express";
import axios from "axios";

const router = express.Router();

// --- Mood-to-Tag Classifier Route ---
router.post("/moodtags", async (req, res) => {
  const { phrase } = req.body;
  if (!phrase || typeof phrase !== "string" || phrase.trim().length < 3) {
    return res.status(400).json({ error: "A valid phrase is required." });
  }

  const systemPrompt = `You are a smart movie mood classifier. Return a JSON array of 3-5 single-word mood tags based on the input phrase. Example: ["Dark", "Suspenseful", "Noir"]. Do not output anything else.`;

  try {
    const usedModel = process.env.OPENROUTER_MODEL || "mistralai/mistral-7b-instruct";
    const openrouterRes = await axios.post(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        model: usedModel,
        messages: [{ role: "system", content: systemPrompt }, { role: "user", content: phrase }],
        temperature: 0.5
      },
      {
        headers: {
          "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
          "Content-Type": "application/json",
          "HTTP-Referer": "https://visualcineaste.vercel.app", // Optional
          "X-Title": "Visual Cineaste", // Optional
        }
      }
    );
    
    // Safety check for response structure
    const reply = openrouterRes.data?.choices?.[0]?.message?.content;
    if (!reply) throw new Error("Invalid response from AI provider");

    // Try parsing, fallback to raw text if needed (though frontend expects JSON)
    try {
        res.status(200).json({ tags: JSON.parse(reply) });
    } catch (e) {
        res.status(200).json({ tags: [reply] }); // Fallback
    }

  } catch (err) {
    console.error("Mood API Error:", err.response?.data || err.message);
    res.status(500).json({ error: "OpenRouter API error" });
  }
});

// --- Main GPT Discovery Route ---
// ✅ This logic was missing in your previous file
router.post("/gpt", async (req, res) => {
  const { messages, model, temperature, max_tokens } = req.body;

  // 1. Validation
  if (!messages || !Array.isArray(messages)) {
    return res.status(400).json({ error: "Messages array is required" });
  }

  // 2. Check API Key
  if (!process.env.OPENROUTER_API_KEY) {
    console.error("❌ OPENROUTER_API_KEY is missing in backend .env");
    return res.status(500).json({ error: "Server configuration error: Missing API Key" });
  }

  try {
    // 3. Call OpenRouter API
    const response = await axios.post(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        model: model || process.env.OPENROUTER_MODEL || "mistralai/mistral-7b-instruct",
        messages: messages,
        temperature: temperature || 0.7,
        max_tokens: max_tokens || 500,
      },
      {
        headers: {
          "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
          "Content-Type": "application/json",
          "HTTP-Referer": "https://visualcineaste.vercel.app", // Matches your Vercel URL
          "X-Title": "Visual Cineaste",
        },
      }
    );

    // 4. Send response back to Frontend
    const reply = response.data?.choices?.[0]?.message?.content;
    if (!reply) {
        throw new Error("Empty response from AI");
    }
    
    res.json({ reply });

  } catch (error) {
    console.error("❌ OpenRouter Error:", error.response?.data || error.message);
    
    // Send detailed error to frontend for debugging (hide in production if needed)
    res.status(500).json({ 
      error: "Failed to fetch from AI provider", 
      details: error.response?.data || error.message 
    });
  }
});

export default router;
