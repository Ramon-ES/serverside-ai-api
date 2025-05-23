const express = require("express");
const router = express.Router();
const { transcribeAudio } = require("../services/whisper");
const { getChatResponse } = require("../services/chatgpt");
const { fetchSpeech } = require("../services/elevenlabs");

router.post("/", async (req, res) => {
	const { ...settings } = req.body;
	console.log(settings);

	try {
		// Step 1: Transcribe with Whisper
		let transcript;
		if (settings.use.includes("whisper") && settings.audioData) {
			try {
				transcript = await transcribeAudio(
					settings.audioData,
					settings.whisper
				);
			} catch (err) {
				throw new Error(`Whisper transcription failed: ${err.message}`);
			}
		} else {
			transcript = settings.textInput;
		}

		if (settings.chatConversation) {
			settings.chatConversation.push({
				role: "user",
				content: transcript,
			});
		}

		// Step 2: Get ChatGPT response
		let assistantMessage;
		if (settings.use.includes("chatgpt")) {
			try {
				assistantMessage = await getChatResponse(
					settings.chatConversation,
					settings.chatgpt
				);
				console.log(assistantMessage)
			} catch (err) {
				throw new Error(`ChatGPT response failed: ${err.message}`);
			}
			if (settings.chatConversation) {
				settings.chatConversation.push({
					role: "assistant",
					content: JSON.parse(assistantMessage.arguments).response.replaceAll('’', `'`) || assistantMessage.replaceAll('’', `'`),
				});
			}
		}

		// Step 3: Stream from ElevenLabs
		let audio;
		let url;

		try {
			if (settings.use.includes("elevenlabs-fetch")) {
				audio = await fetchSpeech(
					JSON.parse(assistantMessage.arguments).response || assistantMessage || transcript,
					settings.elevenlabs
				);
			}

			if (settings.use.includes("elevenlabs-stream")) {
				// Construct the URL for the streaming endpoint
				// url = `${req.protocol}://${req.get("host")}/stream-audio`; // req.protocol is 'http' or 'https', req.get('host') is the hostname (with port if needed)
				url = `https://${req.get("host")}/serverside-ai-api/stream-audio`;
			}
		} catch (err) {
			// throw new Error(
			//  `ElevenLabs speech streaming failed: ${err.message}`
			// );

			console.log(err);
		}

		// Step 4: Respond to frontend
		res.setHeader("Content-Type", "application/json");
		res.json({
			key: settings.key,
			name: settings.name,
			audioBase64: audio,
			audioStream: url,
			chatConversation: settings.chatConversation,
			transcript,
			assistantMessage,
			messageCount: settings.messageCount,
		});
	} catch (err) {
		console.error("Error in pipeline:", err.message);
		res.status(500).json({ error: err.message });
	}
});

router.get("/", (req, res) => {
	// Je logica voor de POST request
	res.send("connected!");
});

module.exports = router;
