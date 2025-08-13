import prisma from "../../../shared/database/prisma";
import ExcelJS from 'exceljs';
import PDFDocument from 'pdfkit';

// Interfaces para tipagem
interface DashboardAnalytics {
  totalCandidates: number;
  approvalRate: number;
  activeOpportunities: number;
  periodInfo: {
    startDate: string;
    endDate: string;
  };
}

interface CandidatesByMonth {
  month: string;
  candidates: number;
  qualified: number;
}

interface OpportunityPerformance {
  opportunityId: string;
  title: string;
  candidates: number;
  qualified: number;
  approvalRate: number;
}

interface CandidateStatusDistribution {
  status: string;
  count: number;
  percentage: number;
}

interface OpportunityDetails {
  title: string;
  candidates: number;
  qualified: number;
  rate: number;
}

// Dashboard Analytics - Métricas Gerais
export async function getDashboardAnalyticsService(
  startDate?: string,
  endDate?: string
): Promise<DashboardAnalytics> {
  console.log(`[getDashboardAnalyticsService] Start - Period: ${startDate} to ${endDate}`);

  try {
    // Define período padrão (últimos 30 dias)
    const end = endDate ? new Date(endDate) : new Date();
    const start = startDate ? new Date(startDate) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    
    console.log(`[getDashboardAnalyticsService] Final period: ${start.toISOString()} to ${end.toISOString()}`);

    // Total de candidatos únicos que se candidataram no período
    const responses = await prisma.response.findMany({
      where: {
        createdAt: {
          gte: start,
          lte: end,
        },
      },
      select: {
        candidateId: true,
      },
    });

    const uniqueCandidateIds = new Set(responses.map(r => r.candidateId));
    const totalCandidates = uniqueCandidateIds.size;

    console.log(`[getDashboardAnalyticsService] Total candidates: ${totalCandidates}`);

    // Candidatos aprovados (com status "APROVADO" nas notificações)
    const approvedNotifications = await prisma.notification.findMany({
      where: {
        status: 'APROVADO',
        createdAt: {
          gte: start,
          lte: end,
        },
      },
      select: {
        userId: true,
      },
    });

    const uniqueApprovedIds = new Set(approvedNotifications.map(n => n.userId));
    const approvedCandidates = uniqueApprovedIds.size;

    console.log(`[getDashboardAnalyticsService] Approved candidates: ${approvedCandidates}`);

    // Taxa de aprovação
    const approvalRate = totalCandidates > 0 ? Math.round((approvedCandidates / totalCandidates) * 100) : 0;

    // Vagas ativas no período
    const activeOpportunities = await prisma.opportunity.count({
      where: {
        isActive: true,
        createdAt: {
          gte: start,
          lte: end,
        },
      },
    });

    console.log(`[getDashboardAnalyticsService] Active opportunities: ${activeOpportunities}`);

    const analytics: DashboardAnalytics = {
      totalCandidates,
      approvalRate,
      activeOpportunities,
      periodInfo: {
        startDate: start.toISOString(),
        endDate: end.toISOString(),
      },
    };

    console.log(`[getDashboardAnalyticsService] Success:`, analytics);
    return analytics;

  } catch (error) {
    console.error(`[getDashboardAnalyticsService] Error:`, error);
    throw new Error("Erro ao buscar analytics do dashboard");
  }
}

// Candidatos por Mês
export async function getCandidatesByMonthService(year: number): Promise<CandidatesByMonth[]> {
  console.log(`[getCandidatesByMonthService] Start - Year: ${year}`);

  try {
    const months = [
      'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
      'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
    ];

    const results: CandidatesByMonth[] = [];

    for (let month = 0; month < 12; month++) {
      const startOfMonth = new Date(year, month, 1);
      const endOfMonth = new Date(year, month + 1, 0, 23, 59, 59);

      // Total de candidatos no mês
      const responses = await prisma.response.findMany({
        where: {
          createdAt: {
            gte: startOfMonth,
            lte: endOfMonth,
          },
        },
        select: {
          candidateId: true,
        },
      });

      const uniqueCandidateIds = new Set(responses.map(r => r.candidateId));
      const candidates = uniqueCandidateIds.size;

      // Candidatos qualificados (com notificação de aprovação)
      const qualifiedNotifications = await prisma.notification.findMany({
        where: {
          status: 'APROVADO',
          createdAt: {
            gte: startOfMonth,
            lte: endOfMonth,
          },
        },
        select: {
          userId: true,
        },
      });

      const uniqueQualifiedIds = new Set(qualifiedNotifications.map(n => n.userId));
      const qualified = uniqueQualifiedIds.size;

      results.push({
        month: months[month],
        candidates,
        qualified,
      });
    }

    console.log(`[getCandidatesByMonthService] Success:`, results.length, 'months processed');
    return results;

  } catch (error) {
    console.error(`[getCandidatesByMonthService] Error:`, error);
    throw new Error("Erro ao buscar candidatos por mês");
  }
}

