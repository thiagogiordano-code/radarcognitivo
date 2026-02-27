import React, { useState, useRef } from 'react';
import { UserProfile } from '../types';
import { generatePDF } from '../utils/pdfGenerator';
import { Download, BookOpen, BrainCircuit, RefreshCw, FileText, ChevronDown, ChevronUp, Lightbulb } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Cell } from 'recharts';
import { PROFILE_DESCRIPTIONS } from '../constants';

interface Props {
  profile: UserProfile;
  onFeedback: () => void;
  onRetake: () => void;
}

const Results: React.FC<Props> = ({ profile, onFeedback, onRetake }) => {
  const [expandedSection, setExpandedSection] = useState<'VARK' | 'KOLB' | null>(null);
  const analysisRef = useRef<HTMLDivElement>(null);

  const varkData = Object.entries(profile.varkScores).map(([name, score]) => ({ name, score }));
  const kolbData = Object.entries(profile.kolbScores).map(([name, score]) => ({ name, score }));

  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444'];
  const currentDate = new Date().toLocaleDateString('pt-BR');

  const toggleSection = (section: 'VARK' | 'KOLB') => {
    setExpandedSection(prev => prev === section ? null : section);
  };

  const scrollToAnalysis = () => {
    analysisRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const getDominantDescription = (type: 'VARK' | 'KOLB') => {
      const dominants = type === 'VARK' ? profile.dominantVark : profile.dominantKolb;
      const descMap = type === 'VARK' ? PROFILE_DESCRIPTIONS.VARK : PROFILE_DESCRIPTIONS.KOLB;
      // @ts-ignore
      return dominants.map(d => ({ title: d, text: descMap[d] }));
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-12">
      
      {/* Header Laudo Style */}
      <div className="bg-white rounded-xl shadow-lg border-t-8 border-blue-800 p-8 text-center relative overflow-hidden">
        <div className="absolute top-4 right-4 text-xs text-slate-400">Emissão: {currentDate}</div>
        <div className="mb-6">
          <h1 className="text-2xl md:text-3xl font-bold text-slate-900 tracking-tight">Resultado do seu Perfil de Aprendizagem</h1>
          <p className="text-slate-600 font-medium mt-2">Análise personalizada com base nos modelos VARK e Kolb</p>
        </div>
        
        <div className="flex flex-wrap justify-center gap-4 md:gap-8 mt-8">
          <div className="bg-blue-50 px-6 py-4 rounded-lg border border-blue-100 flex flex-col items-center">
            <span className="text-sm text-blue-600 font-bold uppercase tracking-wider mb-1">Seu Perfil VARK</span>
            <span className="text-2xl font-bold text-blue-900">{profile.dominantVark.join(' & ')}</span>
          </div>
          <div className="bg-purple-50 px-6 py-4 rounded-lg border border-purple-100 flex flex-col items-center">
            <span className="text-sm text-purple-600 font-bold uppercase tracking-wider mb-1">Seu Perfil Kolb</span>
            <span className="text-2xl font-bold text-purple-900">{profile.dominantKolb.join(' & ')}</span>
          </div>
        </div>
      </div>

      {/* Cards Section */}
      <div className="grid md:grid-cols-2 gap-6">
        
        {/* VARK CARD - Toggles Expansion */}
        <div 
          onClick={() => toggleSection('VARK')}
          className={`bg-white p-6 rounded-xl shadow-sm border transition-all cursor-pointer group relative
            ${expandedSection === 'VARK' ? 'border-blue-500 ring-2 ring-blue-100' : 'border-slate-200 hover:border-blue-300 hover:-translate-y-1 hover:shadow-lg'}`}
        >
          <div className="flex justify-between items-start mb-4">
            <h3 className={`text-lg font-bold flex items-center gap-2 transition-colors ${expandedSection === 'VARK' ? 'text-blue-700' : 'text-slate-700'}`}>
                <BookOpen size={20} className={expandedSection === 'VARK' ? 'text-blue-600' : 'text-slate-400'}/> 
                Perfil VARK
            </h3>
            {expandedSection === 'VARK' ? <ChevronUp className="text-blue-500"/> : <ChevronDown className="text-slate-400"/>}
          </div>
          
          <div className="h-40 pointer-events-none mb-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={varkData} layout="vertical" margin={{left: 0, right: 20}}>
                <XAxis type="number" hide />
                <YAxis dataKey="name" type="category" width={90} tick={{fontSize: 10}} />
                <Bar dataKey="score" radius={[0, 4, 4, 0]}>
                  {varkData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          <p className="text-center text-xs text-slate-400">Clique para ver detalhes completos</p>
        </div>

        {/* KOLB CARD - Toggles Expansion */}
        <div 
          onClick={() => toggleSection('KOLB')}
          className={`bg-white p-6 rounded-xl shadow-sm border transition-all cursor-pointer group relative
            ${expandedSection === 'KOLB' ? 'border-purple-500 ring-2 ring-purple-100' : 'border-slate-200 hover:border-purple-300 hover:-translate-y-1 hover:shadow-lg'}`}
        >
          <div className="flex justify-between items-start mb-4">
             <h3 className={`text-lg font-bold flex items-center gap-2 transition-colors ${expandedSection === 'KOLB' ? 'text-purple-700' : 'text-slate-700'}`}>
                <BrainCircuit size={20} className={expandedSection === 'KOLB' ? 'text-purple-600' : 'text-slate-400'}/> 
                Perfil Kolb
            </h3>
            {expandedSection === 'KOLB' ? <ChevronUp className="text-purple-500"/> : <ChevronDown className="text-slate-400"/>}
          </div>

          <div className="h-40 pointer-events-none mb-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={kolbData} layout="vertical" margin={{left: 0, right: 20}}>
                <XAxis type="number" hide />
                <YAxis dataKey="name" type="category" width={80} tick={{fontSize: 10}} />
                <Bar dataKey="score" radius={[0, 4, 4, 0]}>
                   {kolbData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[(index + 2) % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
           <p className="text-center text-xs text-slate-400">Clique para ver detalhes completos</p>
        </div>
      </div>

      {/* EXPANDED SECTION */}
      {expandedSection && (
        <div className="bg-white rounded-xl shadow-lg border-l-4 p-8 animate-fadeIn scroll-mt-20"
             style={{ borderColor: expandedSection === 'VARK' ? '#3b82f6' : '#9333ea' }}
        >
            <h3 className="text-2xl font-bold text-slate-800 mb-6 flex items-center gap-2">
                {expandedSection === 'VARK' ? <BookOpen className="text-blue-600"/> : <BrainCircuit className="text-purple-600"/>}
                Entendendo seu resultado {expandedSection}
            </h3>
            
            <div className="space-y-6">
                {getDominantDescription(expandedSection).map((item, idx) => (
                    <div key={idx} className="bg-slate-50 p-6 rounded-lg border border-slate-100">
                        <h4 className="font-bold text-lg mb-2 text-slate-800 border-b pb-2 inline-block border-slate-300">
                            {item.title}
                        </h4>
                        <p className="text-slate-700 leading-relaxed text-lg mt-2">
                            {item.text}
                        </p>
                    </div>
                ))}
            </div>

            <div className="mt-8 flex justify-end">
                <button 
                    onClick={scrollToAnalysis}
                    className="flex items-center gap-2 bg-slate-800 text-white px-6 py-3 rounded-lg font-semibold hover:bg-slate-900 transition-colors shadow-md"
                >
                    <Lightbulb size={20} className="text-yellow-400"/>
                    Ver estratégias de estudo personalizadas
                </button>
            </div>
        </div>
      )}

      {/* Analysis Section */}
      <div ref={analysisRef} className="bg-white p-8 rounded-xl shadow-md border border-slate-200 scroll-mt-8">
        <h3 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
           <FileText className="text-blue-600" /> Resumo e Estratégias
        </h3>
        
        {profile.aiAnalysis ? (
          <div className="prose prose-slate max-w-none text-slate-700 leading-relaxed text-lg bg-blue-50/50 p-6 rounded-lg border border-blue-100">
             {profile.aiAnalysis}
          </div>
        ) : (
           <p className="text-slate-600 italic">
             Você aprende melhor observando, visualizando e organizando ideias. Sua forma de lidar com o conteúdo exige conexão com a prática ou reflexão profunda. Use seu estilo a seu favor.
           </p>
        )}
        
        <div className="mt-8 bg-amber-50 border-l-4 border-amber-500 p-4 rounded-r-lg">
          <p className="text-amber-900 font-medium italic">"Seu estilo de aprender é seu superpoder. Vamos usá-lo a seu favor."</p>
        </div>
      </div>

      <div className="text-center text-sm text-slate-500 mb-4">
        🔒 Este resultado é pessoal e pode ser revisado sempre que desejar.
      </div>

      {/* Actions */}
      <div className="flex flex-col gap-4">
        <button
          onClick={() => generatePDF(profile)}
          className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-5 rounded-xl font-bold text-lg transition-all flex items-center justify-center gap-3 shadow-xl shadow-blue-500/20 transform hover:-translate-y-1"
        >
          <Download size={24} />
          Baixar meu laudo personalizado em PDF
        </button>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
             <button
              onClick={onFeedback}
              className="flex items-center justify-center gap-2 bg-white border-2 border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-slate-700 px-6 py-4 rounded-xl font-medium transition-colors"
            >
              Enviar Feedback
            </button>
            <button
              onClick={onRetake}
              className="flex items-center justify-center gap-2 bg-white border-2 border-slate-200 hover:border-blue-300 hover:text-blue-600 text-slate-500 px-6 py-4 rounded-xl font-medium transition-colors"
            >
              <RefreshCw size={18} />
              Refazer o teste
            </button>
        </div>
      </div>
    </div>
  );
};

export default Results;