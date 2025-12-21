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

  const systemPrompt = `You are a smart movie mood classifier...`; // (rest of your mood logic)

  try {
    const usedModel = process.env.OPENROUTER_MODEL || "mistralai/mistral-7b-instruct";
    const openrouterRes = await axios.post(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        model: usedModel,
        messages: [{ role: "system", content: systemPrompt }],
        temperature: 0.5
      },
      {
        headers: {
          "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
          "Content-Type": "application/json"
        }
      }
    );
    const reply = openrouterRes.data.choices[0].message.content;
    res.status(200).json({ tags: JSON.parse(reply) });
  } catch (err) {
    res.status(500).json({ error: "OpenRouter API error" });
  }
});

router.post("/gpt", async (req, res) => {
  // ... (Your Discover logic from the src/api/gpt.js file)
});

export default router;
