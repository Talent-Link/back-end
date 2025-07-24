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
    { expiresIn: "2d" }
  );

  const userData = {
    id: user.id,
    email: user.email,
    name: user.name,
    userType: user.userType
  };

  // Detecta se veio de popup (via parâmetro ou referer)
  const isPopup = req.query.popup === 'true';
  
  if (isPopup) {
    // Se é popup, envia dados para a janela pai e fecha
    res.send(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Autenticação Concluída</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              display: flex;
              justify-content: center;
              align-items: center;
              height: 100vh;
              margin: 0;
              background: #f5f5f5;
            }
            .container {
              text-align: center;
              background: white;
              padding: 30px;
              border-radius: 10px;
              box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            }
            .success {
              color: #4CAF50;
              font-size: 20px;
              margin-bottom: 15px;
            }
            .spinner {
              border: 3px solid #f3f3f3;
              border-top: 3px solid #4CAF50;
              border-radius: 50%;
              width: 20px;
              height: 20px;
              animation: spin 1s linear infinite;
              margin: 15px auto;
            }
            @keyframes spin {
              0% { transform: rotate(0deg); }
              100% { transform: rotate(360deg); }
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="success">✅ Conta selecionada!</div>
            <p>Redirecionando...</p>
            <div class="spinner"></div>
          </div>
          
          <script>
            const token = '${token}';
            const user = ${JSON.stringify(userData)};
            
            // Envia dados para a janela pai e fecha o popup
            if (window.opener && !window.opener.closed) {
              try {
                window.opener.postMessage({
                  type: 'GOOGLE_AUTH_SUCCESS',
                  token: token,
                  user: user
                }, 'http://localhost:3000');
                
                // Aguarda um pouco e fecha o popup
                setTimeout(() => {
                  window.close();
                }, 1000);
              } catch (error) {
                console.error('Erro ao comunicar com janela pai:', error);
                // Se falhar, redireciona no próprio popup
                window.location.href = 'http://localhost:3000/auth/callback?token=' + 
                  encodeURIComponent(token) + '&user=' + encodeURIComponent(JSON.stringify(user));
              }
            } else {
              // Fallback se não conseguir comunicar com o pai
              window.location.href = 'http://localhost:3000/auth/callback?token=' + 
                encodeURIComponent(token) + '&user=' + encodeURIComponent(JSON.stringify(user));
            }
          </script>
        </body>
      </html>
    `);
  } else {
    // Se não é popup, redireciona normalmente
    const frontendUrl = `http://localhost:3000/auth/callback?token=${token}&user=${encodeURIComponent(JSON.stringify(userData))}`;
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
