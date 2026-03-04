import React, { useState, useCallback, useEffect } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, PieChart, Pie, Legend
} from 'recharts';
import {
  LayoutDashboard, Users, GraduationCap, LogOut, Plus, Copy, Trash2,
  FileDown, FileSpreadsheet, FileText, Search, Link2, Check, Upload,
  ChevronDown, ChevronUp, ArrowUpDown, AlertTriangle, Download
} from 'lucide-react';
import {
  getAllRecords, getAllTurmaConfigs, saveTurmaConfig,
  deleteTurmaConfig, deleteRecord, clearAllRecords, clearAllTurmaConfigs,
  importStudentData, StudentRecord, TurmaConfig
} from '../utils/storageService';
import { exportToXLS, exportToDOC, exportClassPDF } from '../utils/classReportGenerator';
import { adminLogout } from '../utils/auth';
import { VarkType, KolbType } from '../types';

type Tab = 'overview' | 'turmas' | 'students' | 'import';

const VARK_COLORS: Record<string, string> = {
  [VarkType.VISUAL]: '#3b82f6',
  [VarkType.AURAL]: '#10b981',
  [VarkType.READ_WRITE]: '#f59e0b',
  [VarkType.KINESTHETIC]: '#ef4444',
};
const KOLB_COLORS: Record<string, string> = {
  [KolbType.ATIVO]: '#8b5cf6',
  [KolbType.REFLEXIVO]: '#ec4899',
  [KolbType.TEORICO]: '#14b8a6',
  [KolbType.PRAGMATICO]: '#f97316',
};

const copyToClipboard = async (text: string, onCopied: () => void) => {
  try { await navigator.clipboard.writeText(text); onCopied(); } catch { /* fallback */ }
};

interface Props {
  onLogout: () => void;
}

