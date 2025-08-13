import express from 'express';
import { fetchDirectOTTLink } from '../src/api/justwatch.js';
const router = express.Router();

// Test route: GET /api/streaming-link?title=Inception&year=2010
router.get('/api/streaming-link', async (req, res) => {
  const { title, year, platform } = req.query;
  if (!title || !year) {
    return res.status(400).json({ error: 'Missing title or year' });
  }
  try {
    const url = await fetchDirectOTTLink(title, parseInt(year), platform);
    if (url) {
      res.json({ url });
    } else {
      res.status(404).json({ error: 'No streaming link found' });
    }
  } catch (e) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/streaming-links?title=Inception
router.get('/api/streaming-links', async (req, res) => {
  const { title } = req.query;
  if (!title) {
    return res.status(400).json({ error: 'Missing title' });
  }
  try {
    // Temporarily disabled due to ES module compatibility issues
    console.log('JustWatch functionality temporarily disabled');
    res.json({ message: 'Streaming links temporarily unavailable' });
    
    // TODO: Fix ES module compatibility for justwatch-api
    // const JustWatch = (await import('justwatch-api')).default;
    // const justwatch = new JustWatch({ locale: 'en_IN' });
    // const results = await justwatch.search({ query: title });
    // const localTitle = title.trim().toLowerCase();
    // const item = results.items?.find(i => i.title && i.title.trim().toLowerCase() === localTitle) || results.items?.[0];
    // const offers = item?.offers || [];
    // const linksMap = {};
    // offers.forEach((offer) => {
    //   if (offer.monetization_type === 'flatrate' && offer.urls?.standard_web && offer.provider_name) {
    //     linksMap[offer.provider_name] = offer.urls.standard_web;
    //   }
    // });
    // res.json(linksMap);
  } catch (e) {
    res.status(500).json({ error: 'JustWatch error', details: e.message });
  }
});

export default router;
