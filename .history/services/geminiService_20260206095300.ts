import { GoogleGenAI, Type } from "@google/genai";
import { AcademicData, PredictionResult, RiskLevel } from "../types";

// 🔐 Read API key (Vite browser-safe)
const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

// ⚠️ Do NOT hard-crash the app if key is missing
// Instead, allow fallback logic to handle it
const ai = GEMINI_API_KEY
  ? new GoogleGenAI({ apiKey: GEMINI_API_KEY })
  : null;

export async function predictAcademicRisk(
  data: AcademicData
): Promise<PredictionResult> {
  // 🔢 Deterministic Calculation
  const rawSum =
    Number(data.attendance) +
    Number(data.internalMarks) +
    Number(data.assignmentScore);

  const performanceScore = Math.round(rawSum / 3);

  // 🚦 Risk Classification
  let riskLevel = RiskLevel.MEDIUM;

  if (
    performanceScore < 50 ||
    data.attendance < 60 ||
    data.internalMarks < 40
  ) {
    riskLevel = RiskLevel.HIGH;
  } else if (
    performanceScore > 75 &&
    data.attendance > 80 &&
    data.internalMarks > 70
  ) {
    riskLevel = RiskLevel.LOW;
  }

  const riskScore = 100 - performanceScore;

  // 🛟 If API key missing, return safe fallback (NO CRASH)
  if (!ai) {
    return {
      id: "fallback-" + Date.now(),
      dataId: data.id,
      riskLevel,
      riskScore: Math.round(riskScore),
      performanceScore,
      summary: `Automated assessment: Performance Score ${performanceScore}%. Risk Level: ${riskLevel}.`,
      recommendations: [
        "Immediate academic counseling",
        "Weekly attendance monitoring",
        "Targeted subject improvement",
      ],
    };
  }

  const systemInstruction = `
You are a precision academic auditor.

Calculated Performance Score: ${performanceScore}/100
Attendance: ${data.attendance}%
Internal Marks: ${data.internalMarks}/100
Assignment Score: ${data.assignmentScore}/100

Formula:
(${data.attendance} + ${data.internalMarks} + ${data.assignmentScore}) / 3
= ${performanceScore}

Risk Level: ${riskLevel}

Return:
- Professional summary
- Exactly 3 actionable recommendations
`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: "Generate an academic audit report for this student.",
      config: {
        systemInstruction,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            summary: { type: Type.STRING },
            recommendations: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
          },
          required: ["summary", "recommendations"],
        },
      },
    });

    const result = JSON.parse(response.text || "{}");

    return {
      id: Math.random().toString(36).substring(2, 11),
      dataId: data.id,
      riskLevel,
      riskScore: Math.round(riskScore),
      performanceScore,
      summary:
        result.summary ||
        `Student performance score is ${performanceScore}%. Risk classified as ${riskLevel}.`,
      recommendations:
        result.recommendations || [
          "Schedule faculty counseling",
          "Improve attendance consistency",
          "Create subject-wise study plan",
        ],
    };
  } catch (error) {
    console.error("AI Prediction Error:", error);

    return {
      id: "fallback-" + Date.now(),
      dataId: data.id,
      riskLevel,
      riskScore: Math.round(riskScore),
      performanceScore,
      summary: `Automated assessment: Performance Score ${performanceScore}%. Risk Level: ${riskLevel}.`,
      recommendations: [
        "Immediate academic counseling",
        "Weekly attendance monitoring",
        "Targeted subject improvement",
      ],
    };
  }
}
