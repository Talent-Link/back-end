import express from "express";
import session from "express-session";
import passport from "./config/passport";
import dotenv from "dotenv";
import { requestLogger } from "./middlewares/requestLogger";
import { errorHandler } from "./middlewares/errorMiddleware";
import authRoutes from "./routes/authRoutes";
import formRouter from "./routes/formRoutes";
import responseFormRouter from "./routes/responseFormRouter"; // Importa as rotas de respostas
import talentRoutes from "./routes/talentRouter"; // Importa as rotas do Banco de Talentos
import reportRoutes from "./routes/reportRoutes"; // Importa as rotas de relatórios

dotenv.config();

const app = express();

// Log de todas as requisições
app.use(requestLogger);

// Parse de JSON no body
app.use(express.json());

// Configuração de sessão (usada só para o fluxo OAuth)
app.use(
  session({
    secret: process.env.SESSION_SECRET!,
    resave: false,
    saveUninitialized: true,
    cookie: {
      secure: false,   // true em produção com HTTPS
      httpOnly: true,  // impede acesso via JS no browser
    },
  })
);

// Inicializa o Passport (Google OAuth)
app.use(passport.initialize());
app.use(passport.session());

// Rotas de autenticação (login Google, callback, logout, /me)
app.use("/auth", authRoutes);

// Rotas de formulário (CRUD de Form), protegidas via JWT e onlyRH
app.use("/forms", formRouter);

// Rotas de respostas (candidato responde e RH visualiza)
app.use("/candidate", responseFormRouter); // Registra as rotas de respostas

app.use("/talents", talentRoutes); // Rotas do Banco de Talentos

app.use("/reports", reportRoutes); // Rotas de relatórios

// Middleware centralizado de tratamento de erros
app.use(errorHandler);

export default app;