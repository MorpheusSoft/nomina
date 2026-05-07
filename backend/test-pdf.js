const { GoogleGenAI } = require('@google/genai');
require('dotenv').config();

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

async function run() {
  console.log(Object.keys(ai));
  console.log(Object.keys(ai.files || {}));
}
run();
