import { StudentRecord, UserProfile } from '../types';

const RECORDS_KEY = 'radar_cognitivo_records';
const TURMAS_KEY = 'rc_turmas';

export interface TurmaConfig {
  id: string;
  name: string;
  course?: string;
  createdAt: string;
}

// ─── Student Records ─────────────────────────────────────────────────────────

export const saveStudentRecord = (profile: UserProfile): StudentRecord => {
  const record: StudentRecord = {
    id: `${Date.now()}_${profile.name.replace(/\s+/g, '_')}`,
    completedAt: new Date().toISOString(),
    profile,
  };
  const existing = getAllRecords();
  existing.push(record);
  localStorage.setItem(RECORDS_KEY, JSON.stringify(existing));
  return record;
};

export const getAllRecords = (): StudentRecord[] => {
  try {
    const data = localStorage.getItem(RECORDS_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
};

export const getRecordsByTurma = (): Record<string, StudentRecord[]> =>
  getAllRecords().reduce<Record<string, StudentRecord[]>>((acc, r) => {
    const key = r.profile.turma || 'Sem Turma';
    (acc[key] = acc[key] || []).push(r);
    return acc;
  }, {});

export const getUniqueTurmas = (): string[] => {
  const all = getAllRecords();
  return Array.from(new Set(all.map(r => r.profile.turma || 'Sem Turma'))).sort();
};

export const deleteRecord = (id: string): void => {
  const updated = getAllRecords().filter(r => r.id !== id);
  localStorage.setItem(RECORDS_KEY, JSON.stringify(updated));
};

export const clearAllRecords = (): void => {
  localStorage.removeItem(RECORDS_KEY);
};

// ─── Turma Management ────────────────────────────────────────────────────────

export const getAllTurmaConfigs = (): TurmaConfig[] => {
  try {
    const data = localStorage.getItem(TURMAS_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
};

export const saveTurmaConfig = (name: string, course?: string): TurmaConfig => {
  const turma: TurmaConfig = {
    id: `turma_${Date.now()}`,
    name: name.trim(),
    course,
    createdAt: new Date().toISOString(),
  };
  const existing = getAllTurmaConfigs();
  if (!existing.find(t => t.name === turma.name)) {
    existing.push(turma);
    localStorage.setItem(TURMAS_KEY, JSON.stringify(existing));
  }
  return turma;
};

export const deleteTurmaConfig = (id: string): void => {
  const updated = getAllTurmaConfigs().filter(t => t.id !== id);
  localStorage.setItem(TURMAS_KEY, JSON.stringify(updated));
};

export const clearAllTurmaConfigs = (): void => {
  localStorage.removeItem(TURMAS_KEY);
};

// ─── Import / Export codes ────────────────────────────────────────────────────

export const encodeStudentData = (profile: UserProfile): string => {
  return btoa(unescape(encodeURIComponent(JSON.stringify(profile))));
};

export const importStudentData = (code: string): StudentRecord | null => {
  try {
    const profile: UserProfile = JSON.parse(decodeURIComponent(escape(atob(code.trim()))));
    if (!profile.name || !profile.turma) return null;
    const record: StudentRecord = {
      id: `import_${Date.now()}_${profile.name.replace(/\s+/g, '_')}`,
      completedAt: new Date().toISOString(),
      profile,
    };
    const existing = getAllRecords();
    existing.push(record);
    localStorage.setItem(RECORDS_KEY, JSON.stringify(existing));
    return record;
  } catch {
    return null;
  }
};
