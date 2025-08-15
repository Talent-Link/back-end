import axios from 'axios';

const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';
const GROQ_API_KEY = process.env.GROQ_API_KEY;

if (!GROQ_API_KEY) {
  console.error('[GroqService] GROQ_API_KEY não configurada no arquivo .env');
}

interface GroqResponse {
  id: string;
  object: string;
  created: number;
  model: string;
  choices: {
    index: number;
    message: {
      role: string;
      content: string;
    };
    finish_reason: string;
  }[];
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

interface ResumeAnalysis {
  suggestions: string[];
  strengths: string[];
  improvements: string[];
  overall_score: number;
  summary: string;
}

export class GroqService {
  
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
    
    console.log(`[GroqService] Iniciando análise de currículo para: ${candidateData.name}`);

    try {
      // Preparar prompt detalhado para análise
      const prompt = this.buildAnalysisPrompt(candidateData);
      
      const response = await axios.post<GroqResponse>(
        GROQ_API_URL,
        {
          model: "llama-3.3-70b-versatile",
          messages: [
            {
              role: "system",
              content: "Você é um especialista em recrutamento e recursos humanos com mais de 15 anos de experiência. Sua função é analisar currículos e fornecer sugestões práticas e acionáveis para melhorar a empregabilidade dos candidatos. Seja específico, construtivo e profissional."
            },
            {
              role: "user",
              content: prompt
            }
          ],
          temperature: 0.7,
          max_tokens: 2000,
          top_p: 1,
          stream: false
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${GROQ_API_KEY}`
          },
          timeout: 30000 // 30 segundos timeout
        }
      );

      if (!response.data.choices || response.data.choices.length === 0) {
        throw new Error('Resposta inválida da API Groq');
      }

      const analysisText = response.data.choices[0].message.content;
      console.log(`[GroqService] Análise concluída com sucesso. Tokens utilizados: ${response.data.usage?.total_tokens || 'N/A'}`);

      // Processar resposta estruturada
      return this.parseAnalysisResponse(analysisText);

    } catch (error) {
      console.error('[GroqService] Erro na análise do currículo:', error);
      
      if (axios.isAxiosError(error)) {
        if (error.code === 'ECONNABORTED') {
          throw new Error('Timeout na análise do currículo. Tente novamente.');
        } else if (error.response?.status === 401) {
          throw new Error('Erro de autenticação com a API de análise.');
        } else if (error.response?.status === 429) {
          throw new Error('Limite de requisições excedido. Tente novamente em alguns minutos.');
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
        console.warn('[GroqService] JSON não encontrado na resposta, criando estrutura básica');
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
      console.warn('[GroqService] Erro ao processar JSON da análise:', error);
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
   * Testa a conexão com a API do Groq
   */
  static async testConnection(): Promise<boolean> {
    try {
      console.log('[GroqService] Testando conexão com API Groq...');

      const response = await axios.post<GroqResponse>(
        GROQ_API_URL,
        {
          model: "llama-3.3-70b-versatile",
          messages: [
            {
              role: "user",
              content: "Responda apenas 'OK' para testar a conexão."
            }
          ],
          max_tokens: 10
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${GROQ_API_KEY}`
          },
          timeout: 10000
        }
      );

      const isWorking = response.status === 200 && response.data.choices?.length > 0;
      console.log(`[GroqService] Teste de conexão: ${isWorking ? 'SUCESSO' : 'FALHOU'}`);
      
      return isWorking;

    } catch (error) {
      console.error('[GroqService] Falha no teste de conexão:', error);
      return false;
    }
  }
}
