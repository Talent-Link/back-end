import { Request, Response, NextFunction } from "express";

export function isAuthenticated(req: Request, res: Response, next: NextFunction): void {
  console.log('🔐 Verificando autenticação...');
  console.log('🍪 Cookies recebidos:', req.headers.cookie);
  console.log('🎫 Session ID:', req.sessionID);
  console.log('📦 Session data:', req.session);
  console.log('👤 User na sessão:', req.user);
  console.log('✅ isAuthenticated():', req.isAuthenticated?.());
  
  if (!req.isAuthenticated || !req.isAuthenticated()) {
    console.log('❌ Usuário NÃO autenticado');
    res.status(401).send("Usuário não autenticado.");
    return;
  }
  
  console.log('✅ Usuário autenticado com sucesso!');
  next();
}