
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

  const systemPrompt = `
You are a smart movie mood classifier. Your task is to convert vague user search phrases into structured movie tags.

Input: "the films where protagonist lost"

Output (as JSON):
{
  "mood": "tragic",
  "themes": ["loss", "emotional downfall", "character failure"],
  "genres": ["drama", "psychological"],
  "example_keywords": ["tragic ending", "emotional drama", "protagonist defeated"]
}

Now, convert this phrase:
"${phrase}"
Return only the JSON object.
`;

  try {
    const usedModel = process.env.OPENROUTER_MODEL || "mistralai/mistral-7b-instruct";
    const openrouterRes = await axios.post(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        model: usedModel,
        messages: [
          { role: "system", content: systemPrompt }
        ],
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
    console.error("MoodTags route error:", err?.response?.data || err.message);
    res.status(500).json({ error: "OpenRouter API error" });
  }
});

router.post("/gpt", async (req, res) => {
  console.log("[API /gpt] BODY:", req.body);
  if (!req.body || typeof req.body !== 'object') {
    return res.status(400).json({ error: "Request body missing or not parsed as JSON." });
  }
  // Accept either messages (preferred) or prompt (legacy)
  let { messages, prompt, temperature, model } = req.body;
  // Robust: trim prompt if string
  if (typeof prompt === 'string') prompt = prompt.trim();
  console.log("[API /gpt] messages:", messages);
  console.log("[API /gpt] prompt:", prompt);
  // If neither messages nor prompt is present, try to extract prompt from messages
  if (!Array.isArray(messages)) {
    // Try to extract prompt from body for legacy support
    if ((!prompt || typeof prompt !== 'string' || prompt.length === 0) && req.body && req.body.messages && Array.isArray(req.body.messages) && req.body.messages.length > 0) {
      // Try to find a user message
      const userMsg = req.body.messages.find(m => m.role === 'user' && m.content);
      if (userMsg && typeof userMsg.content === 'string') prompt = userMsg.content.trim();
    }
    // Final robust check: prompt must be a non-empty string after trim
    if (!prompt || typeof prompt !== "string" || prompt.length === 0) {
      console.log("[API /gpt] 400: Prompt or messages required.");
      return res.status(400).json({ error: "Prompt or messages required." });
    }
    // --- CineShelf Discover Movies: Cinematic, curated recommendations ---
    // Basic typo correction for common queries
    if (typeof prompt === 'string') {
      prompt = prompt.replace(/masan/gi, "Masaan").replace(/lunch box/gi, "The Lunchbox");
    }
    const systemPrompt = `You are a cinematic movie recommendation expert. Your goal is to interpret user input from a cinephile’s perspective and suggest highly relevant films.\n\nInstructions:\n- Accept free-form natural prompts like “films like Masaan” or “protagonist loses everything in Hindi films.”\n- Understand genre, emotion, character arcs, endings, tones, and keywords from the prompt.\n- Respond with 5 to 8 curated movie titles that match the query. Include films across Indian and global cinema if needed.\n- For each movie, return: **Title (Year)** – *One-line reason why it fits.*\n\nIf the prompt is vague, still try to interpret the intent and give relevant matches. Always aim for:\n- Artistic, emotional, and intelligent recommendations.\n- No blank result even if prompt is unusual.\n\nExample:\nPrompt: *“films where protagonist lost”*  \nResult:\n1. **Masaan (2015)** – A poetic tale of grief, longing, and societal loss.  \n2. **Udaan (2010)** – A story of emotional rebellion and losing family to find self.  \n3. **Talvar (2015)** – The hero loses faith in truth in a broken justice system.  \n4. **October (2018)** – A slow-burn where love never gets its due.  \n5. **Ankhon Dekhi (2013)** – A philosophical journey into failure and liberation.`;
    messages = [
      { role: "system", content: systemPrompt },
      { role: "user", content: prompt }
    ];
    // Default temperature for creative, artistic, and relevant recommendations
    if (typeof temperature !== 'number') temperature = 0.8;
  }
  try {
    const usedModel = model || process.env.OPENROUTER_MODEL || "mistralai/mistral-7b-instruct";
    console.log("[API /gpt] Final messages:", messages);
    const openrouterRes = await axios.post(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        model: usedModel,
        messages,
        temperature: typeof temperature === 'number' ? temperature : 0.5
      },
      {
        headers: {
          "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
          "Content-Type": "application/json"
        }
      }
    );
    const reply = openrouterRes.data.choices[0].message.content;
    res.status(200).json({ reply });
  } catch (err) {
    console.error("OpenRouter route error:", err?.response?.data || err.message);
    res.status(500).json({ error: "OpenRouter API error" });
  }
});

export default router;
