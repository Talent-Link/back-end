import axios from "axios";

// Chave de API do Gemini
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

// URL do modelo Gemini 1.5 Flash
const GEMINI_URL = "https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent";

// Função para chamar a API do Gemini
export async function fetchGeminiResponse(prompt: string): Promise<string> {
  try {
    const response = await axios.post(
      `${GEMINI_URL}?key=${GEMINI_API_KEY}`,
      {
        contents: [
          {
            parts: [{ text: prompt }],
          },
        ],
      },
      {
        headers: { "Content-Type": "application/json" },
      }
    );

    // Retorna o texto gerado pela IA
    return response.data.candidates[0].content.parts[0].text;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error("Erro ao chamar a API do Gemini:", error.response?.data || error.message);
    } else {
      console.error("Erro ao chamar a API do Gemini:", error);
    }
    throw new Error("Erro ao obter resposta da IA.");
  }
}