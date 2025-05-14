const express = require("express");
const { ElevenLabsClient } = require("elevenlabs");

const router = express.Router();
const client = new ElevenLabsClient({
  apiKey: process.env.ELEVENLABS_API_KEY,
});

router.post("/", async (req, res) => {
  const { text, settings } = req.body;

  console.log("🔁 [STREAM] Request received to stream audio.");

  try {
    console.log("📞 [STREAM] Requesting stream from ElevenLabs...");

    const audioIterable = await client.textToSpeech.convertAsStream(settings.elevenlabs.voiceID, {
      text,
      model_id: "eleven_multilingual_v2",
      voice_settings: {
        stability: settings.elevenlabs.stability, 
        similarity_boost: settings.elevenlabs.similarity_boost,
        style: settings.elevenlabs.style,
        use_speaker_boost: settings.elevenlabs.use_speaker_boost,
      },
    });

    console.log("🔌 [STREAM] Connection to ElevenLabs established. Beginning stream...");

    res.setHeader("Content-Type", "audio/mpeg");
    res.setHeader("Transfer-Encoding", "chunked");
    res.flushHeaders();

    let chunkCount = 0;
    for await (const chunk of audioIterable) {
      chunkCount++;
      console.log(`🎧 [STREAM] Sending chunk #${chunkCount} (${chunk.length} bytes)`);
      res.write(chunk);
    }

    console.log("✅ [STREAM] Audio stream completed.");
    res.end();

  } catch (err) {
    console.error("❌ [STREAM] Streaming error:", err);
    if (!res.headersSent) {
      res.status(500).json({ error: "Failed to stream audio." });
    } else {
      res.end();
    }
  }
});

module.exports = router;
