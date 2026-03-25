import { GoogleGenAI } from "@google/genai";
import { UserProfile } from "../types";

declare global {
  interface Window {
    __APP_CONFIG__?: { GEMINI_API_KEY?: string };
  }
}

const createClient = () => {
  const apiKey = window.__APP_CONFIG__?.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY não configurada em /config.js");
  }
  return new GoogleGenAI({ apiKey });
};


export const generateProfileAnalysis = async (profile: UserProfile): Promise<string> => {
  const ai = createClient();

  // Construct a detailed prompt for the Thinking model
  const prompt = `
    Atue como o Prof. Thiago Giordano Siqueira, especialista em Andragogia e Design Instrucional.
    Analise o perfil de um aluno adulto do curso de ${profile.course}.
    
    Perfil Identificado:
    - Como absorve (VARK): ${profile.dominantVark.join(', ')}
    - Como processa (Kolb): ${profile.dominantKolb.join(', ')}
    
    Escreva uma análise concisa (aprox. 150 palavras) e estratégica:
    1. Valide a identidade de aprendizado do aluno.
    2. Sinergia dos perfis: Explique especificamente como o modo de absorção (VARK) alimenta o modo de processamento (Kolb). Como esses dois se complementam de forma única?
    3. Aplicação Prática: Dê um exemplo concreto de estudo no contexto de ${profile.course} onde essa combinação específica gera uma vantagem competitiva ou facilita a compreensão de conceitos complexos.
    4. Encerre com um tom motivador e profissional, dirigindo-se ao aluno como "você".
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-pro", // Thinking model
      contents: prompt,
      config: {
        thinkingConfig: { thinkingBudget: 32768 }, // Max thinking for deep connection
      }
    });

    return response.text || "Não foi possível gerar a análise detalhada no momento.";
  } catch (error) {
    console.error("Error generating analysis:", error);
    return "Ocorreu um erro ao gerar sua análise personalizada. Por favor, utilize as estratégias gerais listadas abaixo.";
  }
};