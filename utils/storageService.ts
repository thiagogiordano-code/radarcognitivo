import { StudentRecord, UserProfile } from '../types';

const API = '/api';

export interface TurmaConfig {
  id: string;
  name: string;
  course?: string;
  createdAt: string;
}

// ─── Student Records ─────────────────────────────────────────────────────────

export const saveStudentRecord = async (profile: UserProfile): Promise<StudentRecord> => {
  const record: StudentRecord = {
    id: `${Date.now()}_${profile.name.replace(/\s+/g, '_')}`,
    completedAt: new Date().toISOString(),
    profile,
  };
  await fetch(`${API}/records`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(record),
  });
  return record;
};

export const getAllRecords = async (): Promise<StudentRecord[]> => {
  try {
    const res = await fetch(`${API}/records`);
    if (!res.ok) return [];
    return res.json();
  } catch {
    return [];
  }
};

export const getRecordsByTurma = async (): Promise<Record<string, StudentRecord[]>> => {
  const all = await getAllRecords();
  return all.reduce<Record<string, StudentRecord[]>>((acc, r) => {
    const key = r.profile.turma || 'Sem Turma';
    (acc[key] = acc[key] || []).push(r);
    return acc;
  }, {});
};

export const getUniqueTurmas = async (): Promise<string[]> => {
  const all = await getAllRecords();
  return Array.from(new Set(all.map(r => r.profile.turma || 'Sem Turma'))).sort();
};

export const deleteRecord = async (id: string): Promise<void> => {
  await fetch(`${API}/records/${encodeURIComponent(id)}`, { method: 'DELETE' });
};

export const clearAllRecords = async (): Promise<void> => {
  await fetch(`${API}/records`, { method: 'DELETE' });
};

// ─── Turma Management ────────────────────────────────────────────────────────

export const getAllTurmaConfigs = async (): Promise<TurmaConfig[]> => {
  try {
    const res = await fetch(`${API}/turmas`);
    if (!res.ok) return [];
    return res.json();
  } catch {
    return [];
  }
};

export const saveTurmaConfig = async (name: string, course?: string): Promise<TurmaConfig> => {
  const turma: TurmaConfig = {
    id: `turma_${Date.now()}`,
    name: name.trim(),
    course,
    createdAt: new Date().toISOString(),
  };
  await fetch(`${API}/turmas`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(turma),
  });
  return turma;
};

export const deleteTurmaConfig = async (id: string): Promise<void> => {
  await fetch(`${API}/turmas/${encodeURIComponent(id)}`, { method: 'DELETE' });
};

export const clearAllTurmaConfigs = async (): Promise<void> => {
  await fetch(`${API}/turmas`, { method: 'DELETE' });
};

// ─── Import / Export ─────────────────────────────────────────────────────────

export const encodeStudentData = (profile: UserProfile): string =>
  btoa(unescape(encodeURIComponent(JSON.stringify(profile))));

export const importStudentData = async (code: string): Promise<StudentRecord | null> => {
  try {
    const profile: UserProfile = JSON.parse(decodeURIComponent(escape(atob(code.trim()))));
    if (!profile.name || !profile.turma) return null;
    const record: StudentRecord = {
      id: `import_${Date.now()}_${profile.name.replace(/\s+/g, '_')}`,
      completedAt: new Date().toISOString(),
      profile,
    };
    await fetch(`${API}/records`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(record),
    });
    return record;
  } catch {
    return null;
  }
};
