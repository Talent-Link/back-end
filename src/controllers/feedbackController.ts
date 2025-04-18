import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import nodemailer from "nodemailer";

const prisma = new PrismaClient();

// Configuração do Nodemailer
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER, // Coloque no .env
    pass: process.env.EMAIL_PASS,
  },
});

export async function sendFeedback(req: Request, res: Response): Promise<void> {
  try {
    const { candidateId } = req.params;
    const { subject, message, automatic } = req.body;

    const candidate = await prisma.user.findUnique({
      where: { id: candidateId },
    });

    if (!candidate || candidate.userType !== "CANDIDATO") {
      res.status(404).json({ error: "Candidato não encontrado." });
      return;
    }

    // Mensagem automática padrão
    const autoMessages: Record<string, string> = {
      aprovado: "Parabéns! Você foi aprovado para a próxima etapa.",
      reprovado: "Agradecemos seu interesse, mas você não foi selecionado.",
      andamento: "Seu processo seletivo está em andamento. Entraremos em contato em breve.",
    };

    const emailMessage = automatic ? autoMessages[message] : message;

    if (!emailMessage) {
      res.status(400).json({ error: "Mensagem inválida." });
      return;
    }

    // Envia o email
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: candidate.email,
      subject: subject || "Atualização sobre sua candidatura",
      text: emailMessage,
    });

    // Salva o feedback no banco
    await prisma.feedback.create({
      data: {
        candidateId,
        message: emailMessage,
        subject: subject || "Atualização sobre sua candidatura",
      },
    });

    res.status(200).json({ message: "Feedback enviado com sucesso." });
  } catch (error) {
    console.error("Erro ao enviar feedback:", error);
    res.status(500).json({ error: "Erro ao enviar feedback." });
  }
}

export async function getFeedbackHistory(req: Request, res: Response): Promise<void> {
  try {
    const { candidateId } = req.params;

    const feedbacks = await prisma.feedback.findMany({
      where: { candidateId },
      orderBy: { createdAt: "desc" },
    });

    res.status(200).json({ feedbacks });
  } catch (error) {
    console.error("Erro ao buscar histórico de feedbacks:", error);
    res.status(500).json({ error: "Erro ao buscar histórico." });
  }
}
