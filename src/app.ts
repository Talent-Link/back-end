import express from "express";
import session from "express-session";
import passport from "./config/passport"; // Importa o arquivo passport.ts
import { requestLogger } from "./middlewares/requestLogger";
import { errorHandler } from "./middlewares/errorMiddleware";
import authRoutes from "./routes/authRoutes";
import dotenv from "dotenv";

// Carregar variáveis de ambiente
dotenv.config();

const app = express();

// Middleware para log de requisições
app.use(requestLogger);

// Configuração de sessão
app.use(
  session({
    secret: process.env.SESSION_SECRET!,
    resave: false,
    saveUninitialized: true,
    cookie: {
      secure: false, // Use `true` em produção com HTTPS
      httpOnly: true, // Impede acesso ao cookie via JavaScript no navegador
    },
  })
);

// Inicialização do Passport
app.use(passport.initialize());
app.use(passport.session());

// Rotas de autenticação
app.use("/auth", authRoutes);

// Middleware de manipulação de erros
app.use(errorHandler);

export default app;