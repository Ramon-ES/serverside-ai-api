const axios = require('axios');
const FormData = require('form-data');

async function transcribeAudio(base64Audio, settings) {
  // Step 1: Convert base64 to Buffer
  const audioBuffer = Buffer.from(base64Audio, 'base64');

  // Step 2: Create FormData and attach buffer as a WAV file
  const form = new FormData();
  form.append('file', audioBuffer, {
    filename: 'audio.wav',
    contentType: 'audio/wav',
  });
  form.append('model', 'whisper-1');
  form.append('language', settings.language
  );
  form.append('temperature', settings.temperature);
  form.append('response_format', 'text'); // Or 'verbose_json', etc.

  // Step 3: Send to Whisper API
  const response = await axios.post('https://api.openai.com/v1/audio/transcriptions', form, {
    headers: {
      ...form.getHeaders(),
      'Authorization': `Bearer ${process.env.WHISPER_API_KEY}`,
    }
  });

  return response.data;
}

module.exports = { transcribeAudio };
