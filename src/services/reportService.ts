import { PrismaClient } from "@prisma/client";
import { fetchGeminiResponse } from "./geminiService";

const prisma = new PrismaClient();

export async function generateCandidateReportService(candidateId: string, opportunityId: string) {
  console.log(`[generateCandidateReportService] Start - candidateId: ${candidateId}, opportunityId: ${opportunityId}`);

  try {
    // Buscar a oportunidade para obter o formId
    console.log(`[generateCandidateReportService] Fetching opportunity to get formId`);
    const opportunity = await prisma.opportunity.findUnique({
      where: { id: opportunityId },
      include: { form: true },
    });

    if (!opportunity) {
      console.error(`[generateCandidateReportService] Opportunity not found`);
      throw new Error("Oportunidade não encontrada.");
    }

    if (!opportunity.form) {
      console.error(`[generateCandidateReportService] Associated form not found`);
      throw new Error("Formulário associado à oportunidade não encontrado.");
    }

    const formId = opportunity.form.id;
    console.log(`[generateCandidateReportService] Found formId: ${formId}`);

    // Buscar o candidato e suas respostas para aquele formulário
    console.log(`[generateCandidateReportService] Fetching candidate and responses`);
    const candidate = await prisma.user.findUnique({
      where: { id: candidateId },
      include: {
        responses: {
          where: { formId },
          include: { form: true },
        },
      },
    });

    if (!candidate || candidate.userType !== "CANDIDATO") {
      console.error(`[generateCandidateReportService] Candidate not found or invalid userType`);
      throw new Error("Candidato não encontrado ou não é um candidato válido.");
    }

    console.log(`[generateCandidateReportService] Candidate found: ${candidate.name}`);

    const response = candidate.responses.find((r) => r.formId === formId);
    if (!response) {
      console.error(`[generateCandidateReportService] Responses for the form not found`);
      throw new Error("Respostas para o formulário não encontradas.");
    }

    console.log(`[generateCandidateReportService] Responses found for formId: ${formId}`);

    // Monta o prompt
    const prompt = `
**Resumo do Candidato:**
Nome: ${candidate.name}
E-mail: ${candidate.email}

**Formulario:**
Titulo: ${response.form.title}
Descricao: ${response.form.description || "Descricao nao fornecida"}
Objetivo: Avaliar a adequacao do candidato a vaga descrita no formulario.

**Respostas do Candidato:**
${
      typeof response.answers === "object" && response.answers !== null
        ? Object.entries(response.answers)
            .map(([question, answer]) => `- ${question}: ${answer}`)
            .join("\n")
        : "Respostas nao disponiveis"
    }

**Contexto da Vaga:**
Com base no titulo e na descricao do formulario, identifique a area da vaga (exemplo: tecnologia, marketing, vendas, etc.) e os requisitos implicitos ou explicitos para o candidato.

**Tarefa:**
1. Avalie as respostas do candidato em relacao a vaga descrita no formulario.
2. Identifique os pontos fortes e fracos do candidato com base nas respostas fornecidas.
3. Forneca um resumo detalhado sobre a adequacao do candidato a vaga, destacando se ele atende aos requisitos e se possui as habilidades necessarias.
4. Caso as informacoes sejam insuficientes, indique quais informacoes adicionais seriam necessarias para uma avaliacao mais completa.
    `;

    console.log(`[generateCandidateReportService] Prompt generated successfully`);

    const rawReport = await fetchGeminiResponse(prompt);
    console.log(`[generateCandidateReportService] Raw report fetched successfully`);

    const processedReport = processReport(rawReport);
    console.log(`[generateCandidateReportService] Report processed successfully`);

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

// Funcao para estruturar o relatorio
function processReport(rawReport: string): Record<string, string> {
  console.log(`[processReport] Start processing raw report`);
  const sections = rawReport.split("\n\n");
  const structuredReport: Record<string, string> = {};

  sections.forEach((section) => {
    const [title, ...content] = section.split("\n");
    if (title && content.length > 0) {
      structuredReport[title.replace(/##\s*/, "").trim()] = content.join("\n").trim();
    }
  });

  console.log(`[processReport] Report structured successfully`);
  return structuredReport;
}