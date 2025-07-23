import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import prisma from "../database/prisma";
import { Request } from "express";

function createGoogleStrategy(userType: "RH" | "CANDIDATO") {
  // Detecta automaticamente a URL base conforme o ambiente
  const baseUrl = process.env.NODE_ENV === 'production' 
    ? 'https://talentlink-wd88.onrender.com'
    : process.env.BASE_URL || 'http://localhost:4000';
    
  return new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      callbackURL: `${baseUrl}/auth/google/${userType}/callback`,
      passReqToCallback: true,
    },
    async (req: Request, accessToken, refreshToken, profile, done) => {
      try {
        console.log('🔐 Iniciando autenticação Google para:', userType);
        console.log('📧 Email recebido:', profile.emails?.[0].value);
        
        const email = profile.emails?.[0].value;
        if (!email) return done(new Error("Email não encontrado"), false);

        let user = await prisma.user.findUnique({ where: { email } });

        if (!user) {
          console.log('👤 Criando novo usuário:', email);
          user = await prisma.user.create({
            data: {
              email,
              name: profile.displayName,
              photoUrl: profile.photos?.[0].value,
              userType,
            },
          });
        } else {
          console.log('✅ Usuário encontrado:', email);
        }

        console.log('🎉 Autenticação bem-sucedida para:', email);
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
