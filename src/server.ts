import app from "./app";
import dotenv from "dotenv";


dotenv.config();

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
  console.log(`URL de autenticação RH:      http://localhost:${PORT}/auth/google/RH`);
  console.log(`URL de autenticação Candidato: http://localhost:${PORT}/auth/google/CANDIDATO`);
  console.log(`Documentação da API: http://localhost:${PORT}/api-docs`);

});
