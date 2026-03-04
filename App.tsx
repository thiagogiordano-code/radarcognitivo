import React, { useState, useEffect } from 'react';
import { AppStep, UserProfile, VarkType, KolbType } from './types';
import { VARK_QUESTIONS, KOLB_QUESTIONS } from './constants';
import Onboarding from './components/Onboarding';
import Questionnaire from './components/Questionnaire';
import Results from './components/Results';
import Feedback from './components/Feedback';
import AdminLogin from './components/AdminLogin';
import AdminDashboard from './components/AdminDashboard';
import { generateProfileAnalysis } from './services/geminiService';
import { saveStudentRecord, getAllRecords } from './utils/storageService';
import { isAdminAuthenticated } from './utils/auth';
import { Brain, Network, Sparkles, GraduationCap, LayoutDashboard } from 'lucide-react';

const getUrlParam = (key: string) => new URLSearchParams(window.location.search).get(key);

const App: React.FC = () => {
  // Admin mode: triggered by ?admin in URL or clicking Admin button
  const [adminMode, setAdminMode] = useState(() => getUrlParam('admin') !== null);
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(() => isAdminAuthenticated());

  // Student flow
  const [step, setStep] = useState<AppStep>(AppStep.ONBOARDING);
  const [profile, setProfile] = useState<Partial<UserProfile>>({});
  const [varkAnswers, setVarkAnswers] = useState<Record<number, string>>({});
  const [kolbAnswers, setKolbAnswers] = useState<Record<number, string>>({});
  const [recordCount, setRecordCount] = useState(0);
  useEffect(() => { getAllRecords().then(rs => setRecordCount(rs.length)); }, []);

  // Turma from URL (set by teacher's shared link)
  const [urlTurma] = useState(() => getUrlParam('turma') ?? '');

  const handleOnboardingComplete = (name: string, course: string, turma: string) => {
    setProfile({ name, course, turma });
    setStep(AppStep.QUESTIONNAIRE_VARK);
  };

  const handleRetake = () => {
    setVarkAnswers({});
    setKolbAnswers({});
    setStep(AppStep.QUESTIONNAIRE_VARK);
  };

  const calculateResults = (vAnswers: Record<number, string>, kAnswers: Record<number, string>) => {
    const vScores: Record<string, number> = {
      [VarkType.VISUAL]: 0, [VarkType.AURAL]: 0, [VarkType.READ_WRITE]: 0, [VarkType.KINESTHETIC]: 0
    };
    Object.values(vAnswers).forEach(val => { vScores[val] = (vScores[val] || 0) + 1; });

    const kScores: Record<string, number> = {
      [KolbType.ATIVO]: 0, [KolbType.REFLEXIVO]: 0, [KolbType.TEORICO]: 0, [KolbType.PRAGMATICO]: 0
    };
    Object.values(kAnswers).forEach(val => { kScores[val] = (kScores[val] || 0) + 1; });

    const maxV = Math.max(...Object.values(vScores));
    const domV = Object.keys(vScores).filter(k => vScores[k] === maxV) as VarkType[];
    const maxK = Math.max(...Object.values(kScores));
    const domK = Object.keys(kScores).filter(k => kScores[k] === maxK) as KolbType[];

    const finalProfile: UserProfile = {
      name: profile.name!,
      course: profile.course!,
      turma: profile.turma!,
      varkScores: vScores as Record<VarkType, number>,
      kolbScores: kScores as Record<KolbType, number>,
      dominantVark: domV,
      dominantKolb: domK,
    };

    setProfile(finalProfile);
    setStep(AppStep.ANALYZING);

    generateProfileAnalysis(finalProfile).then(async analysis => {
      const completed = { ...finalProfile, aiAnalysis: analysis };
      setProfile(prev => ({ ...prev, aiAnalysis: analysis }));
      await saveStudentRecord(completed);
      setRecordCount(prev => prev + 1);
      setStep(AppStep.RESULTS);
    });
  };

  // ─── Admin flow ────────────────────────────────────────────────────────────
  if (adminMode) {
    if (!isAdminLoggedIn) {
      return <AdminLogin onSuccess={() => setIsAdminLoggedIn(true)} />;
    }
    return (
      <AdminDashboard onLogout={() => { setIsAdminLoggedIn(false); setAdminMode(false); }} />
    );
  }

  // ─── Student flow ──────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 py-4 px-6 mb-8">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-br from-blue-600 to-blue-700 p-2 rounded-xl text-white shadow-sm shadow-blue-200">
              <GraduationCap size={22} />
            </div>
            <div className="h-7 w-px bg-slate-200 hidden sm:block" />
            <div>
              <span className="font-bold text-slate-800 text-base leading-none block">Radar Cognitivo</span>
              <span className="text-xs text-slate-400 font-medium">Prof. Thiago Giordano Siqueira</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {urlTurma && (
              <div className="hidden sm:flex items-center gap-1.5 bg-blue-50 border border-blue-200 text-blue-700 text-xs px-3 py-1.5 rounded-full font-medium">
                <GraduationCap size={13} />
                {urlTurma}
              </div>
            )}
            {profile.name && step !== AppStep.ONBOARDING && (
              <div className="hidden sm:block text-sm text-slate-500 bg-slate-100 px-3 py-1 rounded-full">
                <span className="font-medium text-slate-700">{profile.name}</span>
              </div>
            )}
            <button
              onClick={() => setAdminMode(true)}
              title="Área Administrativa"
              className="flex items-center gap-2 text-xs text-slate-500 hover:text-blue-700 bg-slate-100 hover:bg-blue-50 border border-slate-200 hover:border-blue-200 px-3 py-1.5 rounded-lg transition-colors"
            >
              <LayoutDashboard size={14} />
              <span className="hidden sm:inline">Admin</span>
              {recordCount > 0 && (
                <span className="bg-blue-600 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center font-bold text-[10px]">
                  {recordCount > 99 ? '99+' : recordCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </header>

      <main className="px-4 pb-16 max-w-6xl mx-auto">
        {step === AppStep.ONBOARDING && (
          <Onboarding
            onComplete={handleOnboardingComplete}
            initialTurma={urlTurma}
            lockTurma={!!urlTurma}
          />
        )}

        {step === AppStep.QUESTIONNAIRE_VARK && (
          <Questionnaire
            title="Modelo VARK"
            description="Como você prefere receber informações?"
            questions={VARK_QUESTIONS}
            onComplete={(answers) => { setVarkAnswers(answers); setStep(AppStep.QUESTIONNAIRE_KOLB); }}
          />
        )}

        {step === AppStep.QUESTIONNAIRE_KOLB && (
          <Questionnaire
            title="Modelo Kolb"
            description="Como você processa o conhecimento?"
            questions={KOLB_QUESTIONS}
            onComplete={(answers) => { setKolbAnswers(answers); calculateResults(varkAnswers, answers); }}
          />
        )}

        {step === AppStep.ANALYZING && (
          <div className="flex flex-col items-center justify-center pt-20 h-[50vh] animate-fadeIn">
            <div className="relative mb-8">
              <div className="absolute inset-0 bg-blue-500/20 blur-xl rounded-full animate-pulse" />
              <div className="relative bg-white p-6 rounded-full shadow-2xl border border-blue-100 flex items-center justify-center">
                <Brain size={64} className="text-blue-600 animate-pulse" />
                <div className="absolute top-0 right-0">
                  <Sparkles size={24} className="text-yellow-400 animate-bounce" />
                </div>
                <div className="absolute bottom-0 left-0">
                  <Network size={24} className="text-indigo-500 animate-ping" />
                </div>
              </div>
            </div>
            <h2 className="text-2xl font-bold text-slate-800 mb-2">Conectando saberes...</h2>
            <p className="text-slate-500 text-lg">Analisando seu perfil de aprendizagem.</p>
            <div className="mt-6 flex gap-2">
              <span className="w-2 h-2 bg-blue-600 rounded-full animate-bounce [animation-delay:-0.3s]" />
              <span className="w-2 h-2 bg-blue-600 rounded-full animate-bounce [animation-delay:-0.15s]" />
              <span className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" />
            </div>
          </div>
        )}

        {step === AppStep.RESULTS && profile.dominantVark && (
          <Results
            profile={profile as UserProfile}
            onFeedback={() => setStep(AppStep.FEEDBACK)}
            onRetake={handleRetake}
          />
        )}

        {step === AppStep.FEEDBACK && <Feedback />}
      </main>

      <footer className="border-t border-slate-200 py-6 text-center">
        <p className="text-xs text-slate-400">
          © {new Date().getFullYear()} Radar Cognitivo · Prof. Thiago Giordano Siqueira
        </p>
      </footer>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn { animation: fadeIn 0.5s ease-out forwards; }
      `}</style>
    </div>
  );
};

export default App;
