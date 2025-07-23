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
    { expiresIn: "7d" }
  );

  res.send(`
    <html>
      <body style="font-family: Arial, sans-serif; padding: 40px; background: #f5f5f5;">
        <div style="max-width: 600px; margin: 0 auto; background: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
          <h2 style="color: #4CAF50; text-align: center;">🎉 Login Realizado com Sucesso!</h2>
          <div style="background: #f8f9fa; padding: 20px; border-radius: 5px; margin: 20px 0;">
            <h3 style="margin-top: 0;">👤 Dados do Usuário:</h3>
            <p><strong>Nome:</strong> ${user.name}</p>
            <p><strong>Email:</strong> ${user.email}</p>
            <p><strong>Tipo:</strong> ${user.userType}</p>
          </div>
          <div style="background: #e3f2fd; padding: 20px; border-radius: 5px; margin: 20px 0;">
            <h3 style="margin-top: 0; color: #1976d2;">🔑 Seu Token JWT:</h3>
            <p style="word-break: break-all; font-family: monospace; background: white; padding: 15px; border-radius: 5px; border: 1px solid #ccc;">
              ${token}
            </p>
            <button onclick="copyToken()" style="background: #4CAF50; color: white; padding: 10px 20px; border: none; border-radius: 5px; cursor: pointer; margin-top: 10px;">
              📋 Copiar Token
            </button>
          </div>
          <div style="background: #fff3e0; padding: 20px; border-radius: 5px; margin: 20px 0;">
            <h4 style="margin-top: 0; color: #f57c00;">📝 Como usar:</h4>
            <p>Use este token no cabeçalho <code>Authorization: Bearer SEU_TOKEN</code> nas suas requisições.</p>
          </div>
        </div>
        <script>
          function copyToken() {
            const token = "${token}";
            navigator.clipboard.writeText(token).then(function() {
              alert('Token copiado para a área de transferência!');
            });
          }
        </script>
      </body>
    </html>
  `);
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
