import nodemailer from 'nodemailer';

// Configuração do transportador de email
const createTransporter = () => {
  // Para Gmail/Outlook, use as credenciais reais
  // Para desenvolvimento, pode usar serviços como Ethereal Email ou MailHog
  return nodemailer.createTransport({
    service: 'gmail', // ou 'outlook', 'yahoo', etc.
    auth: {
      user: process.env.EMAIL_USER || 'seu-email@gmail.com',
      pass: process.env.EMAIL_PASS || 'sua-senha-de-app'
    }
  });
};

interface ApplicationConfirmationData {
  candidateName: string;
  candidateEmail: string;
  opportunityTitle: string;
  companyName: string;
  applicationDate: Date;
}

export class EmailService {
  private static transporter = createTransporter();

  /**
   * Envia email de confirmação de candidatura
   */
  static async sendApplicationConfirmation(data: ApplicationConfirmationData): Promise<void> {
    try {
      const { candidateName, candidateEmail, opportunityTitle, companyName, applicationDate } = data;
      
      const formattedDate = applicationDate.toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });

      const htmlContent = `
        <!DOCTYPE html>
        <html lang="pt-BR">
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Candidatura Confirmada - TalentLink</title>
          <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body { 
              font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
              line-height: 1.6; 
              color: #2c3e50;
              background-color: #f8fafc;
            }
            .email-container { 
              max-width: 600px; 
              margin: 0 auto; 
              background: #ffffff;
              border-radius: 12px;
              overflow: hidden;
              box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
            }
            .header { 
              background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%); 
              color: white; 
              padding: 40px 30px; 
              text-align: center;
              position: relative;
            }
            .header::before {
              content: '';
              position: absolute;
              top: 0;
              left: 0;
              right: 0;
              bottom: 0;
              background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><pattern id="grain" width="100" height="100" patternUnits="userSpaceOnUse"><circle cx="25" cy="25" r="1" fill="white" opacity="0.1"/><circle cx="75" cy="75" r="1" fill="white" opacity="0.1"/><circle cx="50" cy="10" r="0.5" fill="white" opacity="0.1"/><circle cx="10" cy="60" r="0.5" fill="white" opacity="0.1"/><circle cx="90" cy="40" r="0.5" fill="white" opacity="0.1"/></pattern></defs><rect width="100" height="100" fill="url(%23grain)"/></svg>') repeat;
            }
            .header h1 { 
              font-size: 28px; 
              margin-bottom: 10px; 
              font-weight: 700;
              position: relative;
              z-index: 1;
            }
            .header p { 
              font-size: 16px; 
              opacity: 0.95;
              position: relative;
              z-index: 1;
            }
            .success-icon {
              display: inline-block;
              width: 60px;
              height: 60px;
              background: rgba(255, 255, 255, 0.2);
              border-radius: 50%;
              margin-bottom: 20px;
              line-height: 60px;
              font-size: 24px;
              position: relative;
              z-index: 1;
            }
            .content { 
              padding: 40px 30px;
            }
            .greeting {
              font-size: 20px;
              color: #1f2937;
              margin-bottom: 20px;
              font-weight: 600;
            }
            .intro-text {
              font-size: 16px;
              color: #374151;
              margin-bottom: 30px;
              line-height: 1.7;
            }
            .highlight-box { 
              background: linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%);
              padding: 25px; 
              border-left: 4px solid #3b82f6; 
              margin: 25px 0;
              border-radius: 8px;
              position: relative;
            }
            .highlight-box::before {
              content: '📋';
              position: absolute;
              top: 15px;
              right: 20px;
              font-size: 20px;
            }
            .highlight-box h3 { 
              color: #1d4ed8; 
              margin-bottom: 15px; 
              font-size: 18px;
              font-weight: 600;
            }
            .detail-item {
              margin-bottom: 12px;
              display: flex;
              align-items: center;
            }
            .detail-label {
              font-weight: 600;
              color: #374151;
              min-width: 100px;
              margin-right: 10px;
            }
            .detail-value {
              color: #1f2937;
              flex: 1;
            }
            .steps-section {
              margin: 30px 0;
            }
            .steps-title {
              font-size: 18px;
              color: #1f2937;
              margin-bottom: 15px;
              font-weight: 600;
              display: flex;
              align-items: center;
            }
            .steps-title::before {
              content: '🚀';
              margin-right: 10px;
            }
            .steps-list {
              list-style: none;
              padding: 0;
            }
            .steps-list li {
              padding: 12px 0;
              padding-left: 30px;
              position: relative;
              color: #374151;
              line-height: 1.6;
            }
            .steps-list li::before {
              content: '✓';
              position: absolute;
              left: 0;
              top: 12px;
              color: #10b981;
              font-weight: bold;
              font-size: 16px;
            }
            .tips-section {
              background: #f9fafb;
              padding: 20px;
              border-radius: 8px;
              margin: 25px 0;
            }
            .tips-title {
              color: #374151;
              margin-bottom: 10px;
              font-weight: 600;
            }
            .tips-list {
              list-style: none;
              padding: 0;
            }
            .tips-list li {
              color: #6b7280;
              padding: 8px 0;
              padding-left: 25px;
              position: relative;
            }
            .tips-list li::before {
              content: '💡';
              position: absolute;
              left: 0;
              top: 8px;
            }
            .cta-button { 
              display: inline-block; 
              background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
              color: white; 
              padding: 16px 32px; 
              text-decoration: none; 
              border-radius: 8px; 
              margin: 25px 0;
              font-weight: 600;
              font-size: 16px;
              text-align: center;
              min-width: 200px;
              transition: transform 0.2s ease;
              box-shadow: 0 4px 6px rgba(59, 130, 246, 0.3);
            }
            .cta-button:hover {
              transform: translateY(-2px);
              box-shadow: 0 6px 12px rgba(59, 130, 246, 0.4);
            }
            .cta-container {
              text-align: center;
              margin: 30px 0;
            }
            .footer { 
              background: #f8fafc;
              text-align: center; 
              padding: 30px;
              color: #6b7280; 
              font-size: 14px;
              border-top: 1px solid #e5e7eb;
            }
            .footer-item {
              margin: 8px 0;
              display: flex;
              align-items: center;
              justify-content: center;
            }
            .footer-item::before {
              margin-right: 8px;
            }
            .social-links {
              margin-top: 20px;
            }
            .social-link {
              display: inline-block;
              width: 40px;
              height: 40px;
              background: #e5e7eb;
              border-radius: 50%;
              line-height: 40px;
              margin: 0 5px;
              color: #6b7280;
              text-decoration: none;
            }
            .brand-highlight {
              color: #3b82f6;
              font-weight: 600;
            }
            @media only screen and (max-width: 600px) {
              .email-container { margin: 10px; border-radius: 8px; }
              .header { padding: 30px 20px; }
              .content { padding: 30px 20px; }
              .header h1 { font-size: 24px; }
              .cta-button { display: block; width: 100%; }
            }
          </style>
        </head>
        <body>
          <div class="email-container">
            <div class="header">
              <div class="success-icon">✅</div>
              <h1>Candidatura Confirmada!</h1>
              <p><strong>TalentLink</strong> - Conectando Você ao Seu Futuro</p>
            </div>
            
            <div class="content">
              <div class="greeting">Olá, ${candidateName}! 👋</div>
              
              <div class="intro-text">
                <strong>Parabéns!</strong> Sua candidatura foi recebida e processada com sucesso. 
                Ficamos muito felizes em saber do seu interesse em fazer parte desta oportunidade incrível!
              </div>
              
              <div class="highlight-box">
                <h3>Detalhes da sua candidatura</h3>
                <div class="detail-item">
                  <span class="detail-label">🎯 Vaga:</span>
                  <span class="detail-value"><strong>${opportunityTitle}</strong></span>
                </div>
                <div class="detail-item">
                  <span class="detail-label">🏢 Empresa:</span>
                  <span class="detail-value"><strong>${companyName}</strong></span>
                </div>
                <div class="detail-item">
                  <span class="detail-label">📅 Data:</span>
                  <span class="detail-value">${formattedDate}</span>
                </div>
                <div class="detail-item">
                  <span class="detail-label">📧 Email:</span>
                  <span class="detail-value">${candidateEmail}</span>
                </div>
              </div>
              
              <div class="steps-section">
                <h3 class="steps-title">Próximos passos</h3>
                <ul class="steps-list">
                  <li><strong>Análise inicial:</strong> Nossa equipe de RH irá analisar cuidadosamente seu perfil e experiências</li>
                  <li><strong>Triagem técnica:</strong> Se seu perfil estiver alinhado com a vaga, entraremos em contato via email ou telefone</li>
                  <li><strong>Processo seletivo:</strong> Você será convidado(a) para as próximas etapas do processo</li>
                  <li><strong>Feedback contínuo:</strong> Manteremos você informado(a) sobre o status da sua candidatura</li>
                </ul>
              </div>
              
              <div class="tips-section">
                <h4 class="tips-title">💡 Dicas enquanto você aguarda:</h4>
                <ul class="tips-list">
                  <li>Mantenha seu perfil sempre atualizado com suas últimas experiências</li>
                  <li>Explore outras oportunidades que podem interessar você</li>
                  <li>Acompanhe o status das suas candidaturas através do nosso portal</li>
                  <li>Prepare-se para possíveis entrevistas revisando suas experiências</li>
                </ul>
              </div>
              
              <div class="cta-container">
                <a href="https://talentlink-wd88.onrender.com" class="cta-button">
                  🚀 Acessar Minha Conta
                </a>
              </div>
              
              <div class="intro-text" style="text-align: center; margin-top: 30px;">
                Obrigado por escolher a <span class="brand-highlight">TalentLink</span> para impulsionar sua carreira! 
                <br>Estamos ansiosos para conhecer melhor seu potencial. 💼✨
              </div>
            </div>
            
            <div class="footer">
              <div class="footer-item">📧 Este é um email automático. Para dúvidas, responda este email ou entre em contato conosco.</div>
              <div class="footer-item">💬 Suporte: contato@talentlink.com | 📞 (11) 99999-0000</div>
              <div class="footer-item">🔗 <strong class="brand-highlight">TalentLink</strong> - Conectando pessoas aos melhores talentos desde 2025</div>
              
              <div class="social-links">
                <a href="#" class="social-link">📘</a>
                <a href="#" class="social-link">📧</a>
                <a href="#" class="social-link">🌐</a>
                <a href="#" class="social-link">📱</a>
              </div>
              
              <div style="margin-top: 20px; padding-top: 20px; border-top: 1px solid #e5e7eb; font-size: 12px; color: #9ca3af;">
                © ${new Date().getFullYear()} TalentLink. Todos os direitos reservados.<br>
                Este email foi enviado para ${candidateEmail} em ${formattedDate}
              </div>
            </div>
          </div>
        </body>
        </html>
      `;

