import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { PrismaClient } from "@prisma/client";
import { Request } from "express";

const prisma = new PrismaClient();

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      callbackURL: "/auth/google/callback",
      passReqToCallback: true, // permite acessar req na callback
    },
    async (req: Request, accessToken, refreshToken, profile, done) => {
      try {
        const userType = req.session.userType;
        console.log("Tipo de usuário no callback do Google:", userType);

        if (!userType) {
          return done(new Error("Tipo de usuário não especificado."), false);
        }

        // Verifica se o usuário já existe
        let user = await prisma.user.findUnique({
          where: { email: profile.emails?.[0].value },
        });

        // Cria se não existir
        if (!user) {
          user = await prisma.user.create({
            data: {
              email: profile.emails?.[0].value!,
              name: profile.displayName,
              photoUrl: profile.photos?.[0].value,
              userType: userType as "RH" | "CANDIDATO",
            },
          });
        }

        return done(null, user);
      } catch (error) {
        console.error("Erro no login com Google:", error);
        return done(error, false);
      }
    }
  )
);

passport.serializeUser((user: any, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id: string, done) => {
  try {
    const user = await prisma.user.findUnique({ where: { id } });
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});

export default passport;
