import { Request, Response } from "express";
import prisma from "../../../shared/database/prisma";

/**
 * Cria ou atualiza as informações da empresa associada ao usuário RH.
 */
export async function createOrUpdateCompany(req: Request, res: Response): Promise<void> {
  try {
    const user = req.user as any; // Usuário autenticado
    const { name, description, address, logoUrl } = req.body;

    // Verifica se o usuário é do tipo RH
    if (!user || user.userType !== "RH") {
      res.status(403).json({ message: "Apenas usuários RH podem gerenciar empresas." });
      return;
    }

    // Verifica se os campos obrigatórios foram fornecidos
    if (!name || !address) {
      res.status(400).json({ message: "Nome e endereço são obrigatórios." });
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
        data: { name, description, address, logoUrl },
      });
      res.status(200).json(updatedCompany);
    } else {
      // Cria uma nova empresa
      const newCompany = await prisma.company.create({
        data: {
          name,
          description,
          address,
          logoUrl,
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
      res.status(403).json({ message: "Apenas usuários RH podem visualizar empresas." });
      return;
    }

    // Busca a empresa associada ao usuário RH
    const company = await prisma.company.findUnique({
      where: { recruiterId: user.id },
    });

    if (!company) {
      res.status(404).json({ message: "Nenhuma empresa encontrada para este usuário." });
      return;
    }

    res.status(200).json(company);
  } catch (error) {
    console.error("Erro ao buscar empresa:", error);
    res.status(500).json({ message: "Erro interno ao buscar empresa." });
  }
}

// controllers/companyController.ts
export async function listCompaniesByRecruiter(req: Request, res: Response): Promise<void> {
  try {
    const user = req.user as any;

    if (!user || user.userType !== "RH") {
      res.status(403).json({ message: "Apenas RHs podem visualizar empresas." });
      return;
    }

    const companies = await prisma.company.findMany({
      where: { recruiterId: user.id },
      select: { id: true, name: true, logoUrl: true },
    });

    res.status(200).json(companies);
  } catch (error) {
    console.error("Erro ao listar empresas do RH:", error);
    res.status(500).json({ message: "Erro interno ao buscar empresas." });
  }
}

/**
 * Upload ou atualização da logo da empresa
 */
export async function uploadCompanyLogo(req: Request, res: Response): Promise<void> {
  try {
    const user = req.user as any;
    const { logoUrl } = req.body;

    if (!user || user.userType !== "RH") {
      res.status(403).json({ message: "Apenas usuários RH podem fazer upload de logos." });
      return;
    }

    if (!logoUrl) {
      res.status(400).json({ message: "URL da logo é obrigatória." });
      return;
    }

    // Buscar empresa existente
    let company = await prisma.company.findUnique({
      where: { recruiterId: user.id }
    });

    if (!company) {
      res.status(404).json({ message: "Empresa não encontrada. Crie uma empresa primeiro." });
      return;
    }

    const previousLogoUrl = company.logoUrl;

    // Atualizar logo da empresa
    company = await prisma.company.update({
      where: { recruiterId: user.id },
      data: { logoUrl }
    });

    res.json({
      message: previousLogoUrl ? 'Logo atualizada com sucesso' : 'Logo adicionada com sucesso',
      logoUrl: company.logoUrl,
      previousLogoUrl: previousLogoUrl
    });
  } catch (error) {
    console.error('Erro ao fazer upload da logo:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
}

/**
 * Excluir logo da empresa
 */
export async function deleteCompanyLogo(req: Request, res: Response): Promise<void> {
  try {
    const user = req.user as any;

    if (!user || user.userType !== "RH") {
      res.status(403).json({ message: "Apenas usuários RH podem excluir logos." });
      return;
    }

    // Buscar empresa existente
    const company = await prisma.company.findUnique({
      where: { recruiterId: user.id }
    });

    if (!company) {
      res.status(404).json({ message: "Empresa não encontrada." });
      return;
    }

    if (!company.logoUrl) {
      res.status(400).json({ message: "Nenhuma logo encontrada para excluir." });
      return;
    }

    const deletedLogoUrl = company.logoUrl;

    // Remover logo da empresa
    await prisma.company.update({
      where: { recruiterId: user.id },
      data: { logoUrl: null }
    });

    res.json({
      message: 'Logo excluída com sucesso',
      deletedLogoUrl: deletedLogoUrl
    });
  } catch (error) {
    console.error('Erro ao excluir logo:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
}
