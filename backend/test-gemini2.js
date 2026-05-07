const { GoogleGenAI } = require('@google/genai');
const dotenv = require('dotenv');
dotenv.config();

async function main() {
  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-pro',
      contents: [{ role: 'user', parts: [{ text: "Dame la tasa BCV hoy. Responde ESTRICTAMENTE en este JSON: {\"rate\": number}" }] }],
      config: {
        tools: [{ googleSearch: {} }]
      }
    });
    console.log("Success:", response.text);
  } catch(e) {
    console.log("Error:", e.message);
  }
}
main();
