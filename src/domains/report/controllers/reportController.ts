import { Request, Response } from "express";
import { generateCandidateReportService } from "../services/reportService";
import { 
  getDashboardAnalyticsService, 
  getCandidatesByMonthService,
  getOpportunityPerformanceService,
  getCandidateStatusDistributionService,
  getOpportunityDetailsService,
  exportReportService
} from "../services/dashboardService";

export async function generateCandidateReport(req: Request, res: Response): Promise<void> {
  try {
    const { candidateId, opportunityId } = req.params;

    if (!candidateId || !opportunityId) {
      res.status(400).send("Parâmetros inválidos. Certifique-se de fornecer candidateId e opportunityId.");
      return;
    }

    const report = await generateCandidateReportService(candidateId, opportunityId);

    res.status(200).json({
      message: "Relatório gerado com sucesso.",
      report,
    });
  } catch (error) {
    console.error("Erro ao gerar relatório:", error);
    res.status(500).send(
      error instanceof Error ? error.message : "Erro interno ao gerar relatório."
    );
  }
}

// Dashboard Analytics - Métricas Gerais
export async function getDashboardAnalytics(req: Request, res: Response): Promise<void> {
  try {
    const { startDate, endDate } = req.query;
    
    const analytics = await getDashboardAnalyticsService(
      startDate as string,
      endDate as string
    );

    res.status(200).json({
      message: "Analytics do dashboard recuperadas com sucesso.",
      data: analytics,
    });
  } catch (error) {
    console.error("Erro ao buscar analytics:", error);
    res.status(500).json({
      message: error instanceof Error ? error.message : "Erro interno ao buscar analytics."
    });
  }
}

// Candidatos por Mês
export async function getCandidatesByMonth(req: Request, res: Response): Promise<void> {
  try {
    const { year } = req.query;
    
    const data = await getCandidatesByMonthService(
      year ? parseInt(year as string) : new Date().getFullYear()
    );

    res.status(200).json({
      message: "Dados de candidatos por mês recuperados com sucesso.",
      data,
    });
  } catch (error) {
    console.error("Erro ao buscar candidatos por mês:", error);
    res.status(500).json({
      message: error instanceof Error ? error.message : "Erro interno."
    });
  }
}

// Desempenho por Vaga
export async function getOpportunityPerformance(req: Request, res: Response): Promise<void> {
  try {
    const { startDate, endDate } = req.query;
    
    const data = await getOpportunityPerformanceService(
      startDate as string,
      endDate as string
    );

    res.status(200).json({
      message: "Desempenho por vaga recuperado com sucesso.",
      data,
    });
  } catch (error) {
    console.error("Erro ao buscar desempenho por vaga:", error);
    res.status(500).json({
      message: error instanceof Error ? error.message : "Erro interno."
    });
  }
}

// Status dos Candidatos
export async function getCandidateStatusDistribution(req: Request, res: Response): Promise<void> {
  try {
    const { startDate, endDate } = req.query;
    
    const data = await getCandidateStatusDistributionService(
      startDate as string,
      endDate as string
    );

    res.status(200).json({
      message: "Distribuição de status dos candidatos recuperada com sucesso.",
      data,
    });
  } catch (error) {
    console.error("Erro ao buscar status dos candidatos:", error);
    res.status(500).json({
      message: error instanceof Error ? error.message : "Erro interno."
    });
  }
}

// Detalhamento por Vaga
export async function getOpportunityDetails(req: Request, res: Response): Promise<void> {
  try {
    const { startDate, endDate } = req.query;
    
    const data = await getOpportunityDetailsService(
      startDate as string,
      endDate as string
    );

    res.status(200).json({
      message: "Detalhamento por vaga recuperado com sucesso.",
      data,
    });
  } catch (error) {
    console.error("Erro ao buscar detalhamento por vaga:", error);
    res.status(500).json({
      message: error instanceof Error ? error.message : "Erro interno."
    });
  }
}

// Exportar Relatório
export async function exportReport(req: Request, res: Response): Promise<void> {
  try {
    const { format, startDate, endDate, reportType } = req.query;
    
    if (!format || !['pdf', 'excel', 'csv'].includes(format as string)) {
      res.status(400).json({ message: "Formato inválido. Use: pdf, excel ou csv" });
      return;
    }

    if (!reportType || !['dashboard', 'opportunities', 'candidates'].includes(reportType as string)) {
      res.status(400).json({ message: "Tipo de relatório inválido. Use: dashboard, opportunities ou candidates" });
      return;
    }

    const result = await exportReportService({
      format: format as 'pdf' | 'excel' | 'csv',
      reportType: reportType as 'dashboard' | 'opportunities' | 'candidates',
      startDate: startDate as string,
      endDate: endDate as string
    });

    // Set headers for file download
    const timestamp = new Date().toISOString().split('T')[0];
    const filename = `talentlink_${reportType}_${timestamp}.${format}`;
    
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.setHeader('Content-Type', result.contentType);
    
    if (format === 'pdf') {
      res.send(result.buffer);
    } else {
      res.send(result.data);
    }

  } catch (error) {
    console.error("Erro ao exportar relatório:", error);
    res.status(500).json({
      message: error instanceof Error ? error.message : "Erro interno ao exportar relatório."
    });
  }
}

