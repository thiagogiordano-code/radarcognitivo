import React, { useState, useEffect } from 'react';
import { X, Download, FileSpreadsheet, FileText, FileDown, Trash2, Users, ChevronDown, ChevronUp, BarChart2 } from 'lucide-react';
import { getRecordsByTurma, getUniqueTurmas, deleteRecord, clearAllRecords } from '../utils/storageService';
import { exportToXLS, exportToDOC, exportClassPDF } from '../utils/classReportGenerator';
import { StudentRecord } from '../types';

interface Props {
  onClose: () => void;
}

const ClassReportsPanel: React.FC<Props> = ({ onClose }) => {
  const [recordsByTurma, setRecordsByTurma] = useState<Record<string, StudentRecord[]>>({});
  const [expandedTurma, setExpandedTurma] = useState<string | null>(null);
  const [exporting, setExporting] = useState<string | null>(null);
  const [confirmClear, setConfirmClear] = useState(false);

  const refresh = () => setRecordsByTurma(getRecordsByTurma());

  useEffect(() => {
    refresh();
  }, []);

  const turmas = getUniqueTurmas();
  const totalRecords = Object.values(recordsByTurma).flat().length;

  const handleExport = async (format: 'pdf' | 'xls' | 'doc', turma: string, records: StudentRecord[]) => {
    setExporting(`${format}-${turma}`);
    try {
      if (format === 'xls') exportToXLS(records, turma);
      else if (format === 'pdf') exportClassPDF(records, turma);
      else await exportToDOC(records, turma);
    } finally {
      setExporting(null);
    }
  };

  const handleDelete = (id: string) => {
    deleteRecord(id);
    refresh();
  };

  const handleClearAll = () => {
    clearAllRecords();
    refresh();
    setConfirmClear(false);
  };

  const varkColors: Record<string, string> = {
    'Visual': 'bg-blue-100 text-blue-700',
    'Auditivo': 'bg-emerald-100 text-emerald-700',
    'Leitura/Escrita': 'bg-amber-100 text-amber-700',
    'Cinestésico': 'bg-red-100 text-red-700',
  };
  const kolbColors: Record<string, string> = {
    'Ativo': 'bg-purple-100 text-purple-700',
    'Reflexivo': 'bg-pink-100 text-pink-700',
    'Teórico': 'bg-teal-100 text-teal-700',
    'Pragmático': 'bg-orange-100 text-orange-700',
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl my-8 border border-slate-200">
        {/* Header */}
        <div className="bg-slate-800 rounded-t-2xl px-6 py-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <BarChart2 size={24} className="text-blue-400" />
            <div>
              <h2 className="text-white font-bold text-xl">Relatórios por Turma</h2>
              <p className="text-slate-400 text-sm">{totalRecords} resposta(s) armazenada(s) em {turmas.length} turma(s)</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
            <X size={24} />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-6">
          {turmas.length === 0 ? (
            <div className="text-center py-16">
              <Users size={48} className="mx-auto text-slate-300 mb-4" />
              <h3 className="text-slate-500 font-semibold text-lg">Nenhuma resposta registrada ainda</h3>
              <p className="text-slate-400 text-sm mt-2">Quando alunos concluírem o questionário, os dados aparecerão aqui agrupados por turma.</p>
            </div>
          ) : (
            turmas.map(turma => {
              const records = recordsByTurma[turma] || [];
              const isExpanded = expandedTurma === turma;

              // Compute class statistics
              const varkCount: Record<string, number> = {};
              const kolbCount: Record<string, number> = {};
              records.forEach(r => {
                r.profile.dominantVark.forEach(v => { varkCount[v] = (varkCount[v] || 0) + 1; });
                r.profile.dominantKolb.forEach(k => { kolbCount[k] = (kolbCount[k] || 0) + 1; });
              });

              return (
                <div key={turma} className="border border-slate-200 rounded-xl overflow-hidden shadow-sm">
                  {/* Turma Header */}
                  <div
                    className="flex items-center justify-between bg-slate-50 px-5 py-4 cursor-pointer hover:bg-slate-100 transition-colors"
                    onClick={() => setExpandedTurma(isExpanded ? null : turma)}
                  >
                    <div className="flex items-center gap-3">
                      <div className="bg-blue-600 text-white text-sm font-bold rounded-lg w-8 h-8 flex items-center justify-center">
                        {records.length}
                      </div>
                      <div>
                        <h3 className="font-bold text-slate-800 text-lg">{turma}</h3>
                        <p className="text-slate-500 text-sm">{records.length} aluno(s)</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      {/* Export buttons */}
                      <div className="flex gap-2" onClick={e => e.stopPropagation()}>
                        <button
                          onClick={() => handleExport('pdf', turma, records)}
                          disabled={exporting === `pdf-${turma}`}
                          title="Exportar PDF"
                          className="flex items-center gap-1.5 bg-red-600 hover:bg-red-700 disabled:opacity-60 text-white text-xs font-semibold px-3 py-2 rounded-lg transition-colors shadow-sm"
                        >
                          <FileDown size={14} />
                          PDF
                        </button>
                        <button
                          onClick={() => handleExport('xls', turma, records)}
                          disabled={exporting === `xls-${turma}`}
                          title="Exportar Excel"
                          className="flex items-center gap-1.5 bg-green-700 hover:bg-green-800 disabled:opacity-60 text-white text-xs font-semibold px-3 py-2 rounded-lg transition-colors shadow-sm"
                        >
                          <FileSpreadsheet size={14} />
                          XLS
                        </button>
                        <button
                          onClick={() => handleExport('doc', turma, records)}
                          disabled={exporting === `doc-${turma}`}
                          title="Exportar Word"
                          className="flex items-center gap-1.5 bg-blue-700 hover:bg-blue-800 disabled:opacity-60 text-white text-xs font-semibold px-3 py-2 rounded-lg transition-colors shadow-sm"
                        >
                          <FileText size={14} />
                          DOC
                        </button>
                      </div>
                      {isExpanded ? <ChevronUp size={20} className="text-slate-500" /> : <ChevronDown size={20} className="text-slate-500" />}
                    </div>
                  </div>

                  {/* Stats bar */}
                  <div className="px-5 py-3 bg-white border-b border-slate-100 flex flex-wrap gap-2 text-xs">
                    <span className="text-slate-500 font-medium mr-1">VARK:</span>
                    {Object.entries(varkCount).map(([k, v]) => (
                      <span key={k} className={`px-2 py-0.5 rounded-full font-semibold ${varkColors[k] || 'bg-slate-100 text-slate-600'}`}>
                        {k}: {v}
                      </span>
                    ))}
                    <span className="text-slate-300 mx-2">|</span>
                    <span className="text-slate-500 font-medium mr-1">Kolb:</span>
                    {Object.entries(kolbCount).map(([k, v]) => (
                      <span key={k} className={`px-2 py-0.5 rounded-full font-semibold ${kolbColors[k] || 'bg-slate-100 text-slate-600'}`}>
                        {k}: {v}
                      </span>
                    ))}
                  </div>

                  {/* Expandable student list */}
                  {isExpanded && (
                    <div className="divide-y divide-slate-100">
                      {records.map(record => (
                        <div key={record.id} className="px-5 py-4 flex items-start justify-between hover:bg-slate-50 transition-colors">
                          <div className="space-y-1.5 flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="font-semibold text-slate-800">{record.profile.name}</span>
                              <span className="text-xs text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">{record.profile.course}</span>
                              <span className="text-xs text-slate-400">
                                {new Date(record.completedAt).toLocaleDateString('pt-BR')}
                              </span>
                            </div>
                            <div className="flex flex-wrap gap-1.5">
                              {record.profile.dominantVark.map(v => (
                                <span key={v} className={`text-xs px-2 py-0.5 rounded-full font-medium ${varkColors[v] || 'bg-slate-100 text-slate-600'}`}>
                                  VARK: {v}
                                </span>
                              ))}
                              {record.profile.dominantKolb.map(k => (
                                <span key={k} className={`text-xs px-2 py-0.5 rounded-full font-medium ${kolbColors[k] || 'bg-slate-100 text-slate-600'}`}>
                                  Kolb: {k}
                                </span>
                              ))}
                            </div>
                          </div>
                          <button
                            onClick={() => handleDelete(record.id)}
                            title="Remover registro"
                            className="ml-4 text-slate-300 hover:text-red-500 transition-colors shrink-0"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        {totalRecords > 0 && (
          <div className="px-6 pb-6 flex justify-between items-center border-t border-slate-100 pt-4">
            <p className="text-xs text-slate-400">Os dados são armazenados localmente neste navegador.</p>
            {confirmClear ? (
              <div className="flex items-center gap-3">
                <span className="text-sm text-red-600 font-medium">Confirmar exclusão de todos os registros?</span>
                <button onClick={() => setConfirmClear(false)} className="text-sm text-slate-500 hover:text-slate-700 px-3 py-1.5 border border-slate-200 rounded-lg">
                  Cancelar
                </button>
                <button onClick={handleClearAll} className="text-sm text-white bg-red-600 hover:bg-red-700 px-3 py-1.5 rounded-lg font-semibold">
                  Limpar tudo
                </button>
              </div>
            ) : (
              <button
                onClick={() => setConfirmClear(true)}
                className="flex items-center gap-1.5 text-sm text-red-500 hover:text-red-700 transition-colors"
              >
                <Trash2 size={14} />
                Limpar todos os dados
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ClassReportsPanel;
