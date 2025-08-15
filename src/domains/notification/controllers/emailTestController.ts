import { Request, Response } from "express";
import { EmailService } from "../../../shared/services/emailService";

/**
 * Testa a conexão do serviço de email
 */
export async function testEmailConnection(req: Request, res: Response): Promise<void> {
  try {
    const isConnected = await EmailService.testConnection();
    
    if (isConnected) {
      res.status(200).json({
        message: "Serviço de email conectado com sucesso",
        status: "online",
        provider: "Nodemailer",
        tested_at: new Date().toISOString()
      });
    } else {
      res.status(503).json({
        message: "Falha na conexão com o serviço de email",
        status: "offline",
        details: "Verifique as configurações EMAIL_USER e EMAIL_PASS"
      });
    }
  } catch (error) {
    console.error("[testEmailConnection] Erro:", error);
    res.status(500).json({
      message: "Erro interno ao testar serviço de email",
      error: error instanceof Error ? error.message : "Erro desconhecido"
    });
  }
}

/**
 * Envia um email de teste
 */
export async function sendTestEmail(req: Request, res: Response): Promise<void> {
  try {
    const user = req.user as any;
    const { email } = req.body;
    
    if (!user || user.userType !== 'RH') {
      res.status(403).json({ 
        message: "Acesso negado. Apenas RH pode enviar emails de teste." 
      });
      return;
    }

    const testEmail = email || user.email;
    
    if (!testEmail) {
      res.status(400).json({
        message: "Email de destino é obrigatório",
        example: { email: "seu-email@exemplo.com" }
      });
      return;
    }

    await EmailService.sendTestEmail(testEmail);
    
    res.status(200).json({
      message: "Email de teste enviado com sucesso",
      sentTo: testEmail,
      sent_at: new Date().toISOString()
    });

  } catch (error) {
    console.error("[sendTestEmail] Erro:", error);
    res.status(500).json({
      message: "Erro ao enviar email de teste",
      error: error instanceof Error ? error.message : "Erro desconhecido"
    });
  }
}

/**
 * Simula o envio de um email de confirmação de candidatura
 */
export async function testApplicationEmail(req: Request, res: Response): Promise<void> {
  try {
    const user = req.user as any;
    const { email } = req.body;
    
    if (!user || user.userType !== 'RH') {
      res.status(403).json({ 
        message: "Acesso negado. Apenas RH pode testar emails de candidatura." 
      });
      return;
    }

    const testEmail = email || user.email;
    
    if (!testEmail) {
      res.status(400).json({
        message: "Email de destino é obrigatório",
        example: { email: "seu-email@exemplo.com" }
      });
      return;
    }

    // Dados fictícios para teste
    await EmailService.sendApplicationConfirmation({
      candidateName: "João Silva (Teste)",
      candidateEmail: testEmail,
      opportunityTitle: "Desenvolvedor Full Stack - TESTE",
      companyName: "TechCorp Ltda - TESTE",
      applicationDate: new Date()
    });
    
    res.status(200).json({
      message: "Email de teste de candidatura enviado com sucesso",
      template: "Confirmação de Candidatura",
      sentTo: testEmail,
      sent_at: new Date().toISOString()
    });

  } catch (error) {
    console.error("[testApplicationEmail] Erro:", error);
    res.status(500).json({
      message: "Erro ao enviar email de teste de candidatura",
      error: error instanceof Error ? error.message : "Erro desconhecido"
    });
  }
}