      const textContent = `
        ✅ CANDIDATURA CONFIRMADA!
        TalentLink - Conectando Você ao Seu Futuro
        
        ═══════════════════════════════════════
        
        Olá, ${candidateName}! 👋
        
        PARABÉNS! Sua candidatura foi recebida e processada com sucesso. 
        Ficamos muito felizes em saber do seu interesse em fazer parte desta oportunidade incrível!
        
        📋 DETALHES DA SUA CANDIDATURA
        ═══════════════════════════════════════
        🎯 Vaga: ${opportunityTitle}
        🏢 Empresa: ${companyName}  
        📅 Data: ${formattedDate}
        📧 Email: ${candidateEmail}
        
        🚀 PRÓXIMOS PASSOS
        ═══════════════════════════════════════
        ✓ Análise inicial: Nossa equipe de RH irá analisar cuidadosamente seu perfil e experiências
        ✓ Triagem técnica: Se seu perfil estiver alinhado com a vaga, entraremos em contato via email ou telefone  
        ✓ Processo seletivo: Você será convidado(a) para as próximas etapas do processo
        ✓ Feedback contínuo: Manteremos você informado(a) sobre o status da sua candidatura
        
        💡 DICAS ENQUANTO VOCÊ AGUARDA
        ═══════════════════════════════════════
        • Mantenha seu perfil sempre atualizado com suas últimas experiências
        • Explore outras oportunidades que podem interessar você  
        • Acompanhe o status das suas candidaturas através do nosso portal
        • Prepare-se para possíveis entrevistas revisando suas experiências
        
        🚀 ACESSE MEU PORTAL: https://talentlink-wd88.onrender.com
        
        Obrigado por escolher a TalentLink para impulsionar sua carreira! 
        Estamos ansiosos para conhecer melhor seu potencial. 💼✨
        
        ═══════════════════════════════════════
        CONTATO & SUPORTE
        ═══════════════════════════════════════
        📧 Este é um email automático. Para dúvidas, responda este email ou entre em contato conosco.
        💬 Suporte: contato@talentlink.com | 📞 (11) 99999-0000
        🔗 TalentLink - Conectando pessoas aos melhores talentos desde 2025
        
        © ${new Date().getFullYear()} TalentLink. Todos os direitos reservados.
        Este email foi enviado para ${candidateEmail} em ${formattedDate}
      `;

