const axios = require("axios");

async function getChatResponse(messages, settings) {
	const response = await axios.post(
		"https://api.openai.com/v1/chat/completions",
		settings.customBody
			? settings.customBody
			: {
					messages,
					model: settings.model,
					temperature: settings.temperature,
			  },
		{
			headers: {
				Authorization: `Bearer ${process.env.CHATGPT_API_KEY}`,
				"Content-Type": "application/json",
			},
		}
	);
console.log(response.data)
	return response.data.choices[0].message.function_call||response.data.choices[0].message.content;
}

module.exports = { getChatResponse };
