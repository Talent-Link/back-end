import app from "./app";

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
  console.log(`URL: http://localhost:${PORT}`);
  console.log(`URL de RH: http://localhost:${PORT}/auth/google/RH`);
    console.log(`URL de Candidato: http://localhost:${PORT}/auth/google/CANDIDATO`);
});