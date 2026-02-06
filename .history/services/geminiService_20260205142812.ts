
import { GoogleGenAI, Type } from "@google/genai";
import { AcademicData, PredictionResult, RiskLevel } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export async function predictAcademicRisk(data: AcademicData): Promise<PredictionResult> {
  // Deterministic Calculation for 100% Accuracy
  // Performance Score = (Attendance + Internal Exam Score + Assignment Score) / 3
  const rawSum = Number(data.attendance) + Number(data.internalMarks) + Number(data.assignmentScore);
  const performanceScore = Math.round(rawSum / 3);

  // Exact Risk Classification Rules based on the 0-100 average
  // High Risk: Score < 50 OR attendance < 60 OR internal < 40
  // Low Risk: Score > 75 AND attendance > 80 AND internal > 70
  let riskLevel = RiskLevel.MEDIUM;
  if (performanceScore < 50 || data.attendance < 60 || data.internalMarks < 40) {
    riskLevel = RiskLevel.HIGH;
  } else if (performanceScore > 75 && data.attendance > 80 && data.internalMarks > 70) {
    riskLevel = RiskLevel.LOW;
  }

  // Risk Score for UI gauge (inverse of performance)
  const riskScore = 100 - performanceScore;

  const systemInstruction = `You are a precision academic auditor.
    The student's calculated Performance Score is ${performanceScore}/100 based on:
    - Attendance: ${data.attendance}%
    - Internal: ${data.internalMarks}/100
    - Assignment: ${data.assignmentScore}/100
    
    Formula used: (${data.attendance} + ${data.internalMarks} + ${data.assignmentScore}) / 3 = ${performanceScore}.
    
    The determined Risk Level is ${riskLevel}.
    
    You MUST return this exact Risk Level and Performance Score.
    The summary must be professional and data-driven.
    Recommendations must be 3 specific, actionable steps.`;

  const prompt = `Generate audit report for:
    - Performance Score: ${performanceScore}/100
    - Attendance: ${data.attendance}%
    - Internal Marks: ${data.internalMarks}
    - Assignment Score: ${data.assignmentScore}`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
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
      summary: result.summary || `Student average performance score is ${performanceScore}%. Classification: ${riskLevel}.`,
      recommendations: result.recommendations || ["Schedule faculty counseling", "Optimize study schedule", "Peer review sessions"],
    };
  } catch (error) {
    console.error("AI Prediction Error:", error);
    return {
      id: "fallback-" + Date.now(),
      dataId: data.id,
      riskLevel,
      riskScore: Math.round(riskScore),
      performanceScore,
      summary: `Automated diagnostic for average performance score ${performanceScore}%. Classified as ${riskLevel} risk.`,
      recommendations: ["Immediate academic counseling", "Attendance monitoring", "Subject-specific support"],
    };
  }
}
