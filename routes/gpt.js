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

// --- Main GPT Discovery Route ---
router.post("/gpt", async (req, res) => {
  const { messages, model, temperature, mode } = req.body; // Added 'mode'

  if (!messages || !Array.isArray(messages)) {
    return res.status(400).json({ error: "Messages array is required" });
  }

  if (!process.env.OPENROUTER_API_KEY) {
    return res.status(500).json({ error: "Server configuration error: Missing API Key" });
  }

  // 🔥 DYNAMIC PROMPT LOGIC
  let systemContent = "";

  if (mode === "discover") {
    // 1. DISCOVER MODE: Strict JSON for Movie Cards
    systemContent = `You are a film curator API. 
    Return ONLY a raw JSON array of 6 movie objects based on the user request.
    Format: [{"title": "Name", "year": "YYYY", "reason": "Short reason why"}]. 
    Do not add markdown formatting, backticks, or any conversational text. Just the array.`;
  } else {
    // 2. ASK EXPERT MODE: Professional Text
    systemContent = `You are "CineSage", a senior film critic and historian.
    Answer the user's question in a professional, engaging article format.
    
    Guidelines:
    - Use short paragraphs.
    - Use bullet points (•) for lists.
    - Be opinionated but factual.
    - Do NOT return JSON. Return formatted text.`;
  }

  const systemInstruction = { role: "system", content: systemContent };
  // Prepend system instruction
  const apiMessages = [systemInstruction, ...messages];

  try {
    const response = await axios.post(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        model: model || "mistralai/mistral-7b-instruct",
        messages: apiMessages,
        temperature: temperature || 0.7,
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

    // Clean up response
    let cleanReply = reply.trim();
    
    if (mode === "discover") {
        // Strip markdown code blocks for JSON mode
        cleanReply = cleanReply.replace(/```json/g, "").replace(/```/g, "").trim();
    } else {
        // Strip artifacts like [/s] for Text mode
        cleanReply = cleanReply.replace(/\[\/s\]/g, "").trim();
    }
    
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
