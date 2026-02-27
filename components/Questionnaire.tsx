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

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-slate-800">{title}</h2>
        <p className="text-slate-500 mt-1">{description}</p>
        
        <div className="w-full bg-slate-200 h-2 rounded-full mt-4">
          <div 
            className="bg-blue-600 h-2 rounded-full transition-all duration-300 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
        <p className="text-right text-xs text-slate-400 mt-1">
          Pergunta {currentQIndex + 1} de {questions.length}
        </p>
      </div>

      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 min-h-[400px] flex flex-col justify-center">
        <h3 className="text-xl font-semibold text-slate-800 mb-6 leading-relaxed">
          {currentQuestion.text}
        </h3>

        <div className="space-y-3">
          {currentQuestion.options.map((opt, idx) => {
            const isSelected = selectedOption === opt.value;
            return (
              <button
                key={idx}
                onClick={() => handleSelect(opt.value)}
                className={`w-full text-left p-4 rounded-lg border-2 transition-all flex items-center justify-between group
                  ${isSelected 
                    ? 'border-blue-500 bg-blue-50 text-blue-800' 
                    : 'border-slate-100 hover:border-blue-300 hover:bg-slate-50'
                  }`}
              >
                <span className="text-lg">{opt.label}</span>
                {isSelected && <CheckCircle2 className="text-blue-500" size={24} />}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default Questionnaire;