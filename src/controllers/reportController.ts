import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import { fetchGeminiResponse } from "../services/geminiService";

const prisma = new PrismaClient();

export async function generateCandidateReport(req: Request, res: Response): Promise<void> {
  try {
    const { candidateId, formId } = req.params;

    // Verifica se o candidato existe
    const candidate = await prisma.user.findUnique({
      where: { id: candidateId },
      include: {
        responses: {
          where: { formId },
          include: {
            form: true, // Inclui o formulário associado às respostas
          },
        },
      },
    });

    if (!candidate || candidate.userType !== "CANDIDATO") {
      res.status(404).send("Candidato não encontrado ou não é um candidato válido.");
      return;
    }

    // Verifica se o formulário existe e se há respostas associadas
    const response = candidate.responses.find((r) => r.formId === formId);
    if (!response) {
      res.status(404).send("Respostas para o formulário não encontradas.");
      return;
    }

    // Prompt para a API do Gemini
    const prompt = `
    **Resumo do Candidato:**
    Nome: ${candidate.name}
    E-mail: ${candidate.email}

    **Formulário:**
    Título: ${response.form.title}
    Descrição: ${response.form.description || "Descrição não fornecida"}
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
    `;

    // Chama a API do Gemini para gerar o relatório
    const rawReport = await fetchGeminiResponse(prompt);

    // Processa o relatório para separá-lo em seções
    const structuredReport = processReport(rawReport);

    // Retorna o relatório estruturado
    res.status(200).json({
      message: "Relatório gerado com sucesso.",
      report: structuredReport,
    });
  } catch (error) {
    if (error instanceof Error) {
      console.error("Erro ao gerar relatório:", error.message);
    } else {
      console.error("Erro ao gerar relatório:", error);
    }
    res.status(500).send("Erro interno ao gerar relatório.");
  }
}

// Função para processar o relatório e separá-lo em seções
function processReport(rawReport: string): Record<string, string> {
  const sections = rawReport.split("\n\n"); // Divide o texto em seções com base em quebras de linha duplas
  const structuredReport: Record<string, string> = {};

  sections.forEach((section) => {
    const [title, ...content] = section.split("\n"); // Separa o título do conteúdo
    if (title && content.length > 0) {
      structuredReport[title.replace(/##\s*/, "").trim()] = content.join("\n").trim(); // Remove "##" do título e adiciona ao JSON
    }
  });

  return structuredReport;
}