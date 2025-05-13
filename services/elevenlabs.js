const axios = require('axios');
const https = require('https');

/**
 * Non-streaming version: fetches full audio and returns base64 string.
 */
async function fetchSpeech(text, settings) {
  const response = await axios.post(
    `https://api.elevenlabs.io/v1/text-to-speech/${settings.voiceID}`,
    {
      text,
      voice_settings: {
        stability: settings.stability,
        similarity_boost: settings.similarity_boost,
        style: settings.style,
        use_speaker_boost: settings.use_speaker_boost,
      }
    },
    {
      headers: {
        'xi-api-key': process.env.ELEVENLABS_API_KEY,
        'Content-Type': 'application/json',
        'Accept': 'audio/mpeg'
      },
      responseType: 'arraybuffer'
    }
  );

  console.log(response.data)

  return Buffer.from(response.data, 'binary').toString('base64');
}

/**
 * Streaming version: streams ElevenLabs audio directly to the provided response stream.
 */
function streamSpeech(text, settings, res) {
  const postData = JSON.stringify({
    text,
    voice_settings: {
      stability: settings.stability,
      similarity_boost: settings.similarity_boost,
      style: settings.style,
      use_speaker_boost: settings.use_speaker_boost,
    },
  });

  const options = {
    hostname: 'api.elevenlabs.io',
    path: `/v1/text-to-speech/${settings.voiceID}/stream`,
    method: 'POST',
    headers: {
      'xi-api-key': process.env.ELEVENLABS_API_KEY,
      'Content-Type': 'application/json',
      'Accept': 'audio/mpeg',
      'Content-Length': Buffer.byteLength(postData),
    },
  };

  const elevenReq = https.request(options, elevenRes => {
    if (elevenRes.statusCode !== 200) {
      res.status(elevenRes.statusCode).json({ error: 'Failed to stream audio from ElevenLabs' });
      return;
    }

    res.setHeader('Content-Type', 'audio/mpeg');
    res.setHeader('Transfer-Encoding', 'chunked');
    elevenRes.pipe(res);
  });

  elevenReq.on('error', err => {
    console.error('Error while streaming ElevenLabs audio:', err);
    res.status(500).json({ error: 'Streaming failed' });
  });

  elevenReq.write(postData);
  elevenReq.end();
}

module.exports = {
  fetchSpeech,
  streamSpeech
};
