import express from "express";
import session from "express-session";
import passport from "./config/passport";
import dotenv from "dotenv";
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

import swaggerUi from "swagger-ui-express";
import swaggerSpec from "./docs/swagger";
import YAML from "yamljs";
const swaggerDocument = YAML.load(__dirname + "/docs/swagger.yaml");
import RedisStore from "connect-redis";
import Redis from "ioredis";

dotenv.config();

const app = express();

const redisClient = new Redis(process.env.REDIS_URL);

app.use(requestLogger);
app.use(express.json());

app.use(
  session({
    store: new RedisStore({ client: redisClient }),
    secret: process.env.SESSION_SECRET!,
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === "production",
      httpOnly: true,
      maxAge: 1000 * 60 * 60, // 1 hora
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

app.use(errorHandler);

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.use("/docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));
app.use("/talent-bank", bankTalentsRouter);

export default app;
