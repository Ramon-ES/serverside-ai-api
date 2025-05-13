const express = require('express');
const router = express.Router();
const { streamSpeech } = require("../services/elevenlabs");

router.post('/stream-audio', (req, res) => {
  const { text, settings } = req.body;

  if (!text || !settings || !settings.voiceID) {
    return res.status(400).json({ error: 'Missing text or settings.voiceID' });
  }

  // Stream audio directly to the client response
  streamSpeech(text, settings, res);
});

module.exports = router;
