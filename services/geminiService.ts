import { UserProfile } from "../types";

export const generateProfileAnalysis = async (profile: UserProfile): Promise<string> => {
  try {
    const response = await fetch('/api/analyze', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ profile }),
    });

    if (response.status === 429) {
      return 'O serviço de análise personalizada está temporariamente indisponível (cota atingida). Por favor, tente novamente em alguns instantes.';
    }

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const data = await response.json();
    return data.text || 'Não foi possível gerar a análise detalhada no momento.';
  } catch (error) {
    console.error('Error generating analysis:', error);
    return 'Ocorreu um erro ao gerar sua análise personalizada. Por favor, utilize as estratégias gerais listadas abaixo.';
  }
};
