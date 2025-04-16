import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Retorna todos os candidatos que enviaram currículos
export async function getAllCandidates(req: Request, res: Response): Promise<void> {
  try {
    const candidates = await prisma.user.findMany({
      where: { userType: "CANDIDATO" },
      include: {
        responses: true, // Inclui as respostas enviadas pelos candidatos
      },
    });

    res.status(200).json(candidates);
  } catch (error) {
    console.error("Erro ao buscar candidatos:", error);
    res.status(500).send("Erro interno ao buscar candidatos.");
  }
}

// Retorna os detalhes de um candidato específico
export async function getCandidateById(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;

    const candidate = await prisma.user.findUnique({
      where: { id },
      include: {
        responses: {
          include: {
            form: true, // Inclui os formulários associados às respostas
          },
        },
      },
    });

    if (!candidate || candidate.userType !== "CANDIDATO") {
      res.status(404).send("Candidato não encontrado.");
      return;
    }

    res.status(200).json(candidate);
  } catch (error) {
    console.error("Erro ao buscar candidato:", error);
    res.status(500).send("Erro interno ao buscar candidato.");
  }
}