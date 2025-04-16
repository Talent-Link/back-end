import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Candidato responde ao formulário
export async function submitResponse(req: Request, res: Response): Promise<void> {
  try {
    const { formId, answers } = req.body;
    const user = req.user as any; // Usuário autenticado

    if (!user) {
      res.status(401).send("Usuário não autenticado.");
      return;
    }

    // Verifica se o usuário é um candidato
    if (user.userType !== "CANDIDATO") {
      res.status(403).send("Acesso negado. Apenas candidatos podem responder formulários.");
      return;
    }

    // Verifica se o formulário existe
    const form = await prisma.form.findUnique({
      where: { id: formId },
    });

    if (!form) {
      res.status(404).send("Formulário não encontrado.");
      return;
    }

    // Salva as respostas no banco de dados
    const response = await prisma.response.create({
      data: {
        candidateId: user.id,
        formId,
        answers, // Respostas enviadas pelo candidato
      },
    });

    res.status(201).json(response);
  } catch (error) {
    console.error("Erro ao enviar respostas:", error);
    res.status(500).send("Erro interno ao enviar respostas.");
  }
}

// RH visualiza respostas de um formulário
export async function getResponses(req: Request, res: Response): Promise<void> {
  try {
    const { formId } = req.params;
    const user = req.user as any; // Usuário autenticado

    if (!user) {
      res.status(401).send("Usuário não autenticado.");
      return;
    }

    // Verifica se o usuário é um RH
    if (user.userType !== "RH") {
      res.status(403).send("Acesso negado. Apenas RHs podem visualizar respostas.");
      return;
    }

    // Verifica se o formulário existe e pertence ao RH
    const form = await prisma.form.findUnique({
      where: { id: formId },
    });

    if (!form || form.recruiterId !== user.id) {
      res.status(403).send("Você não tem permissão para visualizar as respostas deste formulário.");
      return;
    }

    // Busca as respostas associadas ao formulário
    const responses = await prisma.response.findMany({
      where: { formId },
      include: {
        candidate: {
          select: { id: true, name: true, email: true },
        },
      },
    });

    res.status(200).json(responses);
  } catch (error) {
    console.error("Erro ao buscar respostas:", error);
    res.status(500).send("Erro interno ao buscar respostas.");
  }
}