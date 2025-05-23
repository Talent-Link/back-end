import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import { create } from "domain";

const prisma = new PrismaClient();

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

export async function getOpportunityById(
  req: Request,
  res: Response
): Promise<void> {
  try {
    const { id } = req.params;
    const opportunity = await prisma.opportunity.findUnique({
      where: { id },
      include: {
        form: true,
        company: true,
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

// Função para criar oportunidade com campo de requisitos
export async function createOpportunity(
  req: Request,
  res: Response
): Promise<void> {
  try {
    const user = req.user as any;
    const {
      title,
      description,
      location,
      companyId,
      formId,
      requirements,
      benefits,
    } = req.body;

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

    const company = await prisma.company.findUnique({
      where: { id: companyId },
    });
    if (!company || company.recruiterId !== user.id) {
      res.status(403).send("Empresa não encontrada ou sem permissão.");
      return;
    }

    if (formId) {
      const form = await prisma.form.findUnique({ where: { id: formId } });
      if (!form || form.recruiterId !== user.id) {
        res.status(403).send("Formulário não encontrado ou sem permissão.");
        return;
      }
    }

    const data: any = { title, description, location, companyId, benefits };

    // Verificando e incluindo requisitos se existirem
    if (requirements) data.requirements = requirements;

    if (formId) data.formId = formId;

    const opportunity = await prisma.opportunity.create({ data });
    res.status(201).json(opportunity);
  } catch (error) {
    console.error("Erro ao criar oportunidade:", error);
    res.status(500).send("Erro interno ao criar oportunidade.");
  }
}

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

    const responses = await prisma.response.findMany({
      where: { opportunityId },
      include: {
        candidate: { select: { id: true, name: true, email: true } },
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

export async function searchOpportunities(
  req: Request,
  res: Response
): Promise<void> {
  try {
    const { title, location, companyName } = req.query;

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

    res.status(200).json(opportunities);
  } catch (error) {
    console.error("Erro ao buscar oportunidades:", error);
    res.status(500).send("Erro interno ao buscar oportunidades.");
  }
}

export async function withdrawApplication(
  req: Request,
  res: Response
): Promise<void> {
  try {
    const user = req.user as any;
    const { responseId } = req.params;

    if (!responseId) {
      res.status(400).json({ message: "ID da candidatura é obrigatório." });
      return;
    }

    if (!user) {
      res.status(401).json({ message: "Usuário não autenticado." });
      return;
    }

    if (user.userType !== "CANDIDATO") {
      res
        .status(403)
        .json({ message: "Apenas candidatos podem retirar candidaturas." });
      return;
    }

    const response = await prisma.response.findUnique({
      where: { id: responseId },
    });

    if (!response) {
      res.status(404).json({ message: "Candidatura não encontrada." });
      return;
    }

    if (response.candidateId !== user.id) {
      res.status(403).json({
        message: "Você não tem permissão para retirar esta candidatura.",
      });
      return;
    }

    await prisma.response.delete({
      where: { id: response.id },
    });

    res.status(200).json({ message: "Candidatura retirada com sucesso." });
  } catch (error) {
    console.error("Erro ao retirar candidatura:", error);
    res.status(500).send("Erro interno ao retirar candidatura.");
  }
}

export async function getUserOpportunities(
  req: Request,
  res: Response
): Promise<void> {
  try {
    const user = req.user as any;

    if (!user) {
      res.status(401).json({ message: "Usuário não autenticado." });
      return;
    }

    if (user.userType !== "CANDIDATO") {
      res
        .status(403)
        .json({ message: "Apenas candidatos podem ver suas candidaturas." });
      return;
    }

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
              },
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    if (applications.length === 0) {
      res.status(404).json({
        message: "Você ainda não se candidatou a nenhuma oportunidade.",
      });
      return;
    }

    const opportunities = applications.map((app) => ({
      responseId: app.id,
      title: app.opportunity?.title,
      companyName: app.opportunity?.company?.name,
      createdAt: app.createdAt,
    }));

    res.status(200).json(opportunities);
  } catch (error) {
    console.error("Erro ao buscar oportunidades do candidato:", error);
    res.status(500).send("Erro interno ao buscar oportunidades.");
  }
}

export async function deleteOpportunity(
  req: Request,
  res: Response
): Promise<void> {
  try {
    const user = req.user as any;
    const { id } = req.params;

    if (!user) {
      res.status(401).send("Usuário não autenticado.");
      return;
    }

    if (user.userType !== "RH") {
      res.status(403).send("Acesso restrito a RH.");
      return;
    }

    const opportunity = await prisma.opportunity.findUnique({
      where: { id },
      include: { company: true },
    });

    if (!opportunity) {
      res.status(404).send("Oportunidade não encontrada.");
      return;
    }

    if (opportunity.company.recruiterId !== user.id) {
      res.status(403).send("Sem permissão para excluir esta oportunidade.");
      return;
    }

    // Excluir todas as respostas associadas à oportunidade
    await prisma.response.deleteMany({
      where: { opportunityId: id },
    });

    // Agora exclui a oportunidade
    await prisma.opportunity.delete({ where: { id } });

    res
      .status(200)
      .send("Oportunidade e respostas associadas excluídas com sucesso.");
  } catch (error) {
    console.error("Erro ao excluir oportunidade:", error);
    res.status(500).send("Erro interno ao excluir oportunidade.");
  }
}

// função para desativar oportunidade
export async function deactivateOpportunity(
  req: Request,
  res: Response
): Promise<void> {
  try {
    const user = req.user as any;
    const { id } = req.params;

    if (!user) {
      res.status(401).send("Usuário não autenticado.");
      return;
    }

    if (user.userType !== "RH") {
      res.status(403).send("Acesso restrito a RH.");
      return;
    }

    const opportunity = await prisma.opportunity.findUnique({
      where: { id },
      include: { company: true },
    });

    if (!opportunity) {
      res.status(404).send("Oportunidade não encontrada.");
      return;
    }

    if (opportunity.company.recruiterId !== user.id) {
      res.status(403).send("Sem permissão para desativar esta oportunidade.");
      return;
    }

    // Atualiza o status da oportunidade para inativa
    await prisma.opportunity.update({
      where: { id },
      data: { isActive: false },
    });

    res.status(200).send("Oportunidade desativada com sucesso.");
  } catch (error) {
    console.error("Erro ao desativar oportunidade:", error);
    res.status(500).send("Erro interno ao desativar oportunidade.");
  }
}

export async function activateOpportunity(
  req: Request,
  res: Response
): Promise<void> {
  try {
    const user = req.user as any;
    const { id } = req.params;

    if (!user) {
      res.status(401).send("Usuário não autenticado.");
      return;
    }

    if (user.userType !== "RH") {
      res.status(403).send("Acesso restrito a RH.");
      return;
    }

    const opportunity = await prisma.opportunity.findUnique({
      where: { id },
      include: { company: true },
    });

    if (!opportunity) {
      res.status(404).send("Oportunidade não encontrada.");
      return;
    }

    if (opportunity.company.recruiterId !== user.id) {
      res.status(403).send("Sem permissão para ativar esta oportunidade.");
      return;
    }

    // Atualiza o status da oportunidade para ativa
    await prisma.opportunity.update({
      where: { id },
      data: { isActive: true },
    });

    res.status(200).send("Oportunidade ativada com sucesso.");
  } catch (error) {
    console.error("Erro ao ativar oportunidade:", error);
    res.status(500).send("Erro interno ao ativar oportunidade.");
  }
}
