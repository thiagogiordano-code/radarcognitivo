import React, { useState } from 'react';
import { WELCOME_MESSAGE, COURSE_OPTIONS } from '../constants';
import { Course } from '../types';
import { ArrowRight, User, BookOpen, Heart, PenTool, CheckCircle, GraduationCap } from 'lucide-react';

interface Props {
  onComplete: (name: string, course: string, turma: string) => void;
}

const Onboarding: React.FC<Props> = ({ onComplete }) => {
  const [step, setStep] = useState(0);
  const [name, setName] = useState('');
  const [course, setCourse] = useState<string>('');
  const [customCourse, setCustomCourse] = useState('');
  const [turma, setTurma] = useState('');

  const nextStep = () => setStep(prev => prev + 1);

  const handleFinalSubmit = () => {
    if (name.trim() && (course !== Course.OUTROS || customCourse.trim()) && turma.trim()) {
      onComplete(name, course === Course.OUTROS ? customCourse : course, turma);
    }
  };

  const Step1Welcome = () => (
    <div className="space-y-6 animate-fadeIn">
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-20 h-20 bg-blue-50 text-blue-600 rounded-full mb-6 shadow-sm border border-blue-100">
           <GraduationCap size={40} />
        </div>
        <h1 className="text-2xl md:text-3xl font-bold text-slate-800 mb-3">Vamos juntos nessa jornada!</h1>
        <p className="text-lg text-slate-600 font-medium">Com Prof. Thiago Giordano Siqueira</p>
      </div>
      
      <div className="bg-slate-50 p-6 rounded-xl border border-slate-100 text-slate-700 leading-relaxed space-y-4">
        <p>Olá! Eu sou o <strong>Prof. Thiago Giordano Siqueira</strong> e estarei com você nesta jornada para descobrir como você aprende melhor.</p>
        <p>Todos nós temos um jeito único de aprender. Com poucos minutos, você vai identificar seu perfil de aprendizagem e receber recomendações personalizadas para estudar com mais prazer, foco e resultado.</p>
      </div>

      <button onClick={nextStep} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-4 rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-blue-600/20">
        Avançar <ArrowRight size={20} />
      </button>
    </div>
  );

  const Step2Methodology = () => (
    <div className="space-y-6 animate-fadeIn">
      <div className="text-center mb-6">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-indigo-100 text-indigo-600 rounded-full mb-4">
          <BookOpen size={32} />
        </div>
        <h2 className="text-2xl font-bold text-slate-800">O que você vai descobrir</h2>
      </div>

      <div className="space-y-4">
        <p className="text-slate-600 text-center mb-6">Neste app, vamos usar dois modelos educacionais reconhecidos:</p>
        
        <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-sm flex gap-4 items-start">
          <div className="bg-blue-100 p-2 rounded text-blue-700 font-bold text-sm shrink-0">VARK</div>
          <div>
            <h3 className="font-semibold text-slate-800">Como você absorve informação</h3>
            <p className="text-sm text-slate-500">Visual, Auditivo, Leitura/Escrita ou Prático.</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-sm flex gap-4 items-start">
           <div className="bg-purple-100 p-2 rounded text-purple-700 font-bold text-sm shrink-0">KOLB</div>
          <div>
            <h3 className="font-semibold text-slate-800">Como você processa o saber</h3>
            <p className="text-sm text-slate-500">Ativo, Reflexivo, Teórico ou Pragmático.</p>
          </div>
        </div>
        
        <p className="text-slate-600 italic text-center text-sm mt-4">"Essa combinação revela seu estilo único. É com ele que vamos construir seus novos caminhos de estudo."</p>
      </div>

      <button onClick={nextStep} className="w-full bg-slate-800 hover:bg-slate-900 text-white font-semibold py-4 rounded-xl transition-all flex items-center justify-center gap-2">
        Quero descobrir meu perfil <ArrowRight size={20} />
      </button>
    </div>
  );

  const Step3Protagonist = () => (
    <div className="space-y-6 animate-fadeIn">
      <div className="text-center mb-6">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-amber-100 text-amber-600 rounded-full mb-4">
          <Heart size={32} />
        </div>
        <h2 className="text-2xl font-bold text-slate-800">Você é o protagonista</h2>
      </div>

      <div className="bg-amber-50 p-6 rounded-xl border border-amber-100 text-amber-900 leading-relaxed space-y-4">
        <p>Como estudante adulto, você traz consigo experiência, autonomia e objetivos claros.</p>
        <p>Este app foi pensado com base na <strong>andragogia</strong> — a ciência de ensinar adultos — e valoriza o seu jeito de pensar, decidir e aprender.</p>
        <p className="font-semibold text-center mt-2">Aqui, você estuda com base no que funciona para você.</p>
      </div>

      <button onClick={nextStep} className="w-full bg-amber-600 hover:bg-amber-700 text-white font-semibold py-4 rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-amber-600/20">
        Começar agora <ArrowRight size={20} />
      </button>
    </div>
  );

  const Step4Form = () => (
    <div className="space-y-6 animate-fadeIn">
      <div className="text-center mb-6">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-teal-100 text-teal-600 rounded-full mb-4">
          <PenTool size={32} />
        </div>
        <h2 className="text-2xl font-bold text-slate-800">Identificação</h2>
        <p className="text-slate-500 text-sm">Para personalizarmos seu laudo</p>
      </div>

      <div className="space-y-5">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">Como gostaria de ser chamado(a)?</label>
          <input
            type="text"
            className="w-full p-4 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:outline-none transition-shadow"
            placeholder="Seu nome"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">Qual seu curso/nível atual?</label>
          <select
            className="w-full p-4 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:outline-none bg-white transition-shadow"
            value={course}
            onChange={(e) => setCourse(e.target.value)}
          >
            <option value="">Selecione uma opção...</option>
            {COURSE_OPTIONS.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>

        {course === Course.OUTROS && (
          <div className="animate-fadeIn">
             <label className="block text-sm font-medium text-slate-700 mb-2">Digite seu curso:</label>
             <input
              type="text"
              className="w-full p-4 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:outline-none transition-shadow"
              placeholder="Ex: Licenciatura em História"
              value={customCourse}
              onChange={(e) => setCustomCourse(e.target.value)}
            />
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">Turma / Período:</label>
          <input
            type="text"
            className="w-full p-4 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:outline-none transition-shadow"
            placeholder="Ex: Turma 2024.1, Período 3, Manhã"
            value={turma}
            onChange={(e) => setTurma(e.target.value)}
          />
        </div>
      </div>
      
      <div className="pt-6 border-t border-slate-100 text-center">
         <p className="text-sm text-slate-500 italic mb-4">
           ✍️ Desenvolvido com dedicação por Prof. Thiago Giordano Siqueira<br/>
           "Aprender não é decorar, é transformar. Vamos juntos."
         </p>
      </div>

      <button
        onClick={handleFinalSubmit}
        disabled={!name || !course || (course === Course.OUTROS && !customCourse) || !turma}
        className="w-full bg-teal-600 hover:bg-teal-700 text-white font-semibold py-4 rounded-xl transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-teal-600/20"
      >
        Iniciar Questionário <CheckCircle size={20} />
      </button>
    </div>
  );

  return (
    <div className="max-w-2xl mx-auto p-2">
      <div className="bg-white rounded-2xl shadow-xl border border-slate-200 p-6 md:p-10">
        {step === 0 && <Step1Welcome />}
        {step === 1 && <Step2Methodology />}
        {step === 2 && <Step3Protagonist />}
        {step === 3 && <Step4Form />}
        
        {/* Progress Dots */}
        <div className="flex justify-center gap-2 mt-8">
          {[0, 1, 2, 3].map(i => (
            <div 
              key={i} 
              className={`h-2 rounded-full transition-all duration-300 ${i === step ? 'w-8 bg-blue-600' : 'w-2 bg-slate-300'}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default Onboarding;