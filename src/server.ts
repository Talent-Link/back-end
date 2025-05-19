import app from "./app";
import dotenv from "dotenv";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
dotenv.config();

async function main() {
  try {
    await prisma.$connect();
    console.log("Conectado ao banco de dados com sucesso");

    const PORT = process.env.PORT || 10000;

    app.listen(PORT, () => {
      console.log(`Servidor rodando na porta ${PORT}`);
      console.log(`URL de autenticação RH: http://localhost:${PORT}/auth/google/RH`);
      console.log(`URL de autenticação Candidato: http://localhost:${PORT}/auth/google/CANDIDATO`);
      console.log(`Documentação da API: http://localhost:${PORT}/api-docs`);
    });
  } catch (error) {
    console.error("Erro ao iniciar o servidor:", error);
    process.exit(1);
  }
}

main().catch((error) => {
  console.error("Erro na inicialização do servidor:", error);
  process.exit(1);
});