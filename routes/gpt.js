// Express route for AI-powered film discovery

import express from 'express';
import OpenAI from 'openai';
const router = express.Router();
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const SYSTEM_PROMPT = `Your job is to interpret vague, emotional, aesthetic, or misspelled movie prompts from users and return 5 perfect movie suggestions.\n\nReturn ONLY a valid JSON array of 5 real movies, based on the user’s taste, even if they use:\n\n- Misspelled words (e.g., “emotinal horor” → emotional horror)\n- Open-ended vibes (e.g., “lonely poetic films”)\n- Specific comparisons (e.g., “like Whiplash and Black Swan”)\n- Genre + mood (e.g., “slow sci-fi with sad ending”)\n\nEach object in the array MUST include:\n- title: Movie title (string)\n- director: Director name (string)\n- year: Year of release (number)\n- description: Poetic 1–2 line description (string)\n- moodTags: Array of 3 lowercase emotional words (e.g., [\"gritty\", \"lonely\", \"raw\"])\n- visualTags: Array of 2 lowercase visual aesthetics (e.g., [\"noir\", \"dreamlike\"])\n- language: Original language (e.g., \"English\", \"French\", \"Korean\")\n\n🧠 Infer deeper meaning even if the user gives a vague or minimal prompt. For example:\n- “scorsese film underrated” → return 5 lesser-known Scorsese films\n- “mystical desert stories” → return films like “The Fall” or “Dune”\n- “japan horror but not ghosty” → return psychological or body-horror Japanese films\n\n⚠️ Return only a pure, valid JSON array with 5 items. No markdown, no headings, no text outside the array.\n\n⛔ Do not recommend sequels or TV shows unless directly relevant  \n✅ Always use real movies listed on TMDB or IMDb`;

router.post('/gpt', async (req, res) => {
  const { messages, prompt, temperature, model } = req.body;
  let usedMessages;
  if (Array.isArray(messages)) {
    usedMessages = messages;
  } else if (prompt) {
    usedMessages = [
      { role: 'system', content: SYSTEM_PROMPT },
      { role: 'user', content: prompt }
    ];
  } else {
    return res.status(400).json({ error: 'Missing prompt or messages' });
  }
  try {
    const completion = await openai.chat.completions.create({
      model: model || 'gpt-4o',
      messages: usedMessages,
      temperature: typeof temperature === 'number' ? temperature : 0.5,
    });
    const reply = completion.choices[0].message.content;
    res.status(200).json({ reply });
  } catch (err) {
    console.error('OpenAI error:', err);
    res.status(500).json({ error: 'AI request failed' });
  }
});

export default router;
