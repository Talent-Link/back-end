import { Request, Response } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { PrismaClient } from "@prisma/client";
import nodemailer from "nodemailer";
import crypto from "crypto";

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET!;

// Função para registrar um novo usuário e enviar email de confirmação
export async function registerUser(req: Request, res: Response): Promise<void> {
  const { email, password, name, userType } = req.body;

  if (!email || !password || !name || !userType) {
    res.status(400).json({ error: "Email, senha, nome e tipo de usuário são obrigatórios." });
    return;
  }

  try {
    const existingUser = await prisma.user.findUnique({ where: { email } });

    if (existingUser) {
      res.status(409).json({ error: "Email já cadastrado." });
      return;
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    // Gera um token de confirmação
    const emailToken = crypto.randomBytes(32).toString("hex");

    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        userType,
        // isEmailConfirmed: false, // já é padrão se colocou no schema
        emailConfirmationToken: emailToken, // você pode usar esse campo ou criar um campo "emailToken"
      },
    });

    // Cria o link de confirmação
    const confirmLink = `${process.env.APP_URL}/auth/email/confirm?token=${emailToken}`;

    // Configura o nodemailer
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Confirme seu email",
      html: `<p>Olá, ${name}!</p>
             <p>Obrigado por se cadastrar. Para ativar sua conta, clique no link abaixo:</p>
             <a href="${confirmLink}">Confirmar email</a>
             <p>Se não foi você, apenas ignore este email.</p>`,
    };

    await transporter.sendMail(mailOptions);

    res.status(201).json({
      message: "Usuário registrado com sucesso! Por favor, confirme seu email.",
      user: { id: user.id, email: user.email, name: user.name, userType: user.userType }
    });

  } catch (error) {
    console.error("Erro ao registrar usuário:", error);
    res.status(500).json({ error: "Erro ao registrar usuário." });
  }
}

// Função para login com email e senha
export async function loginUser(req: Request, res: Response): Promise<void> {
  const { email, password } = req.body;

  if (!email || !password) {
    res.status(400).json({ error: "Email e senha são obrigatórios." });
    return;
  }

  try {
    const user = await prisma.user.findUnique({ where: { email } });

    if (!user || !user.password) {
      res.status(401).json({ error: "Email ou senha inválidos." });
      return;
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      res.status(401).json({ error: "Email ou senha inválidos." });
      return;
    }

    const token = jwt.sign(
      { sub: user.id, userType: user.userType },
      JWT_SECRET,
      { expiresIn: "1h" }
    );

    res.json({
      message: "Login realizado com sucesso!",
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        userType: user.userType,
      },
    });
  } catch (error) {
    console.error("Erro ao realizar login:", error);
    res.status(500).json({ error: "Erro ao realizar login." });
  }
}


export async function confirmEmail(req: Request, res: Response): Promise<void> {
  const { token } = req.query;

  if (!token || typeof token !== "string") {
    res.status(400).send("Token inválido.");
    return;
  }

  try {
    const user = await prisma.user.findFirst({
      where: { emailConfirmationToken: token },
    });

    if (!user) {
      res.status(400).send("Token de confirmação inválido ou expirado.");
      return;
    }

    await prisma.user.update({
      where: { id: user.id },
      data: { isEmailConfirmed: true },
    });

    res.send("Email confirmado com sucesso! Agora você pode fazer login.");
  } catch (error) {
    console.error("Erro ao confirmar email:", error);
    res.status(500).send("Erro ao confirmar email.");
  }
}
