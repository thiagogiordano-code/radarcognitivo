import React, { useState } from 'react';
import { AppStep, UserProfile, VarkType, KolbType } from './types';
import { VARK_QUESTIONS, KOLB_QUESTIONS } from './constants';
import Onboarding from './components/Onboarding';
import Questionnaire from './components/Questionnaire';
import Results from './components/Results';
import Feedback from './components/Feedback';
import ClassReportsPanel from './components/ClassReportsPanel';
import { generateProfileAnalysis } from './services/geminiService';
import { saveStudentRecord, getAllRecords } from './utils/storageService';
import { Brain, Network, Sparkles, GraduationCap, BarChart2 } from 'lucide-react';

const App: React.FC = () => {
  const [step, setStep] = useState<AppStep>(AppStep.ONBOARDING);
  const [profile, setProfile] = useState<Partial<UserProfile>>({});
  const [varkAnswers, setVarkAnswers] = useState<Record<number, string>>({});
  const [kolbAnswers, setKolbAnswers] = useState<Record<number, string>>({});
  const [showReports, setShowReports] = useState(false);
  const [recordCount, setRecordCount] = useState(() => getAllRecords().length);

  const handleOnboardingComplete = (name: string, course: string, turma: string) => {
    setProfile({ ...profile, name, course, turma });
    setStep(AppStep.QUESTIONNAIRE_VARK);
  };

  const handleRetake = () => {
    setVarkAnswers({});
    setKolbAnswers({});
    setStep(AppStep.QUESTIONNAIRE_VARK);
  };

  const calculateResults = (vAnswers: Record<number, string>, kAnswers: Record<number, string>) => {
    // Calculate VARK
    const vScores: Record<string, number> = { [VarkType.VISUAL]: 0, [VarkType.AURAL]: 0, [VarkType.READ_WRITE]: 0, [VarkType.KINESTHETIC]: 0 };
    Object.values(vAnswers).forEach(val => vScores[val] = (vScores[val] || 0) + 1);
    
    // Calculate Kolb
    const kScores: Record<string, number> = { [KolbType.ATIVO]: 0, [KolbType.REFLEXIVO]: 0, [KolbType.TEORICO]: 0, [KolbType.PRAGMATICO]: 0 };
    Object.values(kAnswers).forEach(val => kScores[val] = (kScores[val] || 0) + 1);

    // Find dominants (handle ties)
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
      dominantKolb: domK
    };

    setProfile(finalProfile);
    setStep(AppStep.ANALYZING);

    // Trigger AI analysis
    generateProfileAnalysis(finalProfile).then(analysis => {
      const completedProfile = { ...finalProfile, aiAnalysis: analysis };
      setProfile(prev => ({ ...prev, aiAnalysis: analysis }));
      saveStudentRecord(completedProfile);
      setRecordCount(prev => prev + 1);
      setStep(AppStep.RESULTS);
    });
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans">
      <header className="bg-white border-b border-slate-200 py-4 px-6 mb-8 shadow-sm">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
             <div className="bg-blue-100 p-2 rounded-lg text-blue-700">
               <GraduationCap size={24} />
             </div>
             <div className="h-8 w-px bg-slate-300 hidden sm:block"></div>
            <div className="flex flex-col">
              <span className="font-bold text-slate-800 text-lg leading-none">Perfil de Aprendizagem</span>
              <span className="text-xs text-slate-500 font-medium">Prof. Thiago Giordano Siqueira</span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {profile.name && step !== AppStep.ONBOARDING && (
              <div className="hidden sm:block text-sm text-slate-500 bg-slate-100 px-3 py-1 rounded-full">
                Estudante: <span className="font-medium text-slate-800">{profile.name}</span>
              </div>
            )}
            <button
              onClick={() => setShowReports(true)}
              title="Relatórios das Turmas"
              className="flex items-center gap-2 text-sm text-slate-600 hover:text-blue-700 bg-slate-100 hover:bg-blue-50 border border-slate-200 hover:border-blue-300 px-3 py-1.5 rounded-lg transition-colors"
            >
              <BarChart2 size={16} />
              <span className="hidden sm:inline">Relatórios</span>
              {recordCount > 0 && (
                <span className="bg-blue-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                  {recordCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </header>

      <main className="px-4 pb-12 max-w-6xl mx-auto">
        {step === AppStep.ONBOARDING && (
          <Onboarding onComplete={handleOnboardingComplete} />
        )}

        {step === AppStep.QUESTIONNAIRE_VARK && (
          <Questionnaire
            title="Modelo VARK"
            description="Como você prefere receber informações?"
            questions={VARK_QUESTIONS}
            onComplete={(answers) => {
              setVarkAnswers(answers);
              setStep(AppStep.QUESTIONNAIRE_KOLB);
            }}
          />
        )}

        {step === AppStep.QUESTIONNAIRE_KOLB && (
          <Questionnaire
            title="Modelo Kolb"
            description="Como você processa o conhecimento?"
            questions={KOLB_QUESTIONS}
            onComplete={(answers) => {
              setKolbAnswers(answers);
              calculateResults(varkAnswers, answers);
            }}
          />
        )}

        {step === AppStep.ANALYZING && (
          <div className="flex flex-col items-center justify-center pt-20 h-[50vh] animate-fadeIn">
            <div className="relative mb-8">
              <div className="absolute inset-0 bg-blue-500/20 blur-xl rounded-full animate-pulse"></div>
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
            <p className="text-slate-500 text-lg">O Prof. Thiago está analisando suas respostas.</p>
            <div className="mt-6 flex gap-2">
              <span className="w-2 h-2 bg-blue-600 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
              <span className="w-2 h-2 bg-blue-600 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
              <span className="w-2 h-2 bg-blue-600 rounded-full animate-bounce"></span>
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

        {step === AppStep.FEEDBACK && (
          <Feedback />
        )}
      </main>

      {showReports && (
        <ClassReportsPanel onClose={() => setShowReports(false)} />
      )}
      
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.5s ease-out forwards;
        }
      `}</style>
    </div>
  );
};

export default App;