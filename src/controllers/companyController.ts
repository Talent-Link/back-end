import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

/**
 * Cria ou atualiza as informações da empresa associada ao usuário RH.
 */
export async function createOrUpdateCompany(req: Request, res: Response): Promise<void> {
  try {
    const user = req.user as any; // Usuário autenticado
    const { name, description, address } = req.body;

    // Verifica se o usuário é do tipo RH
    if (!user || user.userType !== "RH") {
      res.status(403).send("Apenas usuários RH podem gerenciar empresas.");
      return;
    }

    // Verifica se os campos obrigatórios foram fornecidos
    if (!name || !address) {
      res.status(400).send("Nome e endereço são obrigatórios.");
      return;
    }

    // Verifica se a empresa já existe para o usuário RH
    const existingCompany = await prisma.company.findUnique({
      where: { recruiterId: user.id },
    });

    if (existingCompany) {
      // Atualiza a empresa existente
      const updatedCompany = await prisma.company.update({
        where: { recruiterId: user.id },
        data: { name, description, address },
      });
      res.status(200).json(updatedCompany);
    } else {
      // Cria uma nova empresa
      const newCompany = await prisma.company.create({
        data: {
          name,
          description,
          address,
          recruiterId: user.id,
        },
      });
      res.status(201).json(newCompany);
    }
  } catch (error) {
    console.error("Erro ao gerenciar empresa:", error);
    res.status(500).send("Erro interno ao gerenciar empresa.");
  }
}

/**
 * Obtém as informações da empresa associada ao usuário RH autenticado.
 */
export async function getCompany(req: Request, res: Response): Promise<void> {
  try {
    const user = req.user as any; // Usuário autenticado

    // Verifica se o usuário é do tipo RH
    if (!user || user.userType !== "RH") {
      res.status(403).send("Apenas usuários RH podem visualizar empresas.");
      return;
    }

    // Busca a empresa associada ao usuário RH
    const company = await prisma.company.findUnique({
      where: { recruiterId: user.id },
    });

    if (!company) {
      res.status(404).send("Nenhuma empresa encontrada para este usuário.");
      return;
    }

    res.status(200).json(company);
  } catch (error) {
    console.error("Erro ao buscar empresa:", error);
    res.status(500).send("Erro interno ao buscar empresa.");
  }
}