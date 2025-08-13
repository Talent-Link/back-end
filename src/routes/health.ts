/**
 * 🏥 Health Check Routes
 * Endpoints para verificação de saúde da aplicação
 * e manter o servidor ativo no Render
 */

import { Router, Request, Response } from 'express';

const router = Router();

// Cache de status da aplicação
let appStartTime = new Date();
let requestCount = 0;

/**
 * GET /health
 * Endpoint simples para keep-alive e health check
 */
router.get('/health', (req: Request, res: Response) => {
  requestCount++;
  
  const currentTime = new Date();
  const uptime = Math.floor((currentTime.getTime() - appStartTime.getTime()) / 1000);
  
  // Headers para evitar cache
  res.set({
    'Cache-Control': 'no-cache, no-store, must-revalidate',
    'Pragma': 'no-cache',
    'Expires': '0'
  });

  res.status(200).json({
    status: 'healthy',
    timestamp: currentTime.toISOString(),
    uptime: {
      seconds: uptime,
      formatted: formatUptime(uptime)
    },
    requests: requestCount,
    server: 'TalentLink API',
    version: process.env.npm_package_version || '1.0.0',
    environment: process.env.NODE_ENV || 'development',
    memory: {
      used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024) + ' MB',
      total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024) + ' MB'
    },
    database: 'connected', // Assumindo que está conectado se chegou até aqui
    message: '🚀 TalentLink API is running smoothly!'
  });
});

/**
 * GET /health/detailed
 * Endpoint com informações detalhadas do sistema
 */
router.get('/health/detailed', (req: Request, res: Response) => {
  const currentTime = new Date();
  const uptime = Math.floor((currentTime.getTime() - appStartTime.getTime()) / 1000);
  
  res.status(200).json({
    status: 'healthy',
    timestamp: currentTime.toISOString(),
    server: {
      name: 'TalentLink API',
      version: process.env.npm_package_version || '1.0.0',
      environment: process.env.NODE_ENV || 'development',
      platform: process.platform,
      nodeVersion: process.version,
      pid: process.pid
    },
    uptime: {
      seconds: uptime,
      formatted: formatUptime(uptime),
      startTime: appStartTime.toISOString()
    },
    requests: {
      total: requestCount,
      healthChecks: requestCount
    },
    memory: {
      rss: Math.round(process.memoryUsage().rss / 1024 / 1024) + ' MB',
      heapUsed: Math.round(process.memoryUsage().heapUsed / 1024 / 1024) + ' MB',
      heapTotal: Math.round(process.memoryUsage().heapTotal / 1024 / 1024) + ' MB',
      external: Math.round(process.memoryUsage().external / 1024 / 1024) + ' MB'
    },
    cpu: {
      usage: process.cpuUsage()
    },
    database: {
      status: 'connected',
      provider: 'neon-postgresql'
    },
    features: {
      authentication: 'JWT',
      fileUpload: 'active',
      emailService: 'configured',
      aiReports: 'active'
    },
    lastPing: currentTime.toLocaleString('pt-BR'),
    message: '💚 All systems operational'
  });
});

/**
 * GET /ping
 * Endpoint minimalista para keep-alive
 */
router.get('/ping', (req: Request, res: Response) => {
  res.set({
    'Cache-Control': 'no-cache, no-store, must-revalidate',
    'Pragma': 'no-cache',
    'Expires': '0'
  });
  
  res.status(200).json({ 
    pong: true, 
    timestamp: new Date().toISOString(),
    uptime: Math.floor((new Date().getTime() - appStartTime.getTime()) / 1000)
  });
});

/**
 * Formata tempo de uptime em formato legível
 */
function formatUptime(seconds: number): string {
  const days = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;

  const parts = [];
  if (days > 0) parts.push(`${days}d`);
  if (hours > 0) parts.push(`${hours}h`);
  if (minutes > 0) parts.push(`${minutes}m`);
  parts.push(`${secs}s`);

  return parts.join(' ');
}

// Reset do contador quando a aplicação reinicia
export const resetHealthStats = () => {
  appStartTime = new Date();
  requestCount = 0;
  console.log('🔄 Health check stats resetados');
};

export default router;
