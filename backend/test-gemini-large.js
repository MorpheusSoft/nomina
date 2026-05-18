const { GoogleGenAI } = require('@google/genai');
const apiKey = "AIzaSyBFk9SA8KxamYN-RZEk_6h67C1vow9RSEo";
const ai = new GoogleGenAI({ apiKey });

async function test() {
  try {
    const largeText = "A".repeat(1000000);
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-pro',
      contents: [{ role: 'user', parts: [{ text: 'Explícame la ley de trabajo ' + largeText }] }],
      config: { 
        temperature: 0.2,
        tools: [{ googleSearch: {} }] 
      }
    });
    console.log("SUCCESS:", response.text ? "Text generated" : "No text");
  } catch(err) {
    console.error("ERROR:", err.message);
  }
}
test();