const AdminDashboard: React.FC<Props> = ({ onLogout }) => {
  const [tab, setTab] = useState<Tab>('overview');
  const [records, setRecords] = useState<StudentRecord[]>([]);
  const [turmaConfigs, setTurmaConfigs] = useState<TurmaConfig[]>([]);
  const [newTurmaName, setNewTurmaName] = useState('');
  const [newTurmaCourse, setNewTurmaCourse] = useState('');
  const [importCode, setImportCode] = useState('');
  const [importStatus, setImportStatus] = useState<'idle' | 'ok' | 'error'>('idle');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterTurma, setFilterTurma] = useState('');
  const [sortField, setSortField] = useState<'name' | 'turma' | 'completedAt'>('completedAt');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');
  const [copiedLink, setCopiedLink] = useState<string | null>(null);
  const [exportingKey, setExportingKey] = useState<string | null>(null);
  const [confirmClearAll, setConfirmClearAll] = useState(false);
  const [exporting, setExporting] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    const [recs, turmas] = await Promise.all([getAllRecords(), getAllTurmaConfigs()]);
    setRecords(recs);
    setTurmaConfigs(turmas);
  }, []);

  useEffect(() => { refresh(); }, [refresh]);

  const handleLogout = () => { adminLogout(); onLogout(); };

  // ─── Stats ────────────────────────────────────────────────────────────────
  const recordsByTurma = records.reduce<Record<string, StudentRecord[]>>((acc, r) => {
    const key = r.profile.turma || 'Sem Turma';
    (acc[key] = acc[key] || []).push(r);
    return acc;
  }, {});
  const totalStudents = records.length;
  const totalTurmas = Object.keys(recordsByTurma).length;
  const uniqueCourses = new Set(records.map(r => r.profile.course)).size;

  const varkDistribution = Object.values(VarkType).map(type => ({
    name: type,
    count: records.filter(r => r.profile.dominantVark.includes(type)).length,
    color: VARK_COLORS[type],
  })).filter(d => d.count > 0);

  const kolbDistribution = Object.values(KolbType).map(type => ({
    name: type,
    count: records.filter(r => r.profile.dominantKolb.includes(type)).length,
    color: KOLB_COLORS[type],
  })).filter(d => d.count > 0);

  // ─── Turma link ────────────────────────────────────────────────────────────
  const getTurmaLink = (name: string) => {
    const base = window.location.href.split('?')[0];
    return `${base}?turma=${encodeURIComponent(name)}`;
  };

  const handleCopyLink = (name: string) => {
    copyToClipboard(getTurmaLink(name), () => {
      setCopiedLink(name);
      setTimeout(() => setCopiedLink(null), 2000);
    });
  };

  // ─── Turma creation ────────────────────────────────────────────────────────
  const handleAddTurma = async () => {
    if (!newTurmaName.trim()) return;
    await saveTurmaConfig(newTurmaName, newTurmaCourse || undefined);
    setNewTurmaName('');
    setNewTurmaCourse('');
    refresh();
  };

  const handleDeleteTurma = async (id: string) => {
    await deleteTurmaConfig(id);
    refresh();
  };

  // ─── Import ────────────────────────────────────────────────────────────────
  const handleImport = async () => {
    const record = await importStudentData(importCode);
    if (record) { setImportStatus('ok'); setImportCode(''); refresh(); setTimeout(() => setImportStatus('idle'), 3000); }
    else setImportStatus('error');
  };

  // ─── Student table ─────────────────────────────────────────────────────────
  const handleSort = (field: typeof sortField) => {
    if (sortField === field) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortField(field); setSortDir('asc'); }
  };

  const filteredRecords = records
    .filter(r =>
      (!searchTerm || r.profile.name.toLowerCase().includes(searchTerm.toLowerCase()) || r.profile.course.toLowerCase().includes(searchTerm.toLowerCase())) &&
      (!filterTurma || r.profile.turma === filterTurma)
    )
    .sort((a, b) => {
      const av = sortField === 'completedAt' ? a.completedAt : (sortField === 'name' ? a.profile.name : a.profile.turma);
      const bv = sortField === 'completedAt' ? b.completedAt : (sortField === 'name' ? b.profile.name : b.profile.turma);
      return sortDir === 'asc' ? av.localeCompare(bv) : bv.localeCompare(av);
    });

  // ─── Export helpers ────────────────────────────────────────────────────────
  const handleExport = async (fmt: 'pdf' | 'xls' | 'doc', turma: string, recs: StudentRecord[]) => {
    const key = `${fmt}-${turma}`;
    setExporting(key);
    try {
      if (fmt === 'pdf') exportClassPDF(recs, turma);
      else if (fmt === 'xls') exportToXLS(recs, turma);
      else await exportToDOC(recs, turma);
    } finally { setExporting(null); }
  };

  const handleClearAll = async () => {
    await Promise.all([clearAllRecords(), clearAllTurmaConfigs()]);
    refresh();
    setConfirmClearAll(false);
  };

  // ─── Shared UI bits ───────────────────────────────────────────────────────
  const ExportButtons = ({ turma, recs }: { turma: string; recs: StudentRecord[] }) => (
    <div className="flex gap-1.5">
      {(['pdf', 'xls', 'doc'] as const).map(fmt => (
        <button
          key={fmt}
          disabled={exporting === `${fmt}-${turma}`}
          onClick={() => handleExport(fmt, turma, recs)}
          title={`Exportar ${fmt.toUpperCase()}`}
          className={`flex items-center gap-1 text-xs font-semibold px-2.5 py-1.5 rounded-lg disabled:opacity-50 transition-colors ${
            fmt === 'pdf' ? 'bg-red-100 text-red-700 hover:bg-red-200' :
            fmt === 'xls' ? 'bg-green-100 text-green-700 hover:bg-green-200' :
                            'bg-blue-100 text-blue-700 hover:bg-blue-200'
          }`}
        >
          {fmt === 'pdf' ? <FileDown size={12} /> : fmt === 'xls' ? <FileSpreadsheet size={12} /> : <FileText size={12} />}
          {fmt.toUpperCase()}
        </button>
      ))}
    </div>
  );

  const StatCard = ({ label, value, color }: { label: string; value: number | string; color: string }) => (
    <div className={`bg-white rounded-xl border border-slate-200 p-5 shadow-sm`}>
      <p className="text-sm text-slate-500 font-medium">{label}</p>
      <p className={`text-3xl font-bold mt-1 ${color}`}>{value}</p>
    </div>
  );

  // ─── Tabs ─────────────────────────────────────────────────────────────────
  const tabs: { id: Tab; label: string; icon: React.ReactNode }[] = [
    { id: 'overview', label: 'Visão Geral', icon: <LayoutDashboard size={16} /> },
    { id: 'turmas', label: 'Turmas', icon: <GraduationCap size={16} /> },
    { id: 'students', label: `Alunos (${totalStudents})`, icon: <Users size={16} /> },
    { id: 'import', label: 'Importar', icon: <Upload size={16} /> },
  ];

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Top nav */}
      <header className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between shadow-lg">
        <div className="flex items-center gap-3">
          <div className="bg-blue-600 rounded-lg p-2">
            <GraduationCap size={20} />
          </div>
          <div>
            <span className="font-bold text-white">Radar Cognitivo</span>
            <span className="text-slate-400 text-sm ml-2">— Painel Administrativo</span>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-slate-400 text-sm hidden sm:block">thiago.giordano@gmail.com</span>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 text-sm text-slate-400 hover:text-white border border-slate-700 hover:border-slate-500 px-3 py-1.5 rounded-lg transition-colors"
          >
            <LogOut size={15} /> Sair
          </button>
        </div>
      </header>

      {/* Tab bar */}
      <div className="bg-white border-b border-slate-200 px-6">
        <nav className="flex gap-1 max-w-6xl mx-auto">
          {tabs.map(t => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`flex items-center gap-2 px-4 py-3.5 text-sm font-medium border-b-2 transition-colors ${
                tab === t.id
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-slate-500 hover:text-slate-800 hover:border-slate-300'
              }`}
            >
              {t.icon}
              <span className="hidden sm:inline">{t.label}</span>
            </button>
          ))}
        </nav>
      </div>

      <main className="max-w-6xl mx-auto px-6 py-8 space-y-8">

        {/* ═══ OVERVIEW TAB ═══════════════════════════════════════════════════ */}
        {tab === 'overview' && (
          <>
            {/* Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <StatCard label="Total de Alunos" value={totalStudents} color="text-blue-600" />
              <StatCard label="Turmas Ativas" value={totalTurmas} color="text-emerald-600" />
              <StatCard label="Cursos Diferentes" value={uniqueCourses} color="text-purple-600" />
              <StatCard label="Laudos Gerados" value={totalStudents} color="text-amber-600" />
            </div>

            {totalStudents === 0 ? (
              <div className="bg-white rounded-xl border border-dashed border-slate-300 p-12 text-center">
                <Users size={40} className="mx-auto text-slate-300 mb-3" />
                <p className="text-slate-500 font-medium">Nenhum dado registrado ainda.</p>
                <p className="text-slate-400 text-sm mt-1">Crie uma turma, compartilhe o link e aguarde os alunos responderem.</p>
                <button onClick={() => setTab('turmas')} className="mt-4 text-sm text-blue-600 hover:underline font-medium">
                  Criar minha primeira turma →
                </button>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 gap-6">
                {/* VARK Chart */}
                <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
                  <h3 className="font-bold text-slate-800 mb-1">Distribuição VARK — Global</h3>
                  <p className="text-slate-500 text-xs mb-4">Estilos de aprendizagem dominantes da turma</p>
                  <ResponsiveContainer width="100%" height={200}>
                    <BarChart data={varkDistribution} layout="vertical" margin={{ left: 10, right: 30 }}>
                      <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                      <XAxis type="number" allowDecimals={false} tick={{ fontSize: 11 }} />
                      <YAxis dataKey="name" type="category" width={110} tick={{ fontSize: 11 }} />
                      <Tooltip formatter={(v: number) => [`${v} aluno(s)`, 'Contagem']} />
                      <Bar dataKey="count" radius={[0, 4, 4, 0]}>
                        {varkDistribution.map((d, i) => <Cell key={i} fill={d.color} />)}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                  <div className="flex flex-wrap gap-2 mt-3">
                    {varkDistribution.map(d => (
                      <span key={d.name} className="text-xs px-2 py-0.5 rounded-full font-medium" style={{ background: d.color + '20', color: d.color }}>
                        {d.name}: {totalStudents > 0 ? Math.round(d.count / totalStudents * 100) : 0}%
                      </span>
                    ))}
                  </div>
                </div>

                {/* Kolb Chart */}
                <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
                  <h3 className="font-bold text-slate-800 mb-1">Distribuição Kolb — Global</h3>
                  <p className="text-slate-500 text-xs mb-4">Estilos de processamento dominantes da turma</p>
                  <ResponsiveContainer width="100%" height={200}>
                    <BarChart data={kolbDistribution} layout="vertical" margin={{ left: 10, right: 30 }}>
                      <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                      <XAxis type="number" allowDecimals={false} tick={{ fontSize: 11 }} />
                      <YAxis dataKey="name" type="category" width={90} tick={{ fontSize: 11 }} />
                      <Tooltip formatter={(v: number) => [`${v} aluno(s)`, 'Contagem']} />
                      <Bar dataKey="count" radius={[0, 4, 4, 0]}>
                        {kolbDistribution.map((d, i) => <Cell key={i} fill={d.color} />)}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                  <div className="flex flex-wrap gap-2 mt-3">
                    {kolbDistribution.map(d => (
                      <span key={d.name} className="text-xs px-2 py-0.5 rounded-full font-medium" style={{ background: d.color + '20', color: d.color }}>
                        {d.name}: {totalStudents > 0 ? Math.round(d.count / totalStudents * 100) : 0}%
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Per-turma quick view */}
            {totalStudents > 0 && (
              <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
                  <h3 className="font-bold text-slate-800">Resumo por Turma</h3>
                  <button onClick={() => setTab('turmas')} className="text-sm text-blue-600 hover:underline">Ver todas →</button>
                </div>
                <div className="divide-y divide-slate-100">
                  {Object.entries(recordsByTurma).map(([turma, recs]) => {
                    const vCounts: Record<string, number> = {};
                    const kCounts: Record<string, number> = {};
                    recs.forEach(r => {
                      r.profile.dominantVark.forEach(v => vCounts[v] = (vCounts[v] || 0) + 1);
                      r.profile.dominantKolb.forEach(k => kCounts[k] = (kCounts[k] || 0) + 1);
                    });
                    const topV = Object.entries(vCounts).sort((a, b) => b[1] - a[1])[0];
                    const topK = Object.entries(kCounts).sort((a, b) => b[1] - a[1])[0];
                    return (
                      <div key={turma} className="px-6 py-4 flex items-center justify-between flex-wrap gap-3">
                        <div className="flex items-center gap-3">
                          <span className="bg-blue-100 text-blue-700 font-bold text-sm rounded-lg w-8 h-8 flex items-center justify-center shrink-0">{recs.length}</span>
                          <div>
                            <p className="font-semibold text-slate-800">{turma}</p>
                            <p className="text-xs text-slate-400">{recs.length} aluno(s)</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3 flex-wrap">
                          {topV && <span className="text-xs px-2 py-1 rounded-full font-medium" style={{ background: VARK_COLORS[topV[0]] + '20', color: VARK_COLORS[topV[0]] }}>VARK: {topV[0]}</span>}
                          {topK && <span className="text-xs px-2 py-1 rounded-full font-medium" style={{ background: KOLB_COLORS[topK[0]] + '20', color: KOLB_COLORS[topK[0]] }}>Kolb: {topK[0]}</span>}
                          <ExportButtons turma={turma} recs={recs} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Danger zone */}
            <div className="border border-red-200 bg-red-50 rounded-xl p-5">
              <div className="flex items-start gap-3">
                <AlertTriangle size={18} className="text-red-500 shrink-0 mt-0.5" />
                <div className="flex-1">
                  <h4 className="font-semibold text-red-700 text-sm">Zona de Risco</h4>
                  <p className="text-red-600 text-xs mt-0.5">Remove permanentemente todos os registros e turmas do banco de dados local.</p>
                </div>
                {confirmClearAll ? (
                  <div className="flex gap-2">
                    <button onClick={() => setConfirmClearAll(false)} className="text-xs border border-slate-300 px-3 py-1.5 rounded-lg text-slate-600 bg-white">Cancelar</button>
                    <button onClick={handleClearAll} className="text-xs bg-red-600 text-white px-3 py-1.5 rounded-lg font-semibold">Confirmar exclusão</button>
                  </div>
                ) : (
                  <button onClick={() => setConfirmClearAll(true)} className="text-xs text-red-600 border border-red-300 hover:bg-red-100 px-3 py-1.5 rounded-lg transition-colors font-medium shrink-0">
                    Limpar tudo
                  </button>
                )}
              </div>
            </div>
          </>
        )}

        {/* ═══ TURMAS TAB ══════════════════════════════════════════════════════ */}
        {tab === 'turmas' && (
          <>
            {/* Create turma */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
              <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2"><Plus size={18} /> Criar Nova Turma</h3>
              <div className="flex flex-col sm:flex-row gap-3">
                <input
                  type="text"
                  placeholder="Nome da turma (ex: Biblioteconomia 2024.1)"
                  value={newTurmaName}
                  onChange={e => setNewTurmaName(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleAddTurma()}
                  className="flex-1 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                />
                <input
                  type="text"
                  placeholder="Curso associado (opcional)"
                  value={newTurmaCourse}
                  onChange={e => setNewTurmaCourse(e.target.value)}
                  className="flex-1 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                />
                <button
                  onClick={handleAddTurma}
                  disabled={!newTurmaName.trim()}
                  className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-semibold px-5 py-2.5 rounded-xl text-sm transition-colors"
                >
                  <Plus size={16} /> Criar
                </button>
              </div>
            </div>

            {/* Turma list */}
            {turmaConfigs.length === 0 && Object.keys(recordsByTurma).length === 0 ? (
              <div className="bg-white rounded-xl border border-dashed border-slate-300 p-12 text-center">
                <GraduationCap size={40} className="mx-auto text-slate-300 mb-3" />
                <p className="text-slate-500">Nenhuma turma criada ainda.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Managed turmas */}
                {turmaConfigs.map(tc => {
                  const recs = recordsByTurma[tc.name] || [];
                  return (
                    <TurmaCard
                      key={tc.id}
                      turma={tc.name}
                      subtitle={tc.course}
                      recs={recs}
                      link={getTurmaLink(tc.name)}
                      isCopied={copiedLink === tc.name}
                      onCopyLink={() => handleCopyLink(tc.name)}
                      onDeleteTurma={() => handleDeleteTurma(tc.id)}
                      ExportButtons={<ExportButtons turma={tc.name} recs={recs} />}
                    />
                  );
                })}
                {/* Unmanaged turmas (from student data) */}
                {Object.keys(recordsByTurma)
                  .filter(t => !turmaConfigs.find(tc => tc.name === t))
                  .map(t => (
                    <TurmaCard
                      key={t}
                      turma={t}
                      recs={recordsByTurma[t]}
                      link={getTurmaLink(t)}
                      isCopied={copiedLink === t}
                      onCopyLink={() => handleCopyLink(t)}
                      ExportButtons={<ExportButtons turma={t} recs={recordsByTurma[t]} />}
                    />
                  ))}
              </div>
            )}
          </>
        )}

        {/* ═══ STUDENTS TAB ════════════════════════════════════════════════════ */}
        {tab === 'students' && (
          <>
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Buscar por nome ou curso..."
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
              <select
                value={filterTurma}
                onChange={e => setFilterTurma(e.target.value)}
                className="border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none bg-white"
              >
                <option value="">Todas as turmas</option>
                {Object.keys(recordsByTurma).map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>

            {filteredRecords.length === 0 ? (
              <div className="bg-white rounded-xl border border-dashed border-slate-300 p-10 text-center">
                <Users size={32} className="mx-auto text-slate-300 mb-2" />
                <p className="text-slate-500 text-sm">Nenhum aluno encontrado.</p>
              </div>
            ) : (
              <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-200">
                        {[
                          { field: 'name' as const, label: 'Nome' },
                          { field: 'turma' as const, label: 'Turma' },
                        ].map(col => (
                          <th key={col.field} className="text-left px-4 py-3 font-semibold text-slate-600 cursor-pointer hover:text-slate-900" onClick={() => handleSort(col.field)}>
                            <span className="flex items-center gap-1">{col.label} <ArrowUpDown size={12} className={sortField === col.field ? 'text-blue-600' : 'text-slate-300'} /></span>
                          </th>
                        ))}
                        <th className="text-left px-4 py-3 font-semibold text-slate-600">Curso</th>
                        <th className="text-left px-4 py-3 font-semibold text-slate-600">VARK</th>
                        <th className="text-left px-4 py-3 font-semibold text-slate-600">Kolb</th>
                        <th className="text-left px-4 py-3 font-semibold text-slate-600 cursor-pointer hover:text-slate-900" onClick={() => handleSort('completedAt')}>
                          <span className="flex items-center gap-1">Data <ArrowUpDown size={12} className={sortField === 'completedAt' ? 'text-blue-600' : 'text-slate-300'} /></span>
                        </th>
                        <th className="px-4 py-3 w-8"></th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {filteredRecords.map(r => (
                        <tr key={r.id} className="hover:bg-slate-50 transition-colors">
                          <td className="px-4 py-3 font-medium text-slate-800">{r.profile.name}</td>
                          <td className="px-4 py-3">
                            <span className="bg-slate-100 text-slate-600 text-xs px-2 py-0.5 rounded-full">{r.profile.turma}</span>
                          </td>
                          <td className="px-4 py-3 text-slate-500 text-xs">{r.profile.course}</td>
                          <td className="px-4 py-3">
                            {r.profile.dominantVark.map(v => (
                              <span key={v} className="text-xs px-1.5 py-0.5 rounded font-medium mr-1" style={{ background: VARK_COLORS[v] + '20', color: VARK_COLORS[v] }}>{v}</span>
                            ))}
                          </td>
                          <td className="px-4 py-3">
                            {r.profile.dominantKolb.map(k => (
                              <span key={k} className="text-xs px-1.5 py-0.5 rounded font-medium mr-1" style={{ background: KOLB_COLORS[k] + '20', color: KOLB_COLORS[k] }}>{k}</span>
                            ))}
                          </td>
                          <td className="px-4 py-3 text-slate-400 text-xs whitespace-nowrap">
                            {new Date(r.completedAt).toLocaleDateString('pt-BR')}
                          </td>
                          <td className="px-4 py-3">
                            <button onClick={async () => { await deleteRecord(r.id); refresh(); }} className="text-slate-300 hover:text-red-500 transition-colors">
                              <Trash2 size={14} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="px-4 py-2 border-t border-slate-100 text-xs text-slate-400 bg-slate-50">
                  {filteredRecords.length} de {records.length} aluno(s)
                </div>
              </div>
            )}
          </>
        )}

        {/* ═══ IMPORT TAB ══════════════════════════════════════════════════════ */}
        {tab === 'import' && (
          <div className="space-y-6">
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-5">
              <h4 className="font-semibold text-blue-800 mb-2 flex items-center gap-2"><Upload size={16} /> Como funciona a importação?</h4>
              <ol className="text-blue-700 text-sm space-y-1 list-decimal list-inside">
                <li>O aluno preenche o questionário em seu próprio dispositivo</li>
                <li>Na tela de resultados, ele clica em <strong>"Gerar código para o professor"</strong></li>
                <li>O aluno compartilha esse código via WhatsApp, e-mail, etc.</li>
                <li>Você cola o código abaixo e importa os dados</li>
              </ol>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-4">
              <h3 className="font-bold text-slate-800">Importar Resultado de Aluno</h3>
              <textarea
                rows={5}
                placeholder="Cole aqui o código gerado pelo aluno..."
                value={importCode}
                onChange={e => { setImportCode(e.target.value); setImportStatus('idle'); }}
                className="w-full border border-slate-200 rounded-xl p-4 text-sm font-mono focus:ring-2 focus:ring-blue-500 outline-none resize-none text-slate-700"
              />
              {importStatus === 'ok' && (
                <div className="flex items-center gap-2 bg-green-50 border border-green-200 text-green-700 text-sm px-4 py-3 rounded-xl">
                  <Check size={16} /> Dados importados com sucesso!
                </div>
              )}
              {importStatus === 'error' && (
                <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-xl">
                  <AlertTriangle size={16} /> Código inválido. Verifique se foi copiado completamente.
                </div>
              )}
              <button
                onClick={handleImport}
                disabled={!importCode.trim()}
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-semibold px-5 py-2.5 rounded-xl text-sm transition-colors"
              >
                <Download size={16} /> Importar dados
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

// ─── TurmaCard sub-component ──────────────────────────────────────────────────

interface TurmaCardProps {
  turma: string;
  subtitle?: string;
  recs: StudentRecord[];
  link: string;
  isCopied: boolean;
  onCopyLink: () => void;
  onDeleteTurma?: () => void;
  ExportButtons: React.ReactNode;
}

const TurmaCard: React.FC<TurmaCardProps> = ({ turma, subtitle, recs, link, isCopied, onCopyLink, onDeleteTurma, ExportButtons }) => {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
      <div className="px-5 py-4 flex flex-wrap items-center gap-4 justify-between">
        <div className="flex items-center gap-3 min-w-0">
          <div className="bg-blue-600 text-white text-sm font-bold rounded-lg w-9 h-9 flex items-center justify-center shrink-0">{recs.length}</div>
          <div className="min-w-0">
            <p className="font-bold text-slate-800 truncate">{turma}</p>
            <p className="text-xs text-slate-400">{subtitle || `${recs.length} aluno(s)`}</p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {/* Copy link */}
          <button
            onClick={onCopyLink}
            className={`flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg transition-colors border ${
              isCopied
                ? 'bg-green-50 text-green-700 border-green-200'
                : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-blue-50 hover:text-blue-700 hover:border-blue-200'
            }`}
          >
            {isCopied ? <Check size={12} /> : <Link2 size={12} />}
            {isCopied ? 'Copiado!' : 'Copiar link'}
          </button>
          {ExportButtons}
          {onDeleteTurma && (
            <button onClick={onDeleteTurma} className="text-slate-300 hover:text-red-500 transition-colors p-1.5" title="Remover turma">
              <Trash2 size={15} />
            </button>
          )}
          <button onClick={() => setExpanded(v => !v)} className="text-slate-400 hover:text-slate-600 p-1.5">
            {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>
        </div>
      </div>

      {/* Link preview */}
      <div className="px-5 pb-3 flex items-center gap-2">
        <span className="text-xs text-slate-400 truncate font-mono flex-1">{link}</span>
      </div>

      {/* Student list */}
      {expanded && recs.length > 0 && (
        <div className="border-t border-slate-100 divide-y divide-slate-50">
          {recs.map(r => (
            <div key={r.id} className="px-5 py-3 flex items-center justify-between text-sm">
              <div>
                <span className="font-medium text-slate-700">{r.profile.name}</span>
                <span className="text-xs text-slate-400 ml-2">{r.profile.course}</span>
              </div>
              <div className="flex items-center gap-2 text-xs">
                <span className="text-slate-400">{new Date(r.completedAt).toLocaleDateString('pt-BR')}</span>
                {r.profile.dominantVark.map(v => (
                  <span key={v} className="px-1.5 py-0.5 rounded font-medium" style={{ background: VARK_COLORS[v] + '20', color: VARK_COLORS[v] }}>{v}</span>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
      {expanded && recs.length === 0 && (
        <div className="border-t border-slate-100 px-5 py-4 text-sm text-slate-400 text-center">
          Nenhum aluno respondeu ainda. Compartilhe o link acima.
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
