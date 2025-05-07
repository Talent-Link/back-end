// src/utils/aiUtils.ts

export function extractJsonFromGeminiResponse(report: any): any {
    const raw = Object.values(report)[0] as string;
    const cleaned = raw
      .replace(/```json\s*/i, "")
      .replace(/```/g, "")
      .trim();
    return JSON.parse(cleaned);
  }