// Desempenho por Vaga
export async function getOpportunityPerformanceService(
  startDate?: string,
  endDate?: string
): Promise<OpportunityPerformance[]> {
  console.log(`[getOpportunityPerformanceService] Start - Period: ${startDate} to ${endDate}`);

  try {
    const end = endDate ? new Date(endDate) : new Date();
    const start = startDate ? new Date(startDate) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

    const opportunities = await prisma.opportunity.findMany({
      where: {
        createdAt: {
          gte: start,
          lte: end,
        },
      },
      include: {
        responses: {
          where: {
            createdAt: {
              gte: start,
              lte: end,
            },
          },
        },
        _count: {
          select: {
            responses: true,
          },
        },
      },
    });

    const results: OpportunityPerformance[] = [];

    for (const opportunity of opportunities) {
      const candidates = opportunity.responses.length;

      // Buscar candidatos aprovados para esta oportunidade
      const qualified = await prisma.notification.count({
        where: {
          status: 'APROVADO',
          createdAt: {
            gte: start,
            lte: end,
          },
          response: {
            opportunityId: opportunity.id,
          },
        },
      });

      const approvalRate = candidates > 0 ? Math.round((qualified / candidates) * 100) : 0;

      results.push({
        opportunityId: opportunity.id,
        title: opportunity.title,
        candidates,
        qualified,
        approvalRate,
      });
    }

    // Ordenar por número de candidatos (descendente)
    results.sort((a, b) => b.candidates - a.candidates);

    console.log(`[getOpportunityPerformanceService] Success:`, results.length, 'opportunities processed');
    return results;

  } catch (error) {
    console.error(`[getOpportunityPerformanceService] Error:`, error);
    throw new Error("Erro ao buscar desempenho por vaga");
  }
}

// Status dos Candidatos
export async function getCandidateStatusDistributionService(
  startDate?: string,
  endDate?: string
): Promise<CandidateStatusDistribution[]> {
  console.log(`[getCandidateStatusDistributionService] Start - Period: ${startDate} to ${endDate}`);

  try {
    const end = endDate ? new Date(endDate) : new Date();
    const start = startDate ? new Date(startDate) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

    // Buscar todas as notificações com status no período
    const statusCounts = await prisma.notification.groupBy({
      by: ['status'],
      where: {
        status: {
          not: null,
        },
        createdAt: {
          gte: start,
          lte: end,
        },
      },
      _count: {
        id: true,
      },
    });

    const totalCount = statusCounts.reduce((sum, item) => sum + item._count.id, 0);

    const results: CandidateStatusDistribution[] = statusCounts.map(item => ({
      status: item.status || 'SEM_STATUS',
      count: item._count.id,
      percentage: totalCount > 0 ? Math.round((item._count.id / totalCount) * 100) : 0,
    }));

    // Adicionar candidatos sem status (que só têm response, mas não notification)
    const candidatesWithoutStatus = await prisma.response.count({
      where: {
        createdAt: {
          gte: start,
          lte: end,
        },
        notifications: {
          none: {},
        },
      },
    });

    if (candidatesWithoutStatus > 0) {
      const totalWithUnprocessed = totalCount + candidatesWithoutStatus;
      
      // Recalcular percentuais
      results.forEach(item => {
        item.percentage = Math.round((item.count / totalWithUnprocessed) * 100);
      });

      results.push({
        status: 'PENDENTE',
        count: candidatesWithoutStatus,
        percentage: Math.round((candidatesWithoutStatus / totalWithUnprocessed) * 100),
      });
    }

    // Ordenar por contagem (descendente)
    results.sort((a, b) => b.count - a.count);

    console.log(`[getCandidateStatusDistributionService] Success:`, results.length, 'status types found');
    return results;

  } catch (error) {
    console.error(`[getCandidateStatusDistributionService] Error:`, error);
    throw new Error("Erro ao buscar distribuição de status");
  }
}

