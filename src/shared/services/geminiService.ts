import axios from 'axios';

const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';
const GEMINI_API_KEY = 'AIzaSyAN5W1xyeKX29ZKgu2bWNTRXxtkp5YKMIM';

if (!GEMINI_API_KEY) {
  console.error('[GeminiService] GEMINI_API_KEY não configurada');
}

interface GeminiResponse {
  candidates: {
    content: {
      parts: {
        text: string;
      }[];
    };
    finishReason: string;
    index: number;
  }[];
  usageMetadata?: {
    promptTokenCount: number;
    candidatesTokenCount: number;
    totalTokenCount: number;
  };
}

interface ResumeAnalysis {
  suggestions: string[];
  strengths: string[];
  improvements: string[];
  overall_score: number;
  summary: string;
}

export class GeminiService {
  
  /**
   * Analisa um currículo e gera sugestões de melhorias
   */
  static async analyzeCurriculum(candidateData: {
    name: string;
    email: string;
    skills: string[];
    experiences: Array<{
      position: string;
      company: string;
      startDate: string;
      endDate: string | null;
      description: string | null;
      isCurrentJob: boolean;
    }>;
    educations: Array<{
      institution: string;
      course: string;
      degree: string;
      startYear: number;
      endYear: number | null;
      isOngoing: boolean;
    }>;
  }): Promise<ResumeAnalysis> {
    
    console.log(`[GeminiService] Iniciando análise de currículo para: ${candidateData.name}`);

    try {
      // Preparar prompt detalhado para análise
      const prompt = this.buildAnalysisPrompt(candidateData);
      
      const response = await axios.post<GeminiResponse>(
        GEMINI_API_URL,
        {
          contents: [
            {
              parts: [
                {
                  text: prompt
                }
              ]
            }
          ],
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 2000,
            topP: 0.95
          }
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'X-goog-api-key': GEMINI_API_KEY
          },
          timeout: 30000 // 30 segundos timeout
        }
      );

      if (!response.data.candidates || response.data.candidates.length === 0) {
        throw new Error('Resposta inválida da API Gemini');
      }

      const analysisText = response.data.candidates[0].content.parts[0].text;
      console.log(`[GeminiService] Análise concluída com sucesso. Tokens utilizados: ${response.data.usageMetadata?.totalTokenCount || 'N/A'}`);

