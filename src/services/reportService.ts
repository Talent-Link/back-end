import { PrismaClient } from "@prisma/client";
import { fetchGeminiResponse } from "./geminiService";
import { extractJsonFromGeminiResponse } from "../utils/aiUtils";

const prisma = new PrismaClient();

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

    const prompt = `
Você é um assistente de RH. Analise o candidato com base nas informações abaixo e gere um relatório estruturado em formato JSON, seguindo exatamente o modelo fornecido.

**Resumo do Candidato:**
Nome: ${candidate.name}
E-mail: ${candidate.email}

**Formulário:**
Título: ${response.opportunity.form?.title || "Título não fornecido"}
Descrição: ${
      response.opportunity.form?.description || "Descrição não fornecida"
    }
Objetivo: Avaliar a adequação do candidato à vaga descrita no formulário.

**Respostas do Candidato:**
${
  typeof response.answers === "object" && response.answers !== null
    ? Object.entries(response.answers)
        .map(([question, answer]) => `- ${question}: ${answer}`)
        .join("\n")
    : "Respostas não disponíveis"
}

**Contexto da Vaga:**
Com base no título e na descrição do formulário, identifique a área da vaga (exemplo: tecnologia, marketing, vendas, etc.) e os requisitos implícitos ou explícitos para o candidato.

**Tarefa:**
1. Avalie as respostas do candidato em relação à vaga descrita no formulário.
2. Identifique os pontos fortes e fracos do candidato com base nas respostas fornecidas.
3. Forneça um resumo detalhado sobre a adequação do candidato à vaga, destacando se ele atende aos requisitos e se possui as habilidades necessárias.
4. Caso as informações sejam insuficientes, indique quais informações adicionais seriam necessárias para uma avaliação mais completa.

**Formato de resposta esperado (JSON):**

{
  "resumo": "Resumo geral do candidato e sua adequação à vaga.",
  "pontos_fortes": "Liste os principais pontos fortes do candidato.",
  "pontos_fracos": "Liste os principais pontos fracos ou pontos a melhorar.",
  "informacoes_adicionais": "Informe quais informações adicionais seriam necessárias para uma avaliação mais completa, se aplicável."
}

Responda apenas com o JSON, sem explicações adicionais, sem crases e sem markdown. Seja extremamente organizado e claro.
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
