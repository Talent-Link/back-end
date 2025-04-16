import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import { fetchGeminiResponse } from "../services/geminiService"; // Importa a função para chamar a API do Gemini

const prisma = new PrismaClient();

// Gera um relatório para um candidato específico com base em um formulário
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

    // Prepara o prompt para a API do Gemini
    const prompt = `
      Resumo do candidato ${candidate.name} para o formulário "${response.form.title}".
      Descrição do formulário: ${response.form.description}.
      Respostas do candidato: ${JSON.stringify(response.answers)}.
      Avalie se o candidato se encaixa na vaga e forneça um resumo simples.
    `;

    // Chama a API do Gemini para gerar o relatório
    const report = await fetchGeminiResponse(prompt);

    // Retorna o relatório gerado
    res.status(200).json({
        
      message: "Relatório gerado com sucesso.",
      report,
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