      const mailOptions = {
        from: `"TalentLink - Conectando Talentos 🚀" <${process.env.EMAIL_USER || 'noreply@talentlink.com'}>`,
        to: candidateEmail,
        subject: `🎉 Parabéns! Candidatura confirmada para ${opportunityTitle} - TalentLink`,
        text: textContent,
        html: htmlContent
      };

      const info = await this.transporter.sendMail(mailOptions);
      console.log(`[EmailService] Email de confirmação enviado para ${candidateEmail}:`, info.messageId);

    } catch (error) {
      console.error('[EmailService] Erro ao enviar email de confirmação:', error);
      // Não lança erro para não quebrar o fluxo da candidatura
      // O email é um "nice to have", não crítico
    }
  }

  /**
   * Testa a conexão do serviço de email
   */
  static async testConnection(): Promise<boolean> {
    try {
      await this.transporter.verify();
      console.log('[EmailService] Conexão com servidor de email verificada com sucesso');
      return true;
    } catch (error) {
      console.error('[EmailService] Erro na conexão com servidor de email:', error);
      return false;
    }
  }

  /**
   * Envia email de teste
   */
  static async sendTestEmail(to: string): Promise<void> {
    try {
      const mailOptions = {
        from: `"TalentLink Test" <${process.env.EMAIL_USER || 'noreply@talentlink.com'}>`,
        to,
        subject: '📧 Teste de Email - TalentLink',
        html: `
          <div style="font-family: Arial, sans-serif; padding: 20px;">
            <h2 style="color: #667eea;">🧪 Email de Teste</h2>
            <p>Se você recebeu este email, o serviço de notificações está funcionando corretamente!</p>
            <p><strong>Data/Hora:</strong> ${new Date().toLocaleString('pt-BR')}</p>
            <p>✅ Configuração de email validada com sucesso!</p>
          </div>
        `
      };

      await this.transporter.sendMail(mailOptions);
      console.log(`[EmailService] Email de teste enviado para ${to}`);
    } catch (error) {
      console.error('[EmailService] Erro ao enviar email de teste:', error);
      throw error;
    }
  }
}
