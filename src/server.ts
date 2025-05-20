import dotenv from "dotenv";
dotenv.config();

import app from "./app";
const PORT = process.env.PORT || 4000;

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
  console.log(`🔗 URL de autenticação RH: https://talentlink-wd88.onrender.com/auth/google/RH`)
  console.log(`🔗 URL de autenticação Candidato: https://talentlink-wd88.onrender.com/auth/google/CANDIDATO`);
});