      // Processar resposta estruturada
      return this.parseAnalysisResponse(analysisText);

    } catch (error) {
      console.error('[GeminiService] Erro na análise do currículo:', error);
      
      if (axios.isAxiosError(error)) {
        if (error.code === 'ECONNABORTED') {
          throw new Error('Timeout na análise do currículo. Tente novamente.');
        } else if (error.response?.status === 401 || error.response?.status === 403) {
          throw new Error('Erro de autenticação com a API de análise.');
        } else if (error.response?.status === 429) {
          throw new Error('Limite de requisições excedido. Tente novamente em alguns minutos.');
        } else if (error.response?.status === 400) {
          throw new Error('Erro na requisição. Verifique os dados enviados.');
        }
      }
      
      throw new Error('Erro interno na análise do currículo. Tente novamente.');
    }
  }

  /**
   * Constrói o prompt para análise do currículo
   */
  private static buildAnalysisPrompt(candidateData: any): string {
    const {
      name,
      email,
      skills,
      experiences,
      educations
    } = candidateData;

    // Preparar dados de experiências
    const experienceText = experiences.length > 0 
      ? experiences.map((exp: any) => {
          const period = exp.endDate 
            ? `${exp.startDate} - ${exp.endDate}`
            : `${exp.startDate} - Atual`;
          return `• ${exp.position} na ${exp.company} (${period})${exp.description ? '\n  Descrição: ' + exp.description : ''}`;
        }).join('\n')
      : 'Nenhuma experiência profissional informada';

    // Preparar dados de educação
    const educationText = educations.length > 0
      ? educations.map((edu: any) => {
          const period = edu.endYear 
            ? `${edu.startYear} - ${edu.endYear}`
            : `${edu.startYear} - Em andamento`;
          return `• ${edu.degree} em ${edu.course} - ${edu.institution} (${period})`;
        }).join('\n')
      : 'Nenhuma formação acadêmica informada';

    // Preparar habilidades
    const skillsText = skills.length > 0 
      ? skills.join(', ')
      : 'Nenhuma habilidade informada';

    return `
Você é um especialista em recrutamento e recursos humanos com mais de 15 anos de experiência. Sua função é analisar currículos e fornecer sugestões práticas e acionáveis para melhorar a empregabilidade dos candidatos. Seja específico, construtivo e profissional.

Analise o seguinte currículo e forneça uma análise detalhada em formato JSON:

**DADOS DO CANDIDATO:**
Nome: ${name}
Email: ${email}

**HABILIDADES TÉCNICAS:**
${skillsText}

**EXPERIÊNCIAS PROFISSIONAIS:**
${experienceText}

**FORMAÇÃO ACADÊMICA:**
${educationText}

**SOLICITAÇÃO DE ANÁLISE:**
Por favor, analise este currículo e retorne APENAS um JSON válido com a seguinte estrutura:

{
  "suggestions": [
    "Sugestão prática 1",
    "Sugestão prática 2",
    "Sugestão prática 3"
  ],
  "strengths": [
    "Ponto forte 1",
    "Ponto forte 2"
  ],
  "improvements": [
    "Área para melhoria 1",
    "Área para melhoria 2"
  ],
  "overall_score": 75,
  "summary": "Resumo executivo da análise do currículo"
}

**CRITÉRIOS DE AVALIAÇÃO:**
- Completude das informações
- Relevância das experiências
- Diversidade e atualidade das habilidades
- Progressão na carreira
- Alinhamento entre formação e experiência
- Potencial de empregabilidade

**IMPORTANTE:** 
- Seja específico e acionável nas sugestões
- Considere o mercado de trabalho atual
- Forneça uma pontuação de 0 a 100
- Retorne APENAS o JSON, sem texto adicional
`;
  }

  /**
   * Processa a resposta da análise e converte em estrutura tipada
   */
  private static parseAnalysisResponse(analysisText: string): ResumeAnalysis {
    try {
      // Limpar texto e extrair JSON
      const cleanText = analysisText.trim();
      
      // Tentar encontrar JSON na resposta
      let jsonMatch = cleanText.match(/\{[\s\S]*\}/);
      
      if (!jsonMatch) {
        // Se não encontrar JSON, criar estrutura básica
        console.warn('[GeminiService] JSON não encontrado na resposta, criando estrutura básica');
        return this.createFallbackAnalysis(analysisText);
      }

      const jsonText = jsonMatch[0];
      const parsed = JSON.parse(jsonText);

      // Validar estrutura
      return {
        suggestions: Array.isArray(parsed.suggestions) ? parsed.suggestions : [],
        strengths: Array.isArray(parsed.strengths) ? parsed.strengths : [],
        improvements: Array.isArray(parsed.improvements) ? parsed.improvements : [],
        overall_score: typeof parsed.overall_score === 'number' ? parsed.overall_score : 70,
        summary: typeof parsed.summary === 'string' ? parsed.summary : 'Análise realizada com sucesso.'
      };

    } catch (error) {
      console.warn('[GeminiService] Erro ao processar JSON da análise:', error);
      return this.createFallbackAnalysis(analysisText);
    }
  }

  /**
   * Cria análise básica quando o parsing falha
   */
  private static createFallbackAnalysis(rawText: string): ResumeAnalysis {
    return {
      suggestions: [
        'Complete todas as seções do seu perfil profissional',
        'Adicione mais detalhes sobre suas experiências passadas',
        'Mantenha suas habilidades técnicas sempre atualizadas'
      ],
      strengths: [
        'Perfil cadastrado na plataforma',
        'Interesse em melhorar o currículo'
      ],
      improvements: [
        'Fornecer mais informações detalhadas sobre experiências',
        'Adicionar certificações e cursos relevantes'
      ],
      overall_score: 60,
      summary: rawText.substring(0, 300) + '...'
    };
  }

  /**
   * Testa a conexão com a API do Gemini
   */
  static async testConnection(): Promise<boolean> {
    try {
      console.log('[GeminiService] Testando conexão com API Gemini...');

      const response = await axios.post<GeminiResponse>(
        GEMINI_API_URL,
        {
          contents: [
            {
              parts: [
                {
                  text: "Responda apenas 'OK' para testar a conexão."
                }
              ]
            }
          ],
          generationConfig: {
            maxOutputTokens: 10
          }
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'X-goog-api-key': GEMINI_API_KEY
          },
          timeout: 10000
        }
      );

      const isWorking = response.status === 200 && response.data.candidates?.length > 0;
      console.log(`[GeminiService] Teste de conexão: ${isWorking ? 'SUCESSO' : 'FALHOU'}`);
      
      return isWorking;

    } catch (error) {
      console.error('[GeminiService] Falha no teste de conexão:', error);
      return false;
    }
  }

  /**
   * Função genérica para buscar resposta do Gemini
   */
  static async fetchGeminiResponse(prompt: string): Promise<string> {
    try {
      console.log('[GeminiService] Iniciando requisição genérica ao Gemini...');

      const response = await axios.post<GeminiResponse>(
        GEMINI_API_URL,
        {
          contents: [
            {
              parts: [
                {
                  text: prompt
                }
              ]
            }
          ],
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 3000,
            topP: 0.95
          }
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'X-goog-api-key': GEMINI_API_KEY
          },
          timeout: 45000 // 45 segundos para relatórios mais complexos
        }
      );

      if (!response.data.candidates || response.data.candidates.length === 0) {
        throw new Error('Resposta inválida da API Gemini');
      }

      const responseText = response.data.candidates[0].content.parts[0].text;
      console.log(`[GeminiService] Resposta genérica obtida com sucesso. Tokens: ${response.data.usageMetadata?.totalTokenCount || 'N/A'}`);

      return responseText;

    } catch (error) {
      console.error('[GeminiService] Erro na requisição genérica:', error);
      
      if (axios.isAxiosError(error)) {
        if (error.code === 'ECONNABORTED') {
          throw new Error('Timeout na geração do conteúdo. Tente novamente.');
        } else if (error.response?.status === 401 || error.response?.status === 403) {
          throw new Error('Erro de autenticação com a API Gemini.');
        } else if (error.response?.status === 429) {
          throw new Error('Limite de requisições excedido. Tente novamente em alguns minutos.');
        } else if (error.response?.status === 400) {
          throw new Error('Erro na requisição. Verifique os dados enviados.');
        }
      }
      
      throw new Error('Erro interno na geração do conteúdo. Tente novamente.');
    }
  }
}

// Exportar função para compatibilidade
export const fetchGeminiResponse = GeminiService.fetchGeminiResponse;
