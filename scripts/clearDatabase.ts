// scripts/clearDatabase.ts
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function clearDB() {
  try {
    await prisma.user.deleteMany();
    // repita para outras tabelas se necessário
    console.log("Banco de dados limpo com sucesso!");
  } catch (error) {
    console.error("Erro ao limpar o banco:", error);
  } finally {
    await prisma.$disconnect();
  }
}

clearDB();
