import express from "express";
import session from "express-session";
import passport from "./config/passport";
import dotenv from "dotenv";
import cors from "cors";
import { requestLogger } from "./middlewares/requestLogger";
import { errorHandler } from "./middlewares/errorMiddleware";
import authRoutes from "./routes/authRoutes";
import emailAuthRouter from "./routes/emailAuthRouter";
import formRouter from "./routes/formRoutes";
import responseFormRouter from "./routes/responseFormRouter";
import talentRoutes from "./routes/talentRouter";
import reportRoutes from "./routes/reportRoutes";
import feedbackRouter from "./routes/feedbackRouter";
import companyRouter from "./routes/companyRouter";
import opportunityRoutes from "./routes/oportunityRoutes";
import bankTalentsRouter from "./routes/bankTalentsRouter";

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
app.use("/forms", formRouter);
app.use("/candidate", responseFormRouter);
app.use("/talents", talentRoutes);
app.use("/reports", reportRoutes);
app.use("/notifications", feedbackRouter);
app.use("/empresa", companyRouter);
app.use("/opportunities", opportunityRoutes);
app.use("/bank-talents", bankTalentsRouter);

app.get("/", (req, res) => {
  res.send("🚀 TalentLink API rodando com sucesso!");
});

app.use(errorHandler);

app.use("/talent-bank", bankTalentsRouter);

export default app;
