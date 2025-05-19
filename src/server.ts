import app from "./app";
import dotenv from "dotenv";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
dotenv.config();

async function main() {
  await prisma.$connect();
  
const PORT = process.env.PORT || 3000;
const HOST = process.env.HOST || "0.0.0.0";


  app.listen(PORT,() => {
    console.log(`Servidor rodando na porta ${PORT}`);
    console.log(`URL de autenticação RH: http://${HOST}:${PORT}/auth/google/RH`);
    console.log(`URL de autenticação Candidato: http://${HOST}:${PORT}/auth/google/CANDIDATO`);
    console.log(`Documentação da API: http://${HOST}:${PORT}/api-docs`);
  });
}

main().catch((error) => {
  console.error("Erro ao iniciar o servidor:", error);
  process.exit(1);
});
