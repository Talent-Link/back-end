import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import nodemailer from "nodemailer";

const prisma = new PrismaClient();

// Configuração do Nodemailer
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

/**
 * POST /notifications/send
 * Envia uma notificação (geral ou feedback) para o usuário.
 */
export async function sendNotification(req: Request, res: Response): Promise<void> {
  try {
    const { userId, type, title, message, sendEmail } = req.body;

    // Verifica se o usuário existe
    const user = await prisma.user.findUnique({ where: { id: userId } });

    if (!user) {
      res.status(404).json({ error: "Usuário não encontrado." });
      return;
    }

    // Verifica o tipo de notificação (FEEDBACK ou GENERAL)
    if (type !== "FEEDBACK" && type !== "GENERAL") {
      res.status(400).json({ error: "Tipo de notificação inválido. Use 'FEEDBACK' ou 'GENERAL'." });
      return;
    }

    // Envia por email se necessário
    if (sendEmail && user.email) {
      await transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: user.email,
        subject: title || "Nova Notificação",
        text: message,
      });
    }

    // Salva a notificação no banco de dados
    const notification = await prisma.notification.create({
      data: {
        userId,
        type,
        title: title || "Nova Notificação",
        message,
        read: false,
      },
    });

    res.status(200).json({ message: "Notificação enviada com sucesso.", notification });
  } catch (error) {
    console.error("Erro ao enviar notificação:", error);
    res.status(500).json({ error: "Erro ao enviar notificação." });
  }
}

/**
 * POST /feedbacks/send
 * Envia um feedback para o usuário.
 */
export async function sendFeedback(req: Request, res: Response): Promise<void> {
  try {
    const { userId, title, message, status, score, sendEmail } = req.body;

    // Verifica se o usuário existe
    const user = await prisma.user.findUnique({ where: { id: userId } });

    if (!user) {
      res.status(404).json({ error: "Usuário não encontrado." });
      return;
    }

    // Verifica se o status é válido
    const validStatuses = ["approved", "rejected", "in-progress"];
    if (status && !validStatuses.includes(status)) {
      res.status(400).json({ error: "Status inválido. Use 'approved', 'rejected' ou 'in-progress'." });
      return;
    }

    // Envia por email se necessário
    if (sendEmail && user.email) {
      await transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: user.email,
        subject: title || "Seu Feedback",
        text: message,
      });
    }

    // Salva o feedback como uma notificação
    const feedback = await prisma.notification.create({
      data: {
        userId,
        type: "FEEDBACK",
        title,
        message,
        status: status || "in-progress",
        score: score || null,
        read: false,
      },
    });

    res.status(200).json({ message: "Feedback enviado com sucesso.", feedback });
  } catch (error) {
    console.error("Erro ao enviar feedback:", error);
    res.status(500).json({ error: "Erro ao enviar feedback." });
  }
}

/**
 * GET /feedbacks
 * Retorna todos os feedbacks do usuário logado.
 */
export async function getUserFeedbacks(req: Request, res: Response): Promise<void> {
  try {
    const user = req.user as any;

    if (!user) {
      res.status(401).json({ message: "Usuário não autenticado." });
      return;
    }

    // Busca todos os feedbacks do usuário
    const feedbacks = await prisma.notification.findMany({
      where: {
        userId: user.id,
        type: "FEEDBACK",
      },
      orderBy: { createdAt: "desc" },
    });

    // Verifica se existem feedbacks
    if (feedbacks.length === 0) {
      res.status(200).json({ feedbacks: [], message: "Nenhum feedback encontrado." });
      return;
    }

    res.status(200).json({ feedbacks });
  } catch (error) {
    console.error("Erro ao buscar feedbacks:", error);
    res.status(500).json({ error: "Erro ao buscar feedbacks." });
  }
}

/**
 * GET /notifications
 * Retorna todas as notificações do usuário logado.
 */
export async function getNotifications(req: Request, res: Response): Promise<void> {
  try {
    const user = req.user as any;

    if (!user) {
      res.status(401).json({ message: "Usuário não autenticado." });
      return;
    }

    const notifications = await prisma.notification.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
    });

    if (notifications.length === 0) {
      res.status(200).json({ notifications: [], message: "Nenhuma notificação encontrada." });
      return;
    }

    res.status(200).json({ notifications });
  } catch (error) {
    console.error("Erro ao buscar notificações:", error);
    res.status(500).json({ error: "Erro ao buscar notificações." });
  }
}
