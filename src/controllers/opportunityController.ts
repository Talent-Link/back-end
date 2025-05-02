import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

/**
 * GET /opportunities
 * Retorna todas as oportunidades, incluindo dados básicos da empresa.
 */
export async function getAllOpportunities(req: Request, res: Response): Promise<void> {
  try {
    const opportunities = await prisma.opportunity.findMany({
      include: {
        company: {
          select: { name: true, address: true }
        }
      },
      orderBy: { createdAt: "desc" }
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
export async function getOpportunityById(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const opportunity = await prisma.opportunity.findUnique({
      where: { id },
      include: {
        company: { select: { name: true, description: true, address: true } }
      }
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
export async function createOpportunity(req: Request, res: Response): Promise<void> {
  try {
    const user = req.user as any;
    const { title, description, location, companyId, formId } = req.body;

    // validações básicas
    if (!user || user.userType !== "RH") {
      res.status(403).send("Apenas RH pode criar oportunidades.");
      return;
    }
    if (!title || !description || !location || !companyId) {
      res.status(400).send("title, description, location e companyId são obrigatórios.");
      return;
    }

    // verifica se a empresa pertence ao RH
    const company = await prisma.company.findUnique({ where: { id: companyId } });
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
 * POST /opportunities/associate-form
 * Associa um formulário existente a uma oportunidade.
 */
export async function associateFormToOpportunity(req: Request, res: Response): Promise<void> {
  try {
    const { opportunityId, formId } = req.body;
    const user = req.user as any;

    if (!user) {
      res.status(401).send("Usuário não autenticado.");
      return;
    }
    if (user.userType !== "RH") {
      res.status(403).send("Apenas RH pode associar formulários.");
      return;
    }

    const opportunity = await prisma.opportunity.findUnique({
      where: { id: opportunityId },
      include: { company: true }
    });
    if (!opportunity) {
      res.status(404).send("Oportunidade não encontrada.");
      return;
    }
    if (opportunity.company.recruiterId !== user.id) {
      res.status(403).send("Sem permissão para alterar esta oportunidade.");
      return;
    }

    const form = await prisma.form.findUnique({ where: { id: formId } });
    if (!form || form.recruiterId !== user.id) {
      res.status(404).send("Formulário não encontrado ou sem permissão.");
      return;
    }

    const updated = await prisma.opportunity.update({
      where: { id: opportunityId },
      data: { formId },
      include: {
        company: { select: { name: true, address: true } },
        form:    { select: { id: true, title: true } }
      }
    });
    res.status(200).json(updated);
  } catch (error) {
    console.error("Erro ao associar formulário:", error);
    res.status(500).send("Erro interno ao associar formulário.");
  }
}

/**
 * GET /opportunities/:id/responses
 * Retorna todas as respostas dos candidatos para uma oportunidade.
 * Só RH dono da empresa pode acessar.
 */
export async function getResponsesByOpportunity(req: Request, res: Response): Promise<void> {
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
        form: { select: { id: true, title: true } },
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