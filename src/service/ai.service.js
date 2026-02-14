const { GoogleGenAI } = require("@google/genai");

const ai = new GoogleGenAI(process.env.GEMINI_API_KEY);

async function getAiResponse(content) {
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: content,
  });
  return response.text;
}
async function generateVector(content) {
  const response = await ai.models.embedContent({
    model: "gemini-embedding-001",
    contents: content,
    config:{
      outputDimensionality: 768
    }
  });
  return response.embeddings[0].values;
}

module.exports = { getAiResponse, generateVector };
