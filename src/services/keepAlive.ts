/**
 * 🔄 Keep Alive Service
 * Mantém a API ativa no Render fazendo requisições periódicas
 * para evitar que o servidor entre em hibernação (sleep)
 */

import axios from 'axios';

class KeepAliveService {
  private intervalId: NodeJS.Timeout | null = null;
  private readonly PING_INTERVAL = 12 * 60 * 1000; // 12 minutos em millisegundos
  private readonly SERVER_URL = process.env.SERVER_URL || 'https://talentlink-wd88.onrender.com';
  private readonly HEALTH_ENDPOINT = '/health';
  
  /**
   * Inicia o serviço de keep-alive
   */
  start(): void {
    if (this.intervalId) {
      console.log('⚠️ Keep-alive já está ativo');
      return;
    }

    console.log(`🚀 Iniciando keep-alive service`);
    console.log(`📍 URL: ${this.SERVER_URL}${this.HEALTH_ENDPOINT}`);
    console.log(`⏰ Intervalo: ${this.PING_INTERVAL / 60000} minutos`);

    // Primeira requisição imediata
    this.ping();

    // Configurar intervalo
    this.intervalId = setInterval(() => {
      this.ping();
    }, this.PING_INTERVAL);

    console.log('✅ Keep-alive service iniciado com sucesso');
  }

  /**
   * Para o serviço de keep-alive
   */
  stop(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
      console.log('🛑 Keep-alive service parado');
    }
  }

  /**
   * Faz uma requisição para manter o servidor ativo
   */
  private async ping(): Promise<void> {
    try {
      const startTime = Date.now();
      
      const response = await axios.get(`${this.SERVER_URL}${this.HEALTH_ENDPOINT}`, {
        timeout: 30000, // 30 segundos de timeout
        headers: {
          'User-Agent': 'TalentLink-KeepAlive/1.0',
        }
      });

      const responseTime = Date.now() - startTime;
      
      console.log(`💚 Ping successful - ${new Date().toLocaleString('pt-BR')} (${responseTime}ms)`);
      console.log(`📊 Status: ${response.status} - ${response.statusText}`);
      
    } catch (error) {
      console.error(`❌ Keep-alive ping failed - ${new Date().toLocaleString('pt-BR')}`);
      
      if (axios.isAxiosError(error)) {
        if (error.response) {
          console.error(`📊 Status: ${error.response.status} - ${error.response.statusText}`);
        } else if (error.request) {
          console.error('🔌 Nenhuma resposta do servidor');
        } else {
          console.error('⚠️ Erro ao configurar requisição:', error.message);
        }
      } else {
        console.error('💥 Erro desconhecido:', error);
      }
    }
  }

  /**
   * Retorna o status do serviço
   */
  getStatus(): {
    active: boolean;
    serverUrl: string;
    pingInterval: number;
    nextPing?: string;
  } {
    return {
      active: this.intervalId !== null,
      serverUrl: `${this.SERVER_URL}${this.HEALTH_ENDPOINT}`,
      pingInterval: this.PING_INTERVAL,
      nextPing: this.intervalId ? 
        new Date(Date.now() + this.PING_INTERVAL).toLocaleString('pt-BR') : 
        undefined
    };
  }
}

// Instância singleton
export const keepAliveService = new KeepAliveService();

// Função utilitária para controle manual
export const startKeepAlive = () => keepAliveService.start();
export const stopKeepAlive = () => keepAliveService.stop();
export const getKeepAliveStatus = () => keepAliveService.getStatus();

export default keepAliveService;
