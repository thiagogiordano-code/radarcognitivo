export enum AppStep {
  ONBOARDING = 'ONBOARDING',
  QUESTIONNAIRE_VARK = 'QUESTIONNAIRE_VARK',
  QUESTIONNAIRE_KOLB = 'QUESTIONNAIRE_KOLB',
  ANALYZING = 'ANALYZING',
  RESULTS = 'RESULTS',
  FEEDBACK = 'FEEDBACK',
  FINISHED = 'FINISHED'
}

export enum Course {
  ARQUIVOLOGIA = 'Arquivologia',
  BIBLIOTECONOMIA = 'Biblioteconomia',
  MUSEOLOGIA = 'Museologia',
  MESTRADO_PPGB = 'PPGB – Mestrado',
  DOUTORADO_PPGB = 'PPGB – Doutorado',
  OUTROS = 'Outros'
}

export enum VarkType {
  VISUAL = 'Visual',
  AURAL = 'Auditivo',
  READ_WRITE = 'Leitura/Escrita',
  KINESTHETIC = 'Cinestésico'
}

export enum KolbType {
  ATIVO = 'Ativo',
  REFLEXIVO = 'Reflexivo',
  TEORICO = 'Teórico',
  PRAGMATICO = 'Pragmático'
}

export interface Question {
  id: number;
  text: string;
  options: {
    label: string;
    value: VarkType | KolbType;
  }[];
}

export interface UserProfile {
  name: string;
  course: Course | string; // string for manual entry
  turma: string; // class/cohort identifier
  varkScores: Record<VarkType, number>;
  kolbScores: Record<KolbType, number>;
  dominantVark: VarkType[];
  dominantKolb: KolbType[];
  aiAnalysis?: string;
}

export interface StudentRecord {
  id: string; // unique identifier (timestamp + name)
  completedAt: string; // ISO date string
  profile: UserProfile;
}

export interface FeedbackData {
  text: string;
  timestamp: string;
}