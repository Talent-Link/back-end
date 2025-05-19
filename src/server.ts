import app from "./app";
import dotenv from "dotenv";

dotenv.config();

const PORT = Number(process.env.PORT) || 4000;

app.listen(PORT, "0.0.0.0", () => {
  console.log(`✅ Servidor rodando na porta ${PORT}`);
  console.log(`🔗 URL de autenticação RH: https://seu-servico-render.onrender.com/auth/google/RH`);
  console.log(`🔗 URL de autenticação Candidato: https://seu-servico-render.onrender.com/auth/google/CANDIDATO`);
  console.log(`📄 Documentação da API: https://seu-servico-render.onrender.com/api-docs`);
});
