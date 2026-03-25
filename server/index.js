import express from 'express';
import { GoogleGenAI } from '@google/genai';

const app = express();
app.use(express.json());

app.post('/api/analyze', async (req, res) => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'GEMINI_API_KEY não configurada no servidor' });
  }

  const { profile } = req.body;
  if (!profile) {
    return res.status(400).json({ error: 'Campo profile é obrigatório' });
  }

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
    const ai = new GoogleGenAI({ apiKey });
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-pro',
      contents: prompt,
      config: {
        thinkingConfig: { thinkingBudget: 32768 },
      },
    });
    res.json({ text: response.text || 'Não foi possível gerar a análise detalhada no momento.' });
  } catch (error) {
    console.error('Gemini error:', error);
    res.status(500).json({ error: 'Erro ao chamar a API Gemini.' });
  }
});

app.listen(4000, () => console.log('Backend rodando na porta 4000'));
