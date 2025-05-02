import { Request, Response } from "express";
import { generateCandidateReportService } from "../services/reportService";

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