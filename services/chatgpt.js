const axios = require("axios");

async function getChatResponse(messages, settings) {
	const body = settings.customBody
		? settings.customBody
		: {
				messages,
				model: "gpt-4o-mini" || settings.model,
				temperature: settings.temperature,
				...(settings.functions && { functions: settings.functions }),
				...(settings.function_call && {
					function_call: settings.function_call,
				}),
		  };

	const response = await axios.post(
		"https://testing-openai-01.openai.azure.com/openai/deployments/gpt-4o-mini/chat/completions?api-version=2025-01-01-preview",
		body,
		{
			headers: {
				// Authorization: `Bearer ${process.env.CHATGPT_API_KEY}`,
				"api-key": process.env.OPENAI_AZURE_API_KEY,
				"Content-Type": "application/json",
			},
		}
	);

	console.log(response.data);
	return (
		response.data.choices[0].message.function_call ||
		response.data.choices[0].message.content
	);
}

module.exports = { getChatResponse };
