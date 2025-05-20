import dotenv from "dotenv";
dotenv.config(); // Deve ser a PRIMEIRA linha de código

import app from "./app";
const PORT = process.env.PORT || 4000;

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
    console.log(`🔗 URL de autenticação RH: https://seu-servico-render.onrender.com/auth/google/RH`);
  console.log(`🔗 URL de autenticação Candidato: https://seu-servico-render.onrender.com/auth/google/CANDIDATO`);
});
