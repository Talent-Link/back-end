import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET!;

export function loginWithGoogle(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  const userType = req.params.userType?.toUpperCase();

  if (userType !== "RH" && userType !== "CANDIDATO") {
    res.status(400).send("Tipo de usuário inválido.");
    return;
  }

  req.session.userType = userType;
  req.session.save((err) => {
    if (err) {
      res.status(500).send("Erro ao salvar a sessão.");
      return;
    }
    next();
  });
}

export function handleGoogleCallback(req: Request, res: Response): void {
  const user = req.user as any;
  if (!user) {
    res.status(401).send("Usuário não autenticado.");
    return;
  }

  const token = jwt.sign(
    {
      sub: user.id,
      email: user.email,
      userType: user.userType,
    },
    JWT_SECRET,
    { expiresIn: "1d" }
  );

  const userData = {
    id: user.id,
    email: user.email,
    name: user.name,
    userType: user.userType
  };

  // Detecta se está sendo aberto em popup
  const isPopup = req.query.popup === 'true' || req.get('Referer')?.includes('popup');
  
  if (isPopup) {
    // Se é popup, envia dados via postMessage e fecha
    res.send(`
      <html>
        <head>
          <title>Autenticação Concluída</title>
        </head>
        <body style="font-family: Arial, sans-serif; display: flex; justify-content: center; align-items: center; height: 100vh; background: #f5f5f5;">
          <div style="text-align: center; background: white; padding: 40px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
            <h2 style="color: #4CAF50; margin-bottom: 20px;">✅ Login Realizado!</h2>
            <p style="color: #666;">Redirecionando...</p>
          </div>
          
          <script>
            // Envia dados para a janela pai
            if (window.opener) {
              window.opener.postMessage({
                token: '${token}',
                user: ${JSON.stringify(userData)}
              }, '${process.env.FRONTEND_URL || 'http://localhost:3000'}');
              window.close();
            } else {
              // Fallback: redireciona normalmente
              window.location.href = '${process.env.FRONTEND_URL || 'http://localhost:3000'}/auth/callback?token=${token}&user=${encodeURIComponent(JSON.stringify(userData))}';
            }
          </script>
        </body>
      </html>
    `);
  } else {
    // Se não é popup, redireciona normalmente para o AuthCallback
    const frontendUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/auth/callback?token=${token}&user=${encodeURIComponent(JSON.stringify(userData))}`;
    res.redirect(frontendUrl);
  }
}

const blacklistedTokens = new Set<string>();

export function isTokenBlacklisted(token: string): boolean {
  return blacklistedTokens.has(token);
}

export function logout(req: Request, res: Response): void {
  const auth = req.headers.authorization;
  if (auth?.startsWith("Bearer ")) {
    const token = auth.slice(7);
    blacklistedTokens.add(token);
  }

  req.logout((err) => {
    if (err) {
      res.status(500).send("Erro ao fazer logout.");
      return;
    }
    res.send("Logout bem‑sucedido! Token JWT invalidado.");
  });
}

export function getCurrentUser(req: Request, res: Response): void {
  const user = req.user as any;

  if (!user) {
    res.status(401).send("Usuário não autenticado.");
    return;
  }

  if (user.id && !user.email) {
    import('../../../shared/database/prisma').then(({ default: prisma }) => {
      prisma.user.findUnique({ 
        where: { id: user.id },
        select: {
          id: true,
          email: true,
          name: true,
          photoUrl: true,
          userType: true,
          createdAt: true,
          isEmailConfirmed: true,
          company: true,
          _count: {
            select: {
              responses: true,
              notifications: true,
              forms: true,
              favoriteCandidates: true,
              favoritedByRecruiters: true,
            }
          }
        }
      }).then(fullUser => {
        if (!fullUser) {
          res.status(404).send("Usuário não encontrado.");
          return;
        }
        res.json(fullUser);
      }).catch(() => {
        res.status(500).send("Erro interno do servidor.");
      });
    });
  } else {
    res.json(user);
  }
}
