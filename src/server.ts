import app from "./app";
import dotenv from "dotenv";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
dotenv.config();

async function main() {
  await prisma.$connect();
  
  const PORT = Number(process.env.PORT) || 3000; // Garante que PORT é sempre um número
  app.listen(PORT, "0.0.0.0", () => { // Adiciona "0.0.0.0" para expor corretamente
    console.log(`Servidor rodando na porta ${PORT}`);
    console.log(`URL de autenticação RH: http://localhost:${PORT}/auth/google/RH`);
    console.log(`URL de autenticação Candidato: http://localhost:${PORT}/auth/google/CANDIDATO`);
    console.log(`Documentação da API: http://localhost:${PORT}/api-docs`);
  });
}

main().catch((error) => {
  console.error("Erro ao iniciar o servidor:", error);
  process.exit(1);
});
