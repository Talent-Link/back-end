import express from "express";
import session from "express-session";
import passport from "./shared/config/passport";
import dotenv from "dotenv";
import cors from "cors";
import { requestLogger } from "./shared/middlewares/requestLogger";
import { errorHandler } from "./shared/middlewares/errorMiddleware";
import { setupSwagger } from "./shared/config/swagger";
import { authRoutes, emailAuthRouter } from "./domains/auth";
import { userRoutes, candidateProfileRoutes } from "./domains/user";
import { formRouter, responseFormRouter } from "./domains/form";
import { talentRoutes, bankTalentsRouter } from "./domains/talent";
import { reportRoutes, dashboardRoutes } from "./domains/report";
import { feedbackRouter } from "./domains/notification";
import { companyRouter } from "./domains/company";
import { opportunityRoutes } from "./domains/opportunity";

dotenv.config();

const app = express();

app.use(requestLogger);
app.use(express.json());

app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true,
  })
);

app.use(
  session({
    secret: process.env.SESSION_SECRET!,
    resave: false,
    saveUninitialized: true,
    cookie: {
      secure: false,
      httpOnly: true,
    },
  })
);

app.use(passport.initialize());
app.use(passport.session());

app.use("/auth", authRoutes);
app.use("/auth/email", emailAuthRouter);
app.use("/users", userRoutes);
app.use("/candidates", candidateProfileRoutes);
app.use("/forms", formRouter);
app.use("/candidate", responseFormRouter);
app.use("/talents", talentRoutes);
app.use("/reports", reportRoutes);
app.use("/dashboard", dashboardRoutes);
app.use("/notifications", feedbackRouter);
app.use("/empresa", companyRouter);
app.use("/opportunities", opportunityRoutes);
app.use("/bank-talents", bankTalentsRouter);

// Swagger Documentation
setupSwagger(app);

app.get("/", (req, res) => {
  res.send("🚀 TalentLink API rodando com sucesso! 📚 Documentação disponível em /api-docs");
});

app.use(errorHandler);

export default app;
