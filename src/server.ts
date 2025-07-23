import dotenv from "dotenv";
dotenv.config();

import app from "./app";
const PORT = process.env.PORT || 4000;

app.listen(PORT, () => {
  const baseUrl = process.env.NODE_ENV === 'production' 
    ? 'https://talentlink-wd88.onrender.com'
    : process.env.BASE_URL || `http://localhost:${PORT}`;
    
  console.log(`Servidor rodando na porta ${PORT}\n`);
  console.log(`🔗 URL de autenticação RH: ${baseUrl}/auth/google/RH`)
  console.log(`🔗 URL de autenticação Candidato: ${baseUrl}/auth/google/CANDIDATO`);
  console.log(`📚 Documentação Swagger disponível em: ${baseUrl}/api-docs`);
});
