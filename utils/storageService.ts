import { StudentRecord, UserProfile } from '../types';

const STORAGE_KEY = 'radar_cognitivo_records';

export const saveStudentRecord = (profile: UserProfile): StudentRecord => {
  const record: StudentRecord = {
    id: `${Date.now()}_${profile.name.replace(/\s+/g, '_')}`,
    completedAt: new Date().toISOString(),
    profile,
  };

  const existing = getAllRecords();
  existing.push(record);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(existing));
  return record;
};

export const getAllRecords = (): StudentRecord[] => {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
};

export const getRecordsByTurma = (): Record<string, StudentRecord[]> => {
  const all = getAllRecords();
  return all.reduce<Record<string, StudentRecord[]>>((acc, record) => {
    const turma = record.profile.turma || 'Sem Turma';
    if (!acc[turma]) acc[turma] = [];
    acc[turma].push(record);
    return acc;
  }, {});
};

export const getUniqueTurmas = (): string[] => {
  const all = getAllRecords();
  const turmas = new Set(all.map(r => r.profile.turma || 'Sem Turma'));
  return Array.from(turmas).sort();
};

export const deleteRecord = (id: string): void => {
  const existing = getAllRecords().filter(r => r.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(existing));
};

export const clearAllRecords = (): void => {
  localStorage.removeItem(STORAGE_KEY);
};
