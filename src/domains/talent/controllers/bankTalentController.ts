import { Request, Response } from "express";
import prisma from "../../../shared/database/prisma";

// Função para listar candidatos favoritados (Banco de Talentos)
export async function getTalentBank(req: Request, res: Response): Promise<void> {
  try {
    const user = req.user as any;

    if (!user || user.userType !== "RH") {
      res.status(403).send("Apenas RH pode acessar o Banco de Talentos.");
      return;
    }

    const favorites = await prisma.favoriteCandidate.findMany({
      where: { recruiterId: user.id },
      include: {
        candidate: {
          select: {
            id: true,
            name: true,
            email: true,
            photoUrl: true,
            userType: true,
            responses: {
              select: {
                opportunity: {
                  select: { title: true }
                }
              }
            }
          }
        }
      }
    });

    const talentBank = favorites.map(fav => ({
      ...fav.candidate,
      opportunities: fav.candidate.responses.map(r => r.opportunity.title).join(", ")
    }));

    res.status(200).json(talentBank);
  } catch (error) {
    console.error("Erro ao buscar Banco de Talentos:", error);
    res.status(500).send("Erro interno ao buscar Banco de Talentos.");
  }
}

// Função para favoritar um candidato
export async function favoriteCandidate(req: Request, res: Response): Promise<void> {
  try {
    const user = req.user as any;
    const { candidateId } = req.params;

    if (!user || user.userType !== "RH") {
      res.status(403).send("Apenas RH pode favoritar candidatos.");
      return;
    }

    const candidate = await prisma.user.findUnique({ where: { id: candidateId } });

    if (!candidate || candidate.userType !== "CANDIDATO") {
      res.status(404).send("Candidato não encontrado ou não é um candidato válido.");
      return;
    }

    // Verifica se o candidato já está no banco de talentos
    const existingFavorite = await prisma.favoriteCandidate.findFirst({
      where: { candidateId, recruiterId: user.id }
    });

    if (existingFavorite) {
      res.status(400).send("Candidato já está no Banco de Talentos.");
      return;
    }

    // Adiciona o candidato ao banco de talentos
    await prisma.favoriteCandidate.create({
      data: {
        candidateId,
        recruiterId: user.id
      }
    });

    res.status(201).send("Candidato favoritado com sucesso.");
  } catch (error) {
    console.error("Erro ao favoritar candidato:", error);
    res.status(500).send("Erro interno ao favoritar candidato.");
  }
}

// Função para verificar se um candidato está favoritado
export async function isCandidateFavorited(req: Request, res: Response): Promise<void> {
  try {
    const user = req.user as any;
    const { candidateId } = req.params;

    if (!user || user.userType !== "RH") {
      res.status(403).json({ 
        success: false,
        message: "Apenas RH pode verificar candidatos favoritados." 
      });
      return;
    }

    if (!candidateId) {
      res.status(400).json({ 
        success: false,
        message: "ID do candidato é obrigatório." 
      });
      return;
    }

    // Verifica se o candidato existe
    const candidate = await prisma.user.findUnique({ 
      where: { id: candidateId },
      select: { id: true, userType: true, name: true, email: true }
    });

    if (!candidate || candidate.userType !== "CANDIDATO") {
      res.status(404).json({ 
        success: false,
        message: "Candidato não encontrado." 
      });
      return;
    }

    // Verifica se está favoritado
    const favorite = await prisma.favoriteCandidate.findFirst({
      where: { 
        candidateId, 
        recruiterId: user.id 
      },
      select: { 
        id: true, 
        createdAt: true 
      }
    });

    const isFavorited = !!favorite;

    res.status(200).json({
      success: true,
      data: {
        candidateId,
        candidateName: candidate.name,
        candidateEmail: candidate.email,
        isFavorited,
        favoritedAt: favorite?.createdAt || null,
        favoritedId: favorite?.id || null
      },
      message: isFavorited 
        ? "Candidato está no Banco de Talentos" 
        : "Candidato não está no Banco de Talentos"
    });

  } catch (error) {
    console.error("Erro ao verificar candidato favoritado:", error);
    res.status(500).json({
      success: false,
      message: "Erro interno ao verificar candidato favoritado."
    });
  }
}

// Função para desfavoritar um candidato
export async function unfavoriteCandidate(req: Request, res: Response): Promise<void> {
  try {
    const user = req.user as any;
    const { candidateId } = req.params;

    if (!user || user.userType !== "RH") {
      res.status(403).send("Apenas RH pode desfavoritar candidatos.");
      return;
    }

    // Verifica se o candidato está no banco de talentos
    const existingFavorite = await prisma.favoriteCandidate.findFirst({
      where: { candidateId, recruiterId: user.id }
    });

    if (!existingFavorite) {
      res.status(404).send("Candidato não encontrado no Banco de Talentos.");
      return;
    }

    // Remove o candidato do banco de talentos
    await prisma.favoriteCandidate.delete({
      where: { id: existingFavorite.id }
    });

    res.status(200).send("Candidato removido do Banco de Talentos com sucesso.");
  } catch (error) {
    console.error("Erro ao desfavoritar candidato:", error);
    res.status(500).send("Erro interno ao desfavoritar candidato.");
  }
}
