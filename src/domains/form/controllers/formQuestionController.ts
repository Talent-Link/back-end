import { Request, Response } from "express";
import prisma from "../../../shared/database/prisma";

const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";
const GROQ_MODEL = "llama-3.3-70b-versatile";

type QuestionType = "MULTIPLE_CHOICE" | "OPEN_TEXT";

interface Question {
  type: QuestionType;
  text: string;
  options?: string[];
}

function buildPrompt(
  type: QuestionType,
  questions: { text: string }[]
): string {
  const typeText =
    type === "MULTIPLE_CHOICE" ? "de múltipla escolha" : "aberta";
  const questionsText = questions
    .map((q, i) => `${i + 1}. ${q.text}`)
    .join("\n");

  const instruction =
    type === "MULTIPLE_CHOICE"
      ? "Se for de múltipla escolha, inclua 4 opções claras e diretas (A, B, C, D)."
      : "Não inclua alternativas. Apenas o enunciado da pergunta aberta.";

  return `Você é um gerador de perguntas para um formulário de recrutamento. 
Com base nas perguntas abaixo, gere uma NOVA questão ${typeText}, relacionada ao mesmo contexto, mas que ainda não tenha sido perguntada. 
${instruction}

Perguntas já existentes:
${questionsText}

Nova pergunta:`;
}

function extractOptions(questionText: string): string[] {
  const optionRegex = /\n\s*[A-D]\)\s*(.+)/g;
  const options: string[] = [];
  for (const match of questionText.matchAll(optionRegex)) {
    if (match[1]) options.push(match[1].trim());
  }
  return options;
}

export async function generateQuestionFromLocal(
  req: Request,
  res: Response
): Promise<void> {
  try {
    const { type, questions } = req.body;

    if (!questions || !Array.isArray(questions) || questions.length === 0) {
      res.status(400).send("É necessário fornecer as questões atuais.");
      return;
    }

    const prompt = buildPrompt(type, questions);

    const response = await fetch(GROQ_API_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: GROQ_MODEL,
        messages: [{ role: "user", content: prompt }],
        max_tokens: 200,
      }),
    });

    const data = await response.json();
    const rawText = data.choices?.[0]?.message?.content?.trim();

    if (!rawText) {
      res.status(400).send("A questão gerada é inválida.");
      return;
    }

    // Extrai apenas a pergunta, limpando prefixos e asteriscos
    const cleanedText = rawText
      .split("**")
      .pop() // se vier entre **
      ?.split(":")
      .pop() // se tiver introdução com dois pontos
      ?.replace(/^[-–*●]+/, "") // remove marcadores iniciais
      ?.replace(/^["“”]+|["“”]+$/g, "") // remove aspas
      ?.trim();

    const generatedQuestion: Question = {
      text: cleanedText || rawText,
      type,
      options: type === "MULTIPLE_CHOICE" ? extractOptions(rawText) : undefined,
    };

    console.log("Resposta da IA:", rawText);

    res.status(200).json(generatedQuestion);
  } catch (error) {
    console.error("Erro ao gerar questão a partir das questões locais:", error);
    res.status(500).send("Erro interno ao gerar questão.");
  }
}
