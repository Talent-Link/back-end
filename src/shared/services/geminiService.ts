import axios from "axios";

// Chave de API do Gemini
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

// URL do modelo Gemini 1.5 Flash
const GEMINI_URL = "https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent";

// Função de delay para retry
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Função para chamar a API do Gemini com retry automático
export async function fetchGeminiResponse(prompt: string): Promise<string> {
  const MAX_RETRIES = 3;
  const INITIAL_DELAY = 2000; // 2 segundos

  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      console.log(`[Gemini API] Tentativa ${attempt}/${MAX_RETRIES}`);
      
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
          timeout: 30000, // 30 segundos timeout
        }
      );

      console.log(`[Gemini API] Sucesso na tentativa ${attempt}`);
      // Retorna o texto gerado pela IA
      return response.data.candidates[0].content.parts[0].text;

    } catch (error) {
      const isLastAttempt = attempt === MAX_RETRIES;
      
      if (axios.isAxiosError(error)) {
        const errorCode = error.response?.data?.error?.code;
        const errorMessage = error.response?.data?.error?.message;
        
        console.error(`[Gemini API] Erro na tentativa ${attempt}:`, {
          code: errorCode,
          message: errorMessage,
          status: error.response?.status
        });

        // Se é erro 503 (overloaded) e não é a última tentativa, tenta novamente
        if (errorCode === 503 && !isLastAttempt) {
          const delayMs = INITIAL_DELAY * Math.pow(2, attempt - 1); // Exponential backoff
          console.log(`[Gemini API] Aguardando ${delayMs}ms antes da próxima tentativa...`);
          await delay(delayMs);
          continue;
        }
        
        // Se é erro 429 (rate limit) e não é a última tentativa
        if ((errorCode === 429 || error.response?.status === 429) && !isLastAttempt) {
          const delayMs = INITIAL_DELAY * Math.pow(2, attempt - 1);
          console.log(`[Gemini API] Rate limit atingido. Aguardando ${delayMs}ms...`);
          await delay(delayMs);
          continue;
        }

      } else {
        console.error(`[Gemini API] Erro desconhecido na tentativa ${attempt}:`, error);
      }

      // Se é a última tentativa, lança o erro
      if (isLastAttempt) {
        throw new Error(
          `Erro ao obter resposta da IA após ${MAX_RETRIES} tentativas. ` +
          `Possível sobrecarga do serviço. Tente novamente em alguns minutos.`
        );
      }
    }
  }

  // Fallback (nunca deve chegar aqui, mas por segurança)
  throw new Error("Erro inesperado ao processar solicitação da IA.");
}