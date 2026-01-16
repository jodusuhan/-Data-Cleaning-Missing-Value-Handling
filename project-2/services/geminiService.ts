
import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const getInterviewGuidance = async (question: string): Promise<string> => {
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `As a senior data engineer, explain the following concept clearly for a data professional: ${question}`,
    config: {
      temperature: 0.7,
      maxOutputTokens: 500,
    }
  });
  return response.text || "No response generated.";
};

export const getCleaningAdvice = async (columnName: string, missingPercentage: number, type: string): Promise<string> => {
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Column "${columnName}" of type ${type} has ${missingPercentage}% missing values. What is the best imputation strategy?`,
    config: {
      temperature: 0.5,
    }
  });
  return response.text || "Consider basic imputation.";
};
