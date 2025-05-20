import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { PrismaClient } from "@prisma/client";
import { Request } from "express";

const prisma = new PrismaClient();

function createGoogleStrategy(userType: "RH" | "CANDIDATO") {
  return new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      callbackURL: `https://talentlink-wd88.onrender.com/auth/google/${userType}/callback`,
      passReqToCallback: true,
    },
    async (req: Request, accessToken, refreshToken, profile, done) => {
      try {
        const email = profile.emails?.[0].value;
        if (!email) return done(new Error("Email não encontrado"), false);

        let user = await prisma.user.findUnique({ where: { email } });

        if (!user) {
          user = await prisma.user.create({
            data: {
              email,
              name: profile.displayName,
              photoUrl: profile.photos?.[0].value,
              userType,
            },
          });
        }

        return done(null, user);
      } catch (error) {
        console.error("Erro no login com Google:", error);
        return done(error, false);
      }
    }
  );
}

passport.use("google-RH", createGoogleStrategy("RH"));
passport.use("google-CANDIDATO", createGoogleStrategy("CANDIDATO"));

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
