import express from "express";
import session from "express-session";
import passport from "./config/passport";
import authRoutes from "./routes/authRoutes";
import dotenv from "dotenv";

dotenv.config();

const app = express();

app.use(
  session({
    secret: process.env.SESSION_SECRET!,
    resave: false,
    saveUninitialized: true,
  })
);

app.use(passport.initialize());
app.use(passport.session());

// Rotas
app.use("/auth", authRoutes);

export default app;