import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

type QuestionType = "MULTIPLE_CHOICE" | "OPEN_TEXT";

interface BaseQuestion {
  type: QuestionType;
  text: string;
}

interface MultipleChoiceQuestion extends BaseQuestion {
  type: "MULTIPLE_CHOICE";
  options: string[];
}

interface OpenTextQuestion extends BaseQuestion {
  type: "OPEN_TEXT";
}

type Question = MultipleChoiceQuestion | OpenTextQuestion;

export async function createForm(req: Request, res: Response): Promise<void> {
  try {
    const { title, description, questions } = req.body;
    const user = req.user as any;
    if (!user) {
      res.status(401).send("Usuário não autenticado");
      return;
    }

    // 1) validações básicas
    if (typeof title !== "string" || title.trim() === "") {
      res.status(400).send("Título é obrigatório.");
      return;
    }
    if (!Array.isArray(questions) || questions.length === 0) {
      res.status(400).send("Questions deve ser um array não vazio.");
      return;
    }

    // 2) valida cada questão
    for (const q of questions) {
      if (typeof q.type !== "string" || typeof q.text !== "string") {
        res
          .status(400)
          .send("Cada questão precisa ter 'type' e 'text' válidos.");
        return;
      }
      if (q.type === "MULTIPLE_CHOICE") {
        if (
          !Array.isArray((q as any).options) ||
          (q as any).options.length < 2
        ) {
          res
            .status(400)
            .send(
              "MULTIPLE_CHOICE precisa de um array 'options' com pelo menos 2 itens."
            );
          return;
        }
        for (const opt of (q as any).options) {
          if (typeof opt !== "string" || opt.trim() === "") {
            res.status(400).send("Cada opção deve ser uma string não vazia.");
            return;
          }
        }
      } else if (q.type === "OPEN_TEXT") {
        // não precisa de options
      } else {
        res.status(400).send(`Tipo de questão inválido: ${q.type}`);
        return;
      }
    }

    // 3) persiste o formulário com o JSON validado
    const form = await prisma.form.create({
      data: {
        title,
        description,
        questions, // já é um JSON compatível
        recruiterId: user.id,
      },
    });

    res.status(201).json(form);
  } catch (error) {
    console.error("Erro ao criar formulário:", error);
    res.status(500).send("Erro interno ao criar formulário.");
  }
}

export async function getForms(req: Request, res: Response): Promise<void> {
  try {
    const user = req.user as any; // Usuário autenticado
    if (!user) {
      res.status(401).send("Usuário não autenticado.");
      return;
    }

    // Verifica se o usuário é um RH
    if (user.userType !== "RH") {
      res
        .status(403)
        .send("Acesso negado. Apenas RHs podem listar formulários.");
      return;
    }

    // Busca os formulários criados pelo RH autenticado
    const forms = await prisma.form.findMany({
      where: {
        recruiterId: user.id, // Filtra pelo ID do RH autenticado
      },
      orderBy: {
        createdAt: "desc", // Ordena por data de criação (mais recentes primeiro)
      },
    });

    res.status(200).json(forms);
  } catch (error) {
    console.error("Erro ao listar formulários:", error);
    res.status(500).send("Erro interno ao listar formulários.");
  }
}

export async function deleteForm(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params; // ID do formulário a ser deletado
    const user = req.user as any; // Usuário autenticado

    if (!user) {
      res.status(401).send("Usuário não autenticado.");
      return;
    }

    // Verifica se o usuário é um RH
    if (user.userType !== "RH") {
      res
        .status(403)
        .send("Acesso negado. Apenas RHs podem deletar formulários.");
      return;
    }

    // Busca o formulário no banco de dados
    const form = await prisma.form.findUnique({
      where: { id },
    });

    if (!form) {
      res.status(404).send("Formulário não encontrado.");
      return;
    }

    // Verifica se o formulário pertence ao RH autenticado
    if (form.recruiterId !== user.id) {
      res
        .status(403)
        .send("Você não tem permissão para deletar este formulário.");
      return;
    }

    // Deleta o formulário
    await prisma.form.delete({
      where: { id },
    });

    res.status(200).send("Formulário deletado com sucesso.");
  } catch (error) {
    console.error("Erro ao deletar formulário:", error);
    res.status(500).send("Erro interno ao deletar formulário.");
  }
}
