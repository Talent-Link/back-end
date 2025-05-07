import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

/**
 * GET /opportunities
 * Retorna todas as oportunidades, incluindo dados básicos da empresa.
 */
export async function getAllOpportunities(
  req: Request,
  res: Response
): Promise<void> {
  try {
    const opportunities = await prisma.opportunity.findMany({
      include: {
        company: {
          select: { name: true, address: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });
    res.status(200).json(opportunities);
  } catch (error) {
    console.error("Erro ao buscar oportunidades:", error);
    res.status(500).send("Erro interno ao buscar oportunidades.");
  }
}

/**
 * GET /opportunities/:id
 * Retorna detalhes de uma oportunidade, sem as respostas.
 */
export async function getOpportunityById(
  req: Request,
  res: Response
): Promise<void> {
  try {
    const { id } = req.params;
    const opportunity = await prisma.opportunity.findUnique({
      where: { id },
      include: {
        company: { select: { name: true, description: true, address: true } },
      },
    });

    if (!opportunity) {
      res.status(404).send("Oportunidade não encontrada.");
      return;
    }

    res.status(200).json(opportunity);
  } catch (error) {
    console.error("Erro ao buscar oportunidade:", error);
    res.status(500).send("Erro interno ao buscar oportunidade.");
  }
}

/**
 * POST /opportunities
 * Cria uma nova vaga associada à empresa do RH autenticado.
 */
export async function createOpportunity(
  req: Request,
  res: Response
): Promise<void> {
  try {
    const user = req.user as any;
    const { title, description, location, companyId, formId } = req.body;

    // validações básicas
    if (!user || user.userType !== "RH") {
      res.status(403).send("Apenas RH pode criar oportunidades.");
      return;
    }
    if (!title || !description || !location || !companyId) {
      res
        .status(400)
        .send("title, description, location e companyId são obrigatórios.");
      return;
    }

    // verifica se a empresa pertence ao RH
    const company = await prisma.company.findUnique({
      where: { id: companyId },
    });
    if (!company || company.recruiterId !== user.id) {
      res.status(403).send("Empresa não encontrada ou sem permissão.");
      return;
    }

    // opcional: valida formId se passado
    if (formId) {
      const form = await prisma.form.findUnique({ where: { id: formId } });
      if (!form || form.recruiterId !== user.id) {
        res.status(403).send("Formulário não encontrado ou sem permissão.");
        return;
      }
    }

    // prepara payload dinâmico para evitar undefined
    const data: any = { title, description, location, companyId };
    if (formId) data.formId = formId;

    const opportunity = await prisma.opportunity.create({ data });
    res.status(201).json(opportunity);
  } catch (error) {
    console.error("Erro ao criar oportunidade:", error);
    res.status(500).send("Erro interno ao criar oportunidade.");
  }
}

/**
 * GET /opportunities/:id/responses
 * Retorna todas as respostas dos candidatos para uma oportunidade.
 * Só RH dono da empresa pode acessar.
 */
export async function getResponsesByOpportunity(
  req: Request,
  res: Response
): Promise<void> {
  try {
    const { id: opportunityId } = req.params;
    const user = req.user as any;

    if (!user) {
      res.status(401).send("Usuário não autenticado.");
      return;
    }
    if (user.userType !== "RH") {
      res.status(403).send("Acesso restrito a RH.");
      return;
    }

    const opportunity = await prisma.opportunity.findUnique({
      where: { id: opportunityId },
      include: {
        company: true,
        form: true,
      },
    });

    if (!opportunity) {
      res.status(404).send("Oportunidade não encontrada.");
      return;
    }
    if (opportunity.company.recruiterId !== user.id) {
      res.status(403).send("Sem permissão para ver estas respostas.");
      return;
    }

    // Busca as respostas associadas à oportunidade
    const responses = await prisma.response.findMany({
      where: { opportunityId },
      include: {
        candidate: { select: { id: true, name: true, email: true } },
        // form: { select: { id: true, title: true } }, // Removed as 'form' is not part of the schema
      },
      orderBy: { createdAt: "desc" },
    });

    res.status(200).json({
      opportunity: {
        id: opportunity.id,
        title: opportunity.title,
        description: opportunity.description,
        location: opportunity.location,
        company: {
          name: opportunity.company.name,
          address: opportunity.company.address,
        },
        form: {
          id: opportunity.form?.id,
          title: opportunity.form?.title,
          description: opportunity.form?.description,
        },
      },
      responses,
    });
  } catch (error) {
    console.error("Erro ao buscar respostas por oportunidade:", error);
    res.status(500).send("Erro interno ao buscar respostas por oportunidade.");
  }
}
/**
 * GET /opportunities/search
 * Permite buscar vagas com base em critérios (ex.: localização, cargo, empresa).
 */
export async function searchOpportunities(
  req: Request,
  res: Response
): Promise<void> {
  try {
    const { title, location, companyName } = req.query;
    console.log("Parâmetros recebidos:", { title, location, companyName });

    const opportunities = await prisma.opportunity.findMany({
      where: {
        AND: [
          title
            ? { title: { contains: String(title), mode: "insensitive" } }
            : {},
          location
            ? { location: { contains: String(location), mode: "insensitive" } }
            : {},
          companyName
            ? {
                company: {
                  name: { contains: String(companyName), mode: "insensitive" },
                },
              }
            : {},
        ],
      },
      include: {
        company: {
          select: { name: true, address: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    console.log("Resultados encontrados:", opportunities);
    res.status(200).json(opportunities);
  } catch (error) {
    console.error("Erro ao buscar oportunidades:", error);
    res.status(500).send("Erro interno ao buscar oportunidades.");
  }
}
/**
 * DELETE /opportunities/:responseId/withdraw
 * Permite que o candidato retire sua candidatura (exclui a resposta) pelo ID da Response.
 */
export async function withdrawApplication(req: Request, res: Response): Promise<void> {
  try {
    const user = req.user as any;
    const { responseId } = req.params;
    console.log("🔥 Iniciando retirada de candidatura...");
    console.log("🔑 Usuário autenticado:", user);
    console.log("🔎 ID da candidatura (Response):", responseId);

    if (!responseId) {
      console.log("❌ ID da candidatura não fornecido.");
      res.status(400).json({ message: "ID da candidatura é obrigatório." });
      return;
    }

    if (!user) {
      res.status(401).json({ message: "Usuário não autenticado." });
      return;
    }

    if (user.userType !== "CANDIDATO") {
      res.status(403).json({ message: "Apenas candidatos podem retirar candidaturas." });
      return;
    }

    // Verifica se a resposta (candidatura) existe e pertence ao candidato
    const response = await prisma.response.findUnique({
      where: { id: responseId },
    });

    console.log("🔍 Candidatura encontrada:", response);

    if (!response) {
      res.status(404).json({ message: "Candidatura não encontrada." });
      return;
    }

    if (response.candidateId !== user.id) {
      res.status(403).json({ message: "Você não tem permissão para retirar esta candidatura." });
      return;
    }

    // Exclui a candidatura (resposta)
    await prisma.response.delete({
      where: { id: response.id },
    });

    console.log("✅ Candidatura excluída com sucesso.");
    res.status(200).json({ message: "Candidatura retirada com sucesso." });
  } catch (error) {
    console.error("❌ Erro ao retirar candidatura:", error);
    res.status(500).send("Erro interno ao retirar candidatura.");
  }
}


/**
 * GET /opportunities/my-applications
 * Retorna todas as oportunidades em que o candidato logado se candidatou.
 */
export async function getUserOpportunities(req: Request, res: Response): Promise<void> {
  try {
    const user = req.user as any;
    console.log("🔥 Verificando candidaturas para o candidato:", user);

    if (!user) {
      res.status(401).json({ message: "Usuário não autenticado." });
      return;
    }

    if (user.userType !== "CANDIDATO") {
      res.status(403).json({ message: "Apenas candidatos podem ver suas candidaturas." });
      return;
    }

    // Busca todas as respostas (candidaturas) do candidato com as oportunidades associadas
    const applications = await prisma.response.findMany({
      where: {
        candidateId: user.id,
      },
      include: {
        opportunity: {
          include: {
            company: {
              select: {
                name: true,
                address: true,
              }
            }
          }
        }
      },
      orderBy: { createdAt: "desc" }
    });

    console.log("🔍 Candidaturas encontradas:", applications);

    if (applications.length === 0) {
      res.status(404).json({ message: "Você ainda não se candidatou a nenhuma oportunidade." });
      return;
    }

    // Verifica se as oportunidades foram corretamente carregadas
    const opportunities = applications
      .filter(app => app.opportunity) // Filtra apenas as que têm oportunidades
      .map((app) => ({
        id: app.opportunity.id,
        title: app.opportunity.title,
        description: app.opportunity.description,
        location: app.opportunity.location,
        company: {
          name: app.opportunity.company?.name,
          address: app.opportunity.company?.address,
        },
        appliedAt: app.createdAt,
      }));

    console.log("✅ Oportunidades aplicadas formatadas:", opportunities);

    if (opportunities.length === 0) {
      res.status(404).json({ message: "Você ainda não se candidatou a nenhuma oportunidade válida." });
      return;
    }

    res.status(200).json(opportunities);
  } catch (error) {
    console.error("❌ Erro ao buscar oportunidades do candidato:", error);
    res.status(500).send("Erro interno ao buscar oportunidades.");
  }
}
