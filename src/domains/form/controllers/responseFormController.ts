import { Request, Response } from "express";
import prisma from "../../../shared/database/prisma";
import { EmailService } from "../../../shared/services/emailService";

export async function submitResponse(req: Request, res: Response): Promise<void> {
  try {
    const { opportunityId, answers } = req.body;
    const user = req.user as any;

    if (!user) {
      res.status(401).send("Usuário não autenticado.");
      return;
    }

    if (user.userType !== "CANDIDATO") {
      res.status(403).send("Acesso negado. Apenas candidatos podem responder formulários.");
      return;
    }

    // Busca a oportunidade e garante que existe e tem formId
    const opportunity = await prisma.opportunity.findUnique({
      where: { id: opportunityId },
      select: { id: true, formId: true },
    });

    if (!opportunity) {
      res.status(404).send("Oportunidade não encontrada.");
      return;
    }

    if (!opportunity.formId) {
      res.status(400).send("Oportunidade não possui formulário associado.");
      return;
    }

    //Verificação: já respondeu?
    const existingResponse = await prisma.response.findFirst({
      where: {
        candidateId: user.id,
        opportunityId: opportunityId,
      },
    });

    if (existingResponse) {
      res.status(409).json({ message: "Você já se candidatou a esta vaga." });
      return;
    }

    // Cria nova resposta
    const response = await prisma.response.create({
      data: {
        candidate: { connect: { id: user.id } },
        opportunity: { connect: { id: opportunityId } },
        answers,
      },
      include: {
        candidate: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        opportunity: {
          select: {
            title: true,
            company: {
              select: {
                name: true
              }
            }
          }
        }
      }
    });

    // 📧 Enviar email de confirmação de candidatura
    try {
      await EmailService.sendApplicationConfirmation({
        candidateName: response.candidate.name || 'Candidato',
        candidateEmail: response.candidate.email,
        opportunityTitle: response.opportunity.title,
        companyName: response.opportunity.company.name,
        applicationDate: response.createdAt
      });
      
      console.log(`[submitResponse] Email de confirmação enviado para ${response.candidate.email}`);
    } catch (emailError) {
      console.error('[submitResponse] Erro ao enviar email de confirmação:', emailError);
      // Email é opcional, não quebra o fluxo da candidatura
    }

    res.status(201).json({
      ...response,
      message: "Candidatura enviada com sucesso! Você receberá um email de confirmação."
    });
  } catch (error) {
    console.error("Erro ao enviar respostas:", error);
    res.status(500).send("Erro interno ao enviar respostas.");
  }
}


export async function getResponses(req: Request, res: Response): Promise<void> {
  try {
    const { formId } = req.params;
    const user = req.user as any;

    if (!user) {
      res.status(401).send("Usuário não autenticado.");
      return;
    }

    if (user.userType !== "RH") {
      res.status(403).send("Acesso negado. Apenas RHs podem visualizar respostas.");
      return;
    }

    const form = await prisma.form.findUnique({
      where: { id: formId },
    });

    if (!form || form.recruiterId !== user.id) {
      res.status(403).send("Você não tem permissão para visualizar as respostas deste formulário.");
      return;
    }

    // Busca todas as oportunidades que usam esse formulário
    const opportunities = await prisma.opportunity.findMany({
      where: { formId },
      select: { id: true },
    });

    const opportunityIds = opportunities.map(o => o.id);

    // Busca todas as respostas dessas oportunidades
    const responses = await prisma.response.findMany({
      where: { opportunityId: { in: opportunityIds } },
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


export async function hasCandidateResponded(
  req: Request,
  res: Response
): Promise<void> {
  try {
    const user = req.user as any;
    const opportunityId = req.params.id;

    if (!user || user.userType !== "CANDIDATO") {
      res.status(403).json({ responded: false });
      return;
    }

    const existing = await prisma.response.findFirst({
      where: {
        candidateId: user.id,
        opportunityId,
      },
    });

    res.status(200).json({ responded: !!existing });
  } catch (error) {
    console.error("Erro ao verificar candidatura:", error);
    res.status(500).json({ responded: false });
  }
}
