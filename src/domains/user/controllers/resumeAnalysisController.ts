import { Request, Response } from "express";
import { GeminiService } from "../../../shared/services/geminiService";
import prisma from "../../../shared/database/prisma";

/**
 * Analisa o currículo do candidato e fornece sugestões de melhorias
 */
export async function analyzeCandidateResume(req: Request, res: Response): Promise<void> {
  try {
    const candidateId = (req as any).user?.id;

    if (!candidateId) {
      res.status(401).json({ message: "Usuário não autenticado" });
      return;
    }

    console.log(`[analyzeCandidateResume] Iniciando análise para candidato: ${candidateId}`);

    // Buscar dados completos do candidato
    const candidate = await prisma.user.findUnique({
      where: { id: candidateId },
      include: {
        candidateProfile: {
          include: {
            experiences: true,
            educations: true,
          }
        }
      }
    });

    if (!candidate) {
      res.status(404).json({ 
        message: "Candidato não encontrado",
        details: "Perfil de usuário não localizado no sistema"
      });
      return;
    }

    if (!candidate.candidateProfile) {
      res.status(404).json({ 
        message: "Perfil profissional não encontrado",
        details: "Complete seu perfil profissional antes de solicitar análise do currículo",
        action: "Acesse 'Meu Perfil' e complete as informações básicas"
      });
      return;
    }

    // Preparar dados para análise
    const candidateData = {
      name: candidate.name || 'Não informado',
      email: candidate.email,
      skills: candidate.candidateProfile?.skills || [],
      experiences: candidate.candidateProfile?.experiences?.map((exp: any) => ({
        position: exp.position,
        company: exp.company,
        startDate: exp.startDate.toISOString().split('T')[0],
        endDate: exp.endDate?.toISOString().split('T')[0] || null,
        description: exp.description,
        isCurrentJob: exp.endDate === null
      })) || [],
      educations: candidate.candidateProfile?.educations?.map((edu: any) => ({
        institution: edu.institution,
        course: edu.course,
        degree: edu.degree || 'Não especificado',
        startYear: edu.startYear,
        endYear: edu.endYear,
        isOngoing: edu.endYear === null
      })) || []
    };

    console.log(`[analyzeCandidateResume] Dados preparados - Skills: ${candidateData.skills.length}, Experiências: ${candidateData.experiences.length}, Educação: ${candidateData.educations.length}`);

    // Verificar se há dados suficientes para análise
    const hasMinimumData = candidateData.skills.length > 0 || 
                          candidateData.experiences.length > 0 || 
                          candidateData.educations.length > 0;

    if (!hasMinimumData) {
      res.status(400).json({ 
        message: "Dados insuficientes para análise",
        details: "Para receber uma análise completa, adicione pelo menos algumas habilidades, experiências ou formação acadêmica ao seu perfil",
        suggestions: [
          "Adicione suas principais habilidades técnicas",
          "Inclua suas experiências profissionais anteriores", 
          "Complete informações sobre sua formação acadêmica"
        ]
      });
      return;
    }

    // Realizar análise com Gemini
    const analysis = await GeminiService.analyzeCurriculum(candidateData);

    // Salvar análise no histórico (opcional - implementar tabela se necessário)
    console.log(`[analyzeCandidateResume] Análise concluída - Score: ${analysis.overall_score}/100`);

    res.status(200).json({
      message: "Análise do currículo realizada com sucesso",
      data: {
        candidate: {
          id: candidate.id,
          name: candidate.name,
          email: candidate.email
        },
        analysis: {
          overall_score: analysis.overall_score,
          summary: analysis.summary,
          strengths: analysis.strengths,
          suggestions: analysis.suggestions,
          improvements: analysis.improvements
        },
        profile_stats: {
          total_skills: candidateData.skills.length,
          total_experiences: candidateData.experiences.length,
          total_educations: candidateData.educations.length,
          has_resume: !!candidate.candidateProfile?.resumeUrl
        },
        analyzed_at: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error("[analyzeCandidateResume] Erro na análise:", error);
    
    if (error instanceof Error) {
      if (error.message.includes('Timeout')) {
        res.status(408).json({ 
          message: "Timeout na análise do currículo", 
          details: "A análise está demorando mais que o esperado. Tente novamente em alguns instantes."
        });
        return;
      } else if (error.message.includes('autenticação')) {
        res.status(503).json({ 
          message: "Serviço de análise temporariamente indisponível", 
          details: "Erro de configuração do serviço de IA. Tente novamente mais tarde."
        });
        return;
      } else if (error.message.includes('Limite de requisições')) {
        res.status(429).json({ 
          message: "Muitas solicitações de análise", 
          details: "Limite temporário atingido. Aguarde alguns minutos antes de tentar novamente."
        });
        return;
      }
    }

    res.status(500).json({
      message: "Erro interno na análise do currículo",
      details: "Ocorreu um erro inesperado durante a análise. Nossa equipe foi notificada."
    });
  }
}

/**
 * Testa a disponibilidade do serviço de análise
 */
export async function testAnalysisService(req: Request, res: Response): Promise<void> {
  try {
    console.log("[testAnalysisService] Testando serviço de análise...");

    const isWorking = await GeminiService.testConnection();

    if (isWorking) {
      res.status(200).json({
        message: "Serviço de análise operacional",
        status: "online",
        provider: "Google Gemini API",
        model: "gemini-2.0-flash",
        tested_at: new Date().toISOString()
      });
    } else {
      res.status(503).json({
        message: "Serviço de análise indisponível",
        status: "offline",
        details: "O serviço de IA está temporariamente indisponível. Tente novamente mais tarde."
      });
    }

  } catch (error) {
    console.error("[testAnalysisService] Erro no teste:", error);
    
    res.status(500).json({
      message: "Erro ao testar serviço de análise",
      status: "error",
      details: "Não foi possível verificar o status do serviço."
    });
  }
}

/**
 * Retorna dicas gerais de melhoria de currículo
 */
export async function getResumeImprovementTips(req: Request, res: Response): Promise<void> {
  try {
    console.log("[getResumeImprovementTips] Fornecendo dicas gerais");

    const generalTips = {
      structure: [
        "Use um formato limpo e profissional",
        "Mantenha o currículo em 1-2 páginas máximo",
        "Use bullet points para destacar conquistas",
        "Inclua palavras-chave relevantes para sua área"
      ],
      content: [
        "Quantifique suas conquistas sempre que possível",
        "Destaque resultados e impactos gerados",
        "Personalize o currículo para cada vaga",
        "Inclua links para portfolio ou projetos relevantes"
      ],
      skills: [
        "Liste habilidades técnicas atuais e relevantes",
        "Inclua certificações e cursos recentes",
        "Mencione idiomas e nível de proficiência",
        "Destaque habilidades comportamentais importantes"
      ],
      common_mistakes: [
        "Informações pessoais desnecessárias (estado civil, idade)",
        "Erros de ortografia e gramática",
        "Formato inconsistente ou desorganizado",
        "Excesso de informações irrelevantes"
      ]
    };

    res.status(200).json({
      message: "Dicas de melhoria de currículo",
      data: generalTips,
      recommendation: "Para uma análise personalizada do seu currículo, use o endpoint de análise individualizada."
    });

  } catch (error) {
    console.error("[getResumeImprovementTips] Erro:", error);
    res.status(500).json({
      message: "Erro interno ao buscar dicas de currículo"
    });
  }
}
