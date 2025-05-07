import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import nodemailer from "nodemailer";

const prisma = new PrismaClient();

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

export async function sendNotification(req: Request, res: Response): Promise<void> {
  try {
    const { userId, type, title, message, sendEmail } = req.body;

    const user = await prisma.user.findUnique({ where: { id: userId } });

    if (!user) {
      res.status(404).json({ error: "Usuário não encontrado." });
      return;
    }

    if (sendEmail) {
      await transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: user.email,
        subject: title || "Nova Notificação",
        text: message,
      });
    }

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
      res.status(200).json({ notifications: [] });
      return;
    }

    res.status(200).json({ notifications });
  } catch (error) {
    console.error("Erro ao buscar notificações:", error);
    res.status(500).json({ error: "Erro ao buscar notificações." });
  }
}
