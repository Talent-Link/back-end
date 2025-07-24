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

  // 🔑 VERIFICAR POPUP pelo state (mais confiável que sessão)
  const state = (req.query.state as string) || '';
  const isPopup = state.includes('popup=true') || (req as any).session?.isPopup === true;
  
  // Limpa o estado da sessão após usar
  if ((req as any).session?.isPopup) {
    delete (req as any).session.isPopup;
    console.log('🎯 POPUP CONFIRMADO via sessão - Estado limpo');
  }
  
  console.log('🎯 Estado do popup - State:', state, 'Sessão:', (req as any).session?.isPopup, 'Final:', isPopup);
  
  if (isPopup) {
    console.log('✅ MODO POPUP: Enviando postMessage (detectado via state)');
    // ✅ POPUP: Envia postMessage e fecha, NÃO redireciona
    res.send(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Conta Selecionada</title>
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
            <p>Fechando popup...</p>
            <div class="spinner"></div>
          </div>
          
          <script>
            const token = '${token}';
            const user = ${JSON.stringify(userData)};
            
            // ENVIA dados para a janela pai
            if (window.opener && !window.opener.closed) {
              try {
                window.opener.postMessage({
                  type: 'GOOGLE_AUTH_SUCCESS',
                  token: token,
                  user: user
                }, '${process.env.FRONTEND_URL || 'http://localhost:3000'}');
                
                // Fecha o popup após enviar
                setTimeout(() => {
                  window.close();
                }, 1500);
              } catch (error) {
                console.error('Erro ao comunicar com janela pai:', error);
                // Se falhar, mostra erro
                document.body.innerHTML = '<div style="text-align: center; padding: 20px;"><h2 style="color: red;">Erro</h2><p>Feche esta janela e tente novamente.</p></div>';
              }
            } else {
              // Se não conseguir acessar a janela pai
              document.body.innerHTML = '<div style="text-align: center; padding: 20px;"><h2 style="color: red;">Erro</h2><p>Feche esta janela.</p></div>';
            }
          </script>
        </body>
      </html>
    `);
  } else {
    console.log('🔄 MODO NORMAL: Redirecionando');
    // ✅ NÃO É POPUP: Redireciona normalmente
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
