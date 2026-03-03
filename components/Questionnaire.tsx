import React, { useState } from 'react';
import { Question } from '../types';
import { CheckCircle2 } from 'lucide-react';

interface Props {
  questions: Question[];
  title: string;
  description: string;
  onComplete: (answers: Record<number, string>) => void;
}

const Questionnaire: React.FC<Props> = ({ questions, title, description, onComplete }) => {
  const [currentQIndex, setCurrentQIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [selectedOption, setSelectedOption] = useState<string | null>(null);

  const currentQuestion = questions[currentQIndex];
  const progress = ((currentQIndex) / questions.length) * 100;

  const handleSelect = (value: string) => {
    setSelectedOption(value);
    // Auto advance after small delay for better UX
    setTimeout(() => {
      const newAnswers = { ...answers, [currentQuestion.id]: value };
      setAnswers(newAnswers);
      
      if (currentQIndex < questions.length - 1) {
        setCurrentQIndex(prev => prev + 1);
        setSelectedOption(null);
      } else {
        onComplete(newAnswers);
      }
    }, 250);
  };

  const OPTION_LETTERS = ['A', 'B', 'C', 'D'];

  return (
    <div className="max-w-2xl mx-auto">
      {/* Progress header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h2 className="text-xl font-bold text-slate-800">{title}</h2>
            <p className="text-slate-500 text-sm mt-0.5">{description}</p>
          </div>
          <span className="text-sm font-semibold text-slate-500 bg-slate-100 px-3 py-1.5 rounded-full shrink-0">
            {currentQIndex + 1} / {questions.length}
          </span>
        </div>

        <div className="w-full bg-slate-200 h-1.5 rounded-full">
          <div
            className="bg-gradient-to-r from-blue-500 to-blue-600 h-1.5 rounded-full transition-all duration-500 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Step dots */}
        <div className="flex gap-1 mt-2 justify-center">
          {questions.map((_, i) => (
            <div
              key={i}
              className={`h-1 rounded-full transition-all duration-300 ${
                i < currentQIndex ? 'bg-blue-400 w-4' :
                i === currentQIndex ? 'bg-blue-600 w-6' : 'bg-slate-200 w-2'
              }`}
            />
          ))}
        </div>
      </div>

      {/* Question card */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="bg-gradient-to-r from-slate-800 to-slate-700 px-6 py-4">
          <h3 className="text-lg font-semibold text-white leading-relaxed">
            {currentQuestion.text}
          </h3>
        </div>

        <div className="p-5 space-y-3">
          {currentQuestion.options.map((opt, idx) => {
            const isSelected = selectedOption === opt.value;
            return (
              <button
                key={idx}
                onClick={() => handleSelect(opt.value)}
                className={`w-full text-left p-4 rounded-xl border-2 transition-all flex items-center gap-4 group active:scale-[0.99]
                  ${isSelected
                    ? 'border-blue-500 bg-blue-50 shadow-sm shadow-blue-100'
                    : 'border-slate-100 hover:border-blue-200 hover:bg-slate-50/80'
                  }`}
              >
                <span className={`shrink-0 w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold transition-colors ${
                  isSelected ? 'bg-blue-500 text-white' : 'bg-slate-100 text-slate-500 group-hover:bg-blue-100 group-hover:text-blue-600'
                }`}>
                  {OPTION_LETTERS[idx]}
                </span>
                <span className={`text-base leading-snug transition-colors ${isSelected ? 'text-blue-800 font-medium' : 'text-slate-700'}`}>
                  {opt.label}
                </span>
                {isSelected && <CheckCircle2 className="text-blue-500 ml-auto shrink-0" size={20} />}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default Questionnaire;