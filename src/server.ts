import app from "./app";
import dotenv from "dotenv";

dotenv.config();

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
  console.log(`URL de autenticação RH:      http://localhost:${PORT}/auth/google/RH`);
  console.log(`URL de autenticação Candidato: http://localhost:${PORT}/auth/google/CANDIDATO`);
  console.log("EMAIL_USER:", process.env.EMAIL_USER);
console.log("EMAIL_PASS:", process.env.EMAIL_PASS?.slice(0,4) + "…");

});
