import { Request, Response } from "express";
import prisma from "../../../shared/database/prisma";

/**
 * Obtém o perfil do usuário autenticado
 */
export async function getProfile(req: Request, res: Response): Promise<void> {
  try {
    const user = req.user as any;
    
    if (!user) {
      res.status(401).json({ error: "Usuário não autenticado." });
      return;
    }

    const userProfile = await prisma.user.findUnique({
      where: { id: user.id },
      select: {
        id: true,
        email: true,
        name: true,
        photoUrl: true,
        userType: true,
        createdAt: true,
        isEmailConfirmed: true,
        company: true,
        _count: {
          select: {
            responses: true,
            notifications: true,
            forms: true,
            favoriteCandidates: true,
            favoritedByRecruiters: true
          }
        }
      }
    });

    if (!userProfile) {
      res.status(404).json({ error: "Perfil do usuário não encontrado." });
      return;
    }

    res.status(200).json(userProfile);
  } catch (error) {
    console.error("Erro ao buscar perfil do usuário:", error);
    res.status(500).json({ error: "Erro interno ao buscar perfil." });
  }
}

/**
 * Atualiza o perfil do usuário autenticado
 */
export async function updateProfile(req: Request, res: Response): Promise<void> {
  try {
    const user = req.user as any;
    const { name, photoUrl } = req.body;
    
    if (!user) {
      res.status(401).json({ error: "Usuário não autenticado." });
      return;
    }

    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: {
        name: name || undefined,
        photoUrl: photoUrl || undefined
      },
      select: {
        id: true,
        email: true,
        name: true,
        photoUrl: true,
        userType: true,
        createdAt: true,
        isEmailConfirmed: true
      }
    });

    res.status(200).json(updatedUser);
  } catch (error) {
    console.error("Erro ao atualizar perfil:", error);
    res.status(500).json({ error: "Erro interno ao atualizar perfil." });
  }
}

/**
 * Obtém as estatísticas do usuário
 */
export async function getUserStats(req: Request, res: Response): Promise<void> {
  try {
    const user = req.user as any;
    
    if (!user) {
      res.status(401).json({ error: "Usuário não autenticado." });
      return;
    }

    let stats;

    if (user.userType === "CANDIDATO") {
      stats = await prisma.user.findUnique({
        where: { id: user.id },
        select: {
          _count: {
            select: {
              responses: true,
              notifications: true,
              favoritedByRecruiters: true
            }
          }
        }
      });
    } else { // RH
      stats = await prisma.user.findUnique({
        where: { id: user.id },
        select: {
          _count: {
            select: {
              forms: true,
              favoriteCandidates: true,
              notifications: true
            }
          },
          company: {
            select: {
              _count: {
                select: {
                  opportunities: true
                }
              }
            }
          }
        }
      });
    }

    res.status(200).json(stats);
  } catch (error) {
    console.error("Erro ao buscar estatísticas:", error);
    res.status(500).json({ error: "Erro interno ao buscar estatísticas." });
  }
}

/**
 * Busca usuários (apenas RH pode buscar candidatos)
 */
export async function searchUsers(req: Request, res: Response): Promise<void> {
  try {
    const user = req.user as any;
    const { search, userType, page = 1, limit = 10 } = req.query;
    
    if (!user) {
      res.status(401).json({ error: "Usuário não autenticado." });
      return;
    }

    // Apenas RH pode buscar candidatos
    if (user.userType !== "RH") {
      res.status(403).json({ error: "Apenas RH pode buscar usuários." });
      return;
    }

    const skip = (Number(page) - 1) * Number(limit);

    const whereConditions: any = {};
    
    if (userType) {
      whereConditions.userType = userType;
    }

    if (search) {
      whereConditions.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } }
      ];
    }

    const users = await prisma.user.findMany({
      where: whereConditions,
      select: {
        id: true,
        email: true,
        name: true,
        photoUrl: true,
        userType: true,
        createdAt: true,
        _count: {
          select: {
            responses: true,
            notifications: true
          }
        }
      },
      skip,
      take: Number(limit),
      orderBy: { createdAt: 'desc' }
    });

    const total = await prisma.user.count({ where: whereConditions });

    res.status(200).json({
      users,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        totalPages: Math.ceil(total / Number(limit))
      }
    });
  } catch (error) {
    console.error("Erro ao buscar usuários:", error);
    res.status(500).json({ error: "Erro interno ao buscar usuários." });
  }
}

/**
 * Obtém usuário específico por ID (apenas RH)
 */
export async function getUserById(req: Request, res: Response): Promise<void> {
  try {
    const user = req.user as any;
    const { id } = req.params;
    
    if (!user) {
      res.status(401).json({ error: "Usuário não autenticado." });
      return;
    }

    // Apenas RH pode ver perfis de outros usuários
    if (user.userType !== "RH" && user.id !== id) {
      res.status(403).json({ error: "Sem permissão para ver este perfil." });
      return;
    }

    const userProfile = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        name: true,
        photoUrl: true,
        userType: true,
        createdAt: true,
        isEmailConfirmed: true,
        responses: user.userType === "RH" ? {
          select: {
            id: true,
            createdAt: true,
            opportunity: {
              select: {
                id: true,
                title: true,
                company: {
                  select: {
                    name: true
                  }
                }
              }
            }
          }
        } : undefined,
        _count: {
          select: {
            responses: true,
            notifications: true
          }
        }
      }
    });

    if (!userProfile) {
      res.status(404).json({ error: "Usuário não encontrado." });
      return;
    }

    res.status(200).json(userProfile);
  } catch (error) {
    console.error("Erro ao buscar usuário:", error);
    res.status(500).json({ error: "Erro interno ao buscar usuário." });
  }
}
