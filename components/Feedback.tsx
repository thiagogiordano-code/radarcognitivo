import React, { useState } from 'react';
import { Send, Check, MessageSquare, User, Mail, Tag } from 'lucide-react';

const Feedback: React.FC = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [feedback, setFeedback] = useState('');
  const [sent, setSent] = useState(false);

  const handleSend = () => {
    // Construct the email data
    const recipient = "thiago.giordao@gmail.com";
    const emailSubject = `[Aprendizagem 360º] ${subject}`;
    
    // Create the body content
    const body = `Nome: ${name}
E-mail: ${email}

Mensagem:
${feedback}`;

    // Create mailto link
    const mailtoLink = `mailto:${recipient}?subject=${encodeURIComponent(emailSubject)}&body=${encodeURIComponent(body)}`;

    // Open email client
    window.location.href = mailtoLink;

    // Show success screen (optimistic UI)
    setSent(true);
  };

  const handleReturn = () => {
     window.location.reload(); 
  };

  const isFormValid = name.trim() && email.trim() && subject.trim() && feedback.trim();

  if (sent) {
    return (
      <div className="max-w-lg mx-auto bg-green-50 p-8 rounded-xl text-center border border-green-200 mt-10 animate-fadeIn">
        <div className="relative inline-flex items-center justify-center w-24 h-24 mb-6">
          {/* Ring ripple animation */}
          <div className="absolute inset-0 bg-green-200 rounded-full animate-success-ring opacity-0"></div>
          
          {/* Main icon container with pop animation */}
          <div className="relative z-10 inline-flex items-center justify-center w-20 h-20 bg-green-100 text-green-600 rounded-full animate-success-pop shadow-sm">
            <Check size={40} strokeWidth={3} />
          </div>
        </div>

        <h3 className="text-2xl font-bold text-green-800 mb-4 animate-slideUp">Feedback preparado!</h3>
        <p className="text-green-700 mb-6 text-lg animate-slideUp" style={{ animationDelay: '0.1s' }}>
          Seu cliente de e-mail foi aberto. Por favor, confirme o envio da mensagem para garantir que ela chegue até mim.
        </p>
        <p className="text-green-800 font-semibold mb-8 animate-slideUp" style={{ animationDelay: '0.2s' }}>– Prof. Thiago Giordano Siqueira</p>
        
        <button
            onClick={handleReturn}
            className="text-green-700 underline hover:text-green-900 animate-slideUp"
            style={{ animationDelay: '0.3s' }}
        >
            Voltar à tela inicial
        </button>

        <style>{`
          @keyframes success-pop {
            0% { transform: scale(0); opacity: 0; }
            50% { transform: scale(1.2); }
            100% { transform: scale(1); opacity: 1; }
          }
          @keyframes success-ring {
            0% { transform: scale(0.8); opacity: 0.8; }
            100% { transform: scale(1.5); opacity: 0; }
          }
          @keyframes slideUp {
            from { opacity: 0; transform: translateY(10px); }
            to { opacity: 1; transform: translateY(0); }
          }
          .animate-success-pop {
            animation: success-pop 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
          }
          .animate-success-ring {
            animation: success-ring 0.8s ease-out forwards;
          }
          .animate-slideUp {
            opacity: 0; /* Start hidden */
            animation: slideUp 0.5s ease-out forwards;
          }
        `}</style>
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto bg-white p-8 rounded-xl shadow-lg border border-slate-200 mt-10">
        <div className="flex items-center gap-3 mb-6">
             <div className="bg-blue-100 p-2 rounded-full text-blue-600">
                <MessageSquare size={24} />
             </div>
             <h2 className="text-2xl font-bold text-slate-800">Fale com o Professor</h2>
        </div>
      
      <p className="text-slate-600 mb-6 leading-relaxed">
        Preencha os dados abaixo para enviar sua mensagem diretamente para o e-mail do Prof. Thiago.
      </p>
      
      <div className="space-y-4 mb-4">
        {/* Nome */}
        <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Nome Completo</label>
            <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <User size={18} />
                </div>
                <input
                    type="text"
                    className="w-full pl-10 p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    placeholder="Seu nome e sobrenome"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                />
            </div>
        </div>

        {/* Email */}
        <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Seu E-mail</label>
            <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <Mail size={18} />
                </div>
                <input
                    type="email"
                    className="w-full pl-10 p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    placeholder="exemplo@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                />
            </div>
        </div>

        {/* Assunto */}
        <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Assunto</label>
            <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <Tag size={18} />
                </div>
                <input
                    type="text"
                    className="w-full pl-10 p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    placeholder="Sobre o que quer falar?"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                />
            </div>
            <p className="text-xs text-slate-400 mt-1">O prefixo [Aprendizagem 360º] será adicionado automaticamente.</p>
        </div>

        {/* Mensagem */}
        <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Mensagem</label>
            <textarea
                className="w-full p-4 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none min-h-[120px] text-slate-700 placeholder:text-slate-400"
                placeholder="Escreva seu feedback ou dúvida aqui..."
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
            />
        </div>
      </div>

      <button
        onClick={handleSend}
        disabled={!isFormValid}
        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-xl transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-blue-600/20"
      >
        <Send size={20} />
        Abrir E-mail e Enviar
      </button>
    </div>
  );
};

export default Feedback;