// Detalhamento por Vaga (Tabela)
export async function getOpportunityDetailsService(
  startDate?: string,
  endDate?: string
): Promise<OpportunityDetails[]> {
  console.log(`[getOpportunityDetailsService] Start - Period: ${startDate} to ${endDate}`);

  try {
    const end = endDate ? new Date(endDate) : new Date();
    const start = startDate ? new Date(startDate) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

    const opportunities = await prisma.opportunity.findMany({
      where: {
        createdAt: {
          gte: start,
          lte: end,
        },
      },
      include: {
        responses: {
          where: {
            createdAt: {
              gte: start,
              lte: end,
            },
          },
          include: {
            notifications: {
              where: {
                status: 'APROVADO',
              },
            },
          },
        },
      },
    });

    const results: OpportunityDetails[] = opportunities.map(opportunity => {
      const candidates = opportunity.responses.length;
      const qualified = opportunity.responses.filter(response => 
        response.notifications.some(notif => notif.status === 'APROVADO')
      ).length;
      
      const rate = candidates > 0 ? Math.round((qualified / candidates) * 100) : 0;

      return {
        title: opportunity.title,
        candidates,
        qualified,
        rate,
      };
    });

    // Ordenar por taxa de aprovação (descendente)
    results.sort((a, b) => b.rate - a.rate);

    console.log(`[getOpportunityDetailsService] Success:`, results.length, 'opportunities detailed');
    return results;

  } catch (error) {
    console.error(`[getOpportunityDetailsService] Error:`, error);
    throw new Error("Erro ao buscar detalhamento por vaga");
  }
}

// Exportar Relatório
export async function exportReportService(params: {
  format: 'pdf' | 'excel' | 'csv';
  reportType: 'dashboard' | 'opportunities' | 'candidates';
  startDate?: string;
  endDate?: string;
}): Promise<{ data?: string; buffer?: Buffer; contentType: string }> {
  console.log(`[exportReportService] Start - Format: ${params.format}, Type: ${params.reportType}`);

  try {
    let data: any;
    
    // Buscar dados baseado no tipo de relatório
    switch (params.reportType) {
      case 'dashboard':
        data = await getDashboardAnalyticsService(params.startDate, params.endDate);
        break;
      case 'opportunities':
        data = await getOpportunityDetailsService(params.startDate, params.endDate);
        break;
      case 'candidates':
        data = await getCandidatesByMonthService(new Date().getFullYear());
        break;
    }

    // Gerar arquivo baseado no formato
    switch (params.format) {
      case 'csv':
        return generateCSV(data, params.reportType);
      case 'excel':
        return await generateExcel(data, params.reportType);
      case 'pdf':
        return await generatePDF(data, params.reportType);
      default:
        throw new Error('Formato não suportado');
    }

  } catch (error) {
    console.error(`[exportReportService] Error:`, error);
    throw new Error("Erro ao exportar relatório");
  }
}

// Gerar CSV
function generateCSV(data: any, reportType: string): { data: string; contentType: string } {
  let csv = '';
  
  switch (reportType) {
    case 'dashboard':
      csv = 'Métrica,Valor\n';
      csv += `Total de Candidatos,${data.totalCandidates}\n`;
      csv += `Taxa de Aprovação,${data.approvalRate}%\n`;
      csv += `Vagas Ativas,${data.activeOpportunities}\n`;
      break;
      
    case 'opportunities':
      csv = 'Título da Vaga,Candidatos,Qualificados,Taxa (%)\n';
      data.forEach((item: OpportunityDetails) => {
        csv += `"${item.title}",${item.candidates},${item.qualified},${item.rate}%\n`;
      });
      break;
      
    case 'candidates':
      csv = 'Mês,Candidatos,Qualificados\n';
      data.forEach((item: CandidatesByMonth) => {
        csv += `${item.month},${item.candidates},${item.qualified}\n`;
      });
      break;
  }
  
  return {
    data: csv,
    contentType: 'text/csv; charset=utf-8'
  };
}

// Gerar Excel
async function generateExcel(data: any, reportType: string): Promise<{ buffer: Buffer; contentType: string }> {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('Relatório TalentLink');
  
  // Configurar cabeçalho
  worksheet.addRow(['TalentLink - Relatório Gerencial']);
  worksheet.addRow([`Gerado em: ${new Date().toLocaleString('pt-BR')}`]);
  worksheet.addRow([]); // Linha vazia
  
  switch (reportType) {
    case 'dashboard':
      worksheet.addRow(['Métrica', 'Valor']);
      worksheet.addRow(['Total de Candidatos', data.totalCandidates]);
      worksheet.addRow(['Taxa de Aprovação', `${data.approvalRate}%`]);
      worksheet.addRow(['Vagas Ativas', data.activeOpportunities]);
      break;
      
    case 'opportunities':
      worksheet.addRow(['Título da Vaga', 'Candidatos', 'Qualificados', 'Taxa (%)']);
      data.forEach((item: OpportunityDetails) => {
        worksheet.addRow([item.title, item.candidates, item.qualified, `${item.rate}%`]);
      });
      break;
      
    case 'candidates':
      worksheet.addRow(['Mês', 'Candidatos', 'Qualificados']);
      data.forEach((item: CandidatesByMonth) => {
        worksheet.addRow([item.month, item.candidates, item.qualified]);
      });
      break;
  }
  
  // Estilizar cabeçalhos
  const headerRow = worksheet.getRow(4);
  headerRow.font = { bold: true };
  headerRow.fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FFE0E0E0' }
  };
  
  // Auto-ajustar colunas
  worksheet.columns.forEach((column: any) => {
    column.width = 20;
  });
  
  const buffer = await workbook.xlsx.writeBuffer();
  
  return {
    buffer: Buffer.from(buffer),
    contentType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  };
}

// Gerar PDF
async function generatePDF(data: any, reportType: string): Promise<{ buffer: Buffer; contentType: string }> {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument();
      const chunks: Buffer[] = [];
      
      doc.on('data', (chunk: any) => chunks.push(chunk));
      doc.on('end', () => {
        const buffer = Buffer.concat(chunks);
        resolve({
          buffer,
          contentType: 'application/pdf'
        });
      });
      
      // Cabeçalho
      doc.fontSize(20).text('TalentLink - Relatório Gerencial', 50, 50);
      doc.fontSize(12).text(`Gerado em: ${new Date().toLocaleString('pt-BR')}`, 50, 80);
      
      let yPosition = 120;
      
      switch (reportType) {
        case 'dashboard':
          doc.fontSize(16).text('Métricas do Dashboard', 50, yPosition);
          yPosition += 30;
          
          doc.fontSize(12).text(`Total de Candidatos: ${data.totalCandidates}`, 50, yPosition);
          yPosition += 20;
          doc.text(`Taxa de Aprovação: ${data.approvalRate}%`, 50, yPosition);
          yPosition += 20;
          doc.text(`Vagas Ativas: ${data.activeOpportunities}`, 50, yPosition);
          break;
          
        case 'opportunities':
          doc.fontSize(16).text('Detalhamento por Vaga', 50, yPosition);
          yPosition += 30;
          
          data.forEach((item: OpportunityDetails) => {
            doc.fontSize(12).text(`${item.title}`, 50, yPosition);
            yPosition += 15;
            doc.text(`  Candidatos: ${item.candidates} | Qualificados: ${item.qualified} | Taxa: ${item.rate}%`, 70, yPosition);
            yPosition += 25;
          });
          break;
          
        case 'candidates':
          doc.fontSize(16).text('Candidatos por Mês', 50, yPosition);
          yPosition += 30;
          
          data.forEach((item: CandidatesByMonth) => {
            doc.fontSize(12).text(`${item.month}: ${item.candidates} candidatos (${item.qualified} qualificados)`, 50, yPosition);
            yPosition += 20;
          });
          break;
      }
      
      doc.end();
      
    } catch (error) {
      reject(error);
    }
  });
}
