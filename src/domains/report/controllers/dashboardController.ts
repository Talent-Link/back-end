import { Request, Response } from "express";
import prisma from "../../../shared/database/prisma";

export async function getDashboardMetrics(req: Request, res: Response): Promise<void> {
  try {
    const user = req.user as any;
    
    if (!user || user.userType !== 'RH') {
      res.status(403).json({ error: "Acesso negado. Apenas usuários RH podem acessar estas métricas." });
      return;
    }

    // 📊 TOTAL DE CANDIDATURAS (responses das oportunidades da empresa do RH)
    const userCompany = await prisma.company.findUnique({
      where: { recruiterId: user.id }
    });

    if (!userCompany) {
      res.status(404).json({ error: "Empresa não encontrada para este usuário RH." });
      return;
    }

    const totalCandidaturas = await prisma.response.count({
      where: {
        opportunity: {
          companyId: userCompany.id
        }
      }
    });

    // 📈 CANDIDATOS QUALIFICADOS (baseado nas notificações aprovadas)
    const candidatosQualificados = await prisma.notification.count({
      where: {
        userId: user.id,
        status: 'APPROVED'
      }
    });

    const taxaAprovacao = totalCandidaturas > 0 ? (candidatosQualificados / totalCandidaturas) * 100 : 0;

    // 💼 VAGAS ATIVAS (oportunidades ativas da empresa)
    const vagasAtivas = await prisma.opportunity.count({
      where: {
        companyId: userCompany.id,
        isActive: true
      }
    });

    // 📅 CANDIDATURAS MENSAIS (últimos 6 meses)
    const now = new Date();
    const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 5, 1);
    
    const candidaturasPorMes = await prisma.response.findMany({
      where: {
        opportunity: {
          companyId: userCompany.id
        },
        createdAt: {
          gte: sixMonthsAgo
        }
      },
      select: {
        createdAt: true
      },
      orderBy: {
        createdAt: 'asc'
      }
    });

    // Agrupa por mês
    const monthlyData = [];
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    
    for (let i = 0; i < 6; i++) {
      const date = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1);
      const monthName = months[date.getMonth()];
      
      const count = candidaturasPorMes.filter(item => {
        const itemDate = new Date(item.createdAt);
        return itemDate.getMonth() === date.getMonth() && itemDate.getFullYear() === date.getFullYear();
      }).length;
      
      monthlyData.push({
        month: monthName,
        applications: count
      });
    }

    // 📋 STATUS DOS CANDIDATOS (baseado nas notificações)
    const statusCandidatos = await prisma.notification.groupBy({
      by: ['status'],
      where: {
        userId: user.id,
        status: {
          not: null
        }
      },
      _count: {
        status: true
      }
    });

    // Mapeia os status para os nomes corretos
    const statusMapping: { [key: string]: string } = {
      'APPROVED': 'Approved',
      'REJECTED': 'Rejected',
      'PENDING': 'Pending'
    };

    const statusData = statusCandidatos.map(item => ({
      status: statusMapping[item.status || ''] || item.status || 'Unknown',
      count: item._count.status
    }));

    // 📊 RESPOSTA FINAL
    const dashboardData = {
      metrics: {
        totalCandidaturas: {
          value: totalCandidaturas,
          change: "+12%", // Calcule baseado em dados históricos se necessário
          period: "from last period"
        },
        candidatosQualificados: {
          value: candidatosQualificados,
          change: "+8%",
          period: "from last period"
        },
        taxaAprovacao: {
          value: Math.round(taxaAprovacao),
          change: "+5%",
          period: "from last period"
        },
        vagasAtivas: {
          value: vagasAtivas,
          change: "+3%",
          period: "from last period"
        }
      },
      charts: {
        candidaturasMensais: monthlyData,
        statusCandidatos: statusData
      }
    };

    res.json(dashboardData);
  } catch (error) {
    console.error("Erro ao buscar métricas do dashboard:", error);
    res.status(500).json({ error: "Erro interno do servidor." });
  }
}

export async function getCandidatosQualificados(req: Request, res: Response): Promise<void> {
  try {
    const user = req.user as any;
    
    if (!user || user.userType !== 'RH') {
      res.status(403).json({ error: "Acesso negado." });
      return;
    }

    // Busca a empresa do RH
    const userCompany = await prisma.company.findUnique({
      where: { recruiterId: user.id }
    });

    if (!userCompany) {
      res.status(404).json({ error: "Empresa não encontrada." });
      return;
    }

    // Busca candidatos qualificados (responses das oportunidades da empresa)
    const candidatosQualificados = await prisma.response.findMany({
      where: {
        opportunity: {
          companyId: userCompany.id
        }
      },
      include: {
        candidate: {
          select: {
            id: true,
            name: true,
            email: true,
            photoUrl: true
          }
        },
        opportunity: {
          select: {
            id: true,
            title: true,
            description: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: 20 // Últimos 20 candidatos
    });

    res.json(candidatosQualificados);
  } catch (error) {
    console.error("Erro ao buscar candidatos qualificados:", error);
    res.status(500).json({ error: "Erro interno do servidor." });
  }
}

export async function getDetalhesVaga(req: Request, res: Response): Promise<void> {
  try {
    const user = req.user as any;
    const { vagaId } = req.params;
    
    if (!user || user.userType !== 'RH') {
      res.status(403).json({ error: "Acesso negado." });
      return;
    }

    // Busca a empresa do RH
    const userCompany = await prisma.company.findUnique({
      where: { recruiterId: user.id }
    });

    if (!userCompany) {
      res.status(404).json({ error: "Empresa não encontrada." });
      return;
    }

    const vagaDetalhes = await prisma.opportunity.findFirst({
      where: {
        id: vagaId,
        companyId: userCompany.id
      },
      include: {
        responses: {
          include: {
            candidate: {
              select: {
                id: true,
                name: true,
                email: true,
                photoUrl: true
              }
            }
          }
        }
      }
    });

    if (!vagaDetalhes) {
      res.status(404).json({ error: "Vaga não encontrada." });
      return;
    }

    // Calcula estatísticas da vaga
    const totalCandidatos = vagaDetalhes.responses.length;
    
    const vagaComEstatisticas = {
      ...vagaDetalhes,
      estatisticas: {
        totalCandidatos,
        ultimaCandidatura: vagaDetalhes.responses[0]?.createdAt || null
      }
    };

    res.json(vagaComEstatisticas);
  } catch (error) {
    console.error("Erro ao buscar detalhes da vaga:", error);
    res.status(500).json({ error: "Erro interno do servidor." });
  }
}
