import prisma from "../../../shared/database/prisma";
import { fetchGeminiResponse } from "../../../shared/services/geminiService";
import { extractJsonFromGeminiResponse } from "../../../shared/utils/aiUtils";

export async function generateCandidateReportService(
  candidateId: string,
  opportunityId: string
) {
  console.log(
    `[generateCandidateReportService] Start - candidateId: ${candidateId}, opportunityId: ${opportunityId}`
  );

  try {
    // Buscar a oportunidade para obter o formId
    console.log(
      `[generateCandidateReportService] Fetching opportunity to get formId`
    );
    const opportunity = await prisma.opportunity.findUnique({
      where: { id: opportunityId },
      include: { form: true },
    });

    if (!opportunity) {
      console.error(`[generateCandidateReportService] Opportunity not found`);
      throw new Error("Oportunidade não encontrada.");
    }

    if (!opportunity.form) {
      console.error(
        `[generateCandidateReportService] Associated form not found`
      );
      throw new Error("Formulário associado à oportunidade não encontrado.");
    }

    const formId = opportunity.form.id;
    console.log(`[generateCandidateReportService] Found formId: ${formId}`);

    // Buscar o candidato e suas respostas para aquela oportunidade
    console.log(
      `[generateCandidateReportService] Fetching candidate and responses`
    );
    const candidate = await prisma.user.findUnique({
      where: { id: candidateId },
      include: {
        candidateProfile: {
          select: {
            resumeUrl: true,
            skills: true,
            phoneNumber: true,
            experiences: {
              orderBy: { startDate: 'desc' },
              select: {
                position: true,
                company: true,
                startDate: true,
                endDate: true,
                description: true,
              }
            },
            educations: {
              orderBy: { startYear: 'desc' },
              select: {
                institution: true,
                course: true,
                degree: true,
                startYear: true,
                endYear: true,
              }
            }
          }
        },
        responses: {
          where: { opportunityId },
          include: {
            opportunity: {
              include: { form: true },
            },
          },
        },
      },
    });

    if (!candidate || candidate.userType !== "CANDIDATO") {
      console.error(
        `[generateCandidateReportService] Candidate not found or invalid userType`
      );
      throw new Error("Candidato não encontrado ou não é um candidato válido.");
    }

    console.log(
      `[generateCandidateReportService] Candidate found: ${candidate.name}`
    );

    const response = candidate.responses.find(
      (r) => r.opportunity.form?.id === formId
    );
    if (!response) {
      console.error(
        `[generateCandidateReportService] Responses for the form not found`
      );
      throw new Error("Respostas para o formulário não encontradas.");
    }

    console.log(
      `[generateCandidateReportService] Responses found for formId: ${formId}`
    );

    // Preparar informações do perfil do candidato (opcional)
    let candidateProfileInfo = "";
    if (candidate.candidateProfile) {
      const profile = candidate.candidateProfile;
      
      candidateProfileInfo = `

**Perfil Profissional do Candidato:**`;

      if (profile.phoneNumber) {
        candidateProfileInfo += `
Telefone: ${profile.phoneNumber}`;
      }

      if (profile.skills && profile.skills.length > 0) {
        candidateProfileInfo += `
Habilidades: ${profile.skills.join(', ')}`;
      }

      if (profile.experiences && profile.experiences.length > 0) {
        candidateProfileInfo += `

**Experiências Profissionais:**`;
        profile.experiences.forEach((exp, index) => {
          const endDate = exp.endDate ? new Date(exp.endDate).getFullYear() : 'Atual';
          candidateProfileInfo += `
${index + 1}. ${exp.position} - ${exp.company} (${new Date(exp.startDate).getFullYear()} - ${endDate})`;
          if (exp.description) {
            candidateProfileInfo += `
   Descrição: ${exp.description}`;
          }
        });
      }

      if (profile.educations && profile.educations.length > 0) {
        candidateProfileInfo += `

**Formação Acadêmica:**`;
        profile.educations.forEach((edu, index) => {
          const endYear = edu.endYear || 'Em andamento';
          candidateProfileInfo += `
${index + 1}. ${edu.course} - ${edu.institution}`;
          if (edu.degree) {
            candidateProfileInfo += ` (${edu.degree})`;
          }
          candidateProfileInfo += ` (${edu.startYear} - ${endYear})`;
        });
      }

      if (profile.resumeUrl) {
        candidateProfileInfo += `

**Currículo:** Disponível em PDF (URL: ${profile.resumeUrl})
Nota: O candidato possui currículo cadastrado. As informações acima complementam os dados do CV.`;
      } else {
        candidateProfileInfo += `

**Currículo:** Não disponível - candidato não cadastrou currículo em PDF.`;
      }
    } else {
      candidateProfileInfo = `

**Perfil Profissional:** Candidato não completou o perfil profissional na plataforma.
**Currículo:** Não disponível.`;
    }

    const prompt = `
Você é um assistente de RH especialista em análise de candidatos. Analise o candidato com base nas informações abaixo e gere um relatório estruturado em formato JSON.

**Resumo do Candidato:**
Nome: ${candidate.name}
E-mail: ${candidate.email}${candidateProfileInfo}

**Formulário de Candidatura:**
Título: ${response.opportunity.form?.title || "Título não fornecido"}
Descrição: ${
      response.opportunity.form?.description || "Descrição não fornecida"
    }

**Respostas do Formulário:**
${
  typeof response.answers === "object" && response.answers !== null
    ? Object.entries(response.answers)
        .map(([question, answer]) => `- ${question}: ${answer}`)
        .join("\n")
    : "Respostas não disponíveis"
}

**Instruções de Análise:**
1. **Análise Completa:** Considere TODAS as informações disponíveis - respostas do formulário, experiências profissionais, formação acadêmica, habilidades e disponibilidade de currículo.

2. **Adequação à Vaga:** Avalie como o perfil completo do candidato se alinha com os requisitos da vaga baseando-se no título e descrição do formulário.

3. **Pontos Fortes:** Identifique competências, experiências e qualificações que tornam o candidato atrativo para a posição.

4. **Pontos de Atenção:** Identifique lacunas, inexperiências ou aspectos que podem precisar de desenvolvimento.

5. **Recomendações:** Sugira próximos passos no processo seletivo e informações adicionais que seriam úteis.

**Formato de resposta esperado (JSON):**

{
  "resumo": "Resumo executivo do candidato, destacando sua adequação geral à vaga com base em todas as informações disponíveis (formulário + perfil profissional).",
  "pontos_fortes": "Liste os principais pontos fortes do candidato, incluindo experiências relevantes, habilidades técnicas, formação e outros diferenciais identificados.",
  "pontos_fracos": "Liste os principais pontos fracos, lacunas de experiência, áreas para desenvolvimento ou aspectos que podem ser desafios para a vaga.",
  "adequacao_vaga": "Análise específica de como o candidato se encaixa na vaga descrita, considerando requisitos técnicos, experiência e fit cultural.",
  "proximos_passos": "Recomendações para as próximas etapas do processo seletivo (ex: entrevista técnica, teste prático, verificação de referências).",
  "informacoes_adicionais": "Quais informações adicionais seriam valiosas para uma avaliação mais completa do candidato."
}
  informe sen conseguiu encontrar o curriculo anexado, respondendo sim ou não

IMPORTANTE: Responda apenas com o JSON válido, sem crases, sem markdown, sem explicações adicionais. Base sua análise em TODAS as informações fornecidas, tanto do formulário quanto do perfil profissional.
`;

    console.log(
      `[generateCandidateReportService] Prompt generated successfully`
    );

    const rawReport = await fetchGeminiResponse(prompt);
    console.log(
      `[generateCandidateReportService] Raw report fetched successfully`
    );

    // Usa a função utilitária para extrair e organizar o JSON
    const processedReport = extractJsonFromGeminiResponse({
      report: rawReport,
    });
    console.log(
      `[generateCandidateReportService] Report processed successfully`
    );

    return processedReport;
  } catch (error) {
    if (error instanceof Error) {
      console.error(`[generateCandidateReportService] Error: ${error.message}`);
    } else {
      console.error(`[generateCandidateReportService] Unknown error occurred`);
    }
    throw error;
  }
}
