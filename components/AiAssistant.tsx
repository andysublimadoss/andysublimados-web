
import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Send, Sparkles, Bot, User, Loader2, Lightbulb, TrendingUp, HelpCircle, X, MessageSquare } from 'lucide-react';
import { GoogleGenAI } from "@google/genai";
import { Product, Order } from '../types';

interface AiAssistantProps {
  products: Product[];
  orders: Order[];
}

const AiAssistant: React.FC<AiAssistantProps> = ({ products, orders }) => {
  const [messages, setMessages] = useState<{role: 'user' | 'bot', content: string}[]>([
    { role: 'bot', content: '¡Hola! Soy Gemini, tu asistente inteligente para Andy Sublimados. ¿En qué puedo ayudarte hoy? Puedo darte ideas para diseños, ayudarte con precios o analizar tu negocio.' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMsg = input.trim();
    setMessages(prev => [...prev, { role: 'user', content: userMsg }]);
    setInput('');
    setIsLoading(true);

    try {
      // Fix: Initialize GoogleGenAI according to guidelines using named parameter and direct process.env.API_KEY
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const context = `Contexto del negocio: "Andy Sublimados", taller de sublimación y diseño. 
                       Inventario actual: ${products.length} tipos de productos. 
                       Pedidos totales: ${orders.length}.
                       Eres un experto consultor de negocios amigable y creativo. Ayuda al usuario con sus dudas de diseño, precios y estrategia.`;
      
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `${context}\n\nUsuario dice: ${userMsg}`,
      });

      const botMsg = response.text || 'Lo siento, tuve un problema analizando eso. ¿Podrías preguntar de otra forma?';
      setMessages(prev => [...prev, { role: 'bot', content: botMsg }]);
    } catch (error) {
      setMessages(prev => [...prev, { role: 'bot', content: 'Hubo un error al conectar con mi cerebro artificial. Verifica tu conexión.' }]);
    } finally {
      setIsLoading(false);
    }
  };

  const suggestions = [
    "¿Qué precio sugerís para una remera?",
    "Ideas de frases para el Día del Padre",
    "¿Cómo puedo mejorar mis ventas?",
    "Estrategia para liquidar stock de tazas"
  ];

  return (
    <div className="h-[calc(100vh-160px)] flex flex-col space-y-8 animate-in fade-in duration-700">
      <div className="flex justify-between items-center bg-white p-8 rounded-[3rem] border border-slate-100 shadow-xl shadow-slate-200/20">
         <div className="flex items-center gap-5">
            <div className="p-4 bg-indigo-50 text-indigo-600 rounded-3xl shadow-inner">
               <Bot size={32} />
            </div>
            <div>
               <h2 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
                  Gemini IA <Sparkles className="text-indigo-600 animate-pulse" size={24}/>
               </h2>
               <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px] mt-1">Potenciado por Google Gemini</p>
            </div>
         </div>
         <div className="hidden md:flex items-center gap-3">
            <div className="px-5 py-2 bg-slate-50 rounded-full border border-slate-100 flex items-center gap-2">
               <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
               <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Sistema Online</span>
            </div>
         </div>
      </div>

      <div className="flex-1 bg-white rounded-[4rem] shadow-2xl shadow-slate-200/40 border border-slate-100 flex flex-col overflow-hidden">
        <div className="flex-1 overflow-y-auto p-10 space-y-8 custom-scrollbar">
          <AnimatePresence initial={false}>
            {messages.map((m, i) => (
              <motion.div 
                initial={{ opacity: 0, y: 20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                key={i} 
                className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                 <div className={`max-w-[85%] p-6 rounded-[2.5rem] flex gap-5 shadow-sm ${m.role === 'user' ? 'bg-slate-900 text-white rounded-tr-none' : 'bg-slate-50 text-slate-800 rounded-tl-none border border-slate-100'}`}>
                    <div className={`shrink-0 w-10 h-10 rounded-2xl flex items-center justify-center shadow-inner ${m.role === 'user' ? 'bg-white/10' : 'bg-white text-indigo-600'}`}>
                       {m.role === 'user' ? <User size={20}/> : <Bot size={20}/>}
                    </div>
                    <div className="text-sm font-bold leading-relaxed whitespace-pre-wrap">{m.content}</div>
                 </div>
              </motion.div>
            ))}
          </AnimatePresence>
          {isLoading && (
             <motion.div 
               initial={{ opacity: 0, x: -20 }}
               animate={{ opacity: 1, x: 0 }}
               className="flex justify-start"
             >
                <div className="bg-slate-50 p-6 rounded-[2.5rem] rounded-tl-none border border-slate-100 flex items-center gap-4 shadow-sm">
                   <div className="p-2 bg-white rounded-xl shadow-inner">
                      <Loader2 size={20} className="animate-spin text-indigo-600"/>
                   </div>
                   <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest animate-pulse">Gemini está pensando...</span>
                </div>
             </motion.div>
          )}
          <div ref={scrollRef}></div>
        </div>

        <div className="p-10 bg-slate-50/50 border-t border-slate-100">
          <div className="flex flex-wrap gap-3 mb-6">
             {suggestions.map((s, i) => (
               <button 
                 key={i} 
                 onClick={() => setInput(s)} 
                 className="text-[10px] font-black uppercase tracking-widest bg-white border border-slate-100 text-slate-500 px-5 py-2.5 rounded-2xl hover:border-indigo-500 hover:text-indigo-600 hover:shadow-lg transition-all active:scale-95"
               >
                  {s}
               </button>
             ))}
          </div>
          <div className="relative group">
            <input 
              type="text" 
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyPress={e => e.key === 'Enter' && handleSend()}
              placeholder="Escribe tu consulta aquí..."
              className="w-full pl-8 pr-20 py-6 bg-white border border-slate-100 rounded-[2.5rem] shadow-xl shadow-slate-200/20 font-bold focus:ring-4 focus:ring-indigo-500/5 outline-none transition-all placeholder:text-slate-300"
            />
            <button 
              onClick={handleSend} 
              disabled={!input.trim() || isLoading}
              className="absolute right-3 top-1/2 -translate-y-1/2 w-14 h-14 bg-slate-900 text-white rounded-[1.5rem] flex items-center justify-center hover:bg-black transition-all shadow-2xl disabled:opacity-50 disabled:cursor-not-allowed group-hover:scale-105 active:scale-95"
            >
               <Send size={24} />
            </button>
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
         <AiCard icon={<Lightbulb className="text-amber-500"/>} title="Tips de Diseño" />
         <AiCard icon={<TrendingUp className="text-emerald-500"/>} title="Análisis Ventas" />
         <AiCard icon={<HelpCircle className="text-indigo-500"/>} title="Soporte Andy" />
      </div>
    </div>
  );
};

const AiCard = ({icon, title}: {icon: React.ReactNode, title: string}) => (
  <motion.div 
    whileHover={{ y: -5, scale: 1.02 }}
    whileTap={{ scale: 0.98 }}
    className="bg-white p-6 rounded-[2.5rem] border border-slate-100 flex items-center gap-5 shadow-xl shadow-slate-200/20 cursor-pointer group"
  >
     <div className="p-4 bg-slate-50 rounded-2xl group-hover:bg-indigo-50 transition-colors shadow-inner">
        {icon}
     </div>
     <span className="text-[11px] font-black uppercase tracking-widest text-slate-600 group-hover:text-indigo-600 transition-colors">{title}</span>
  </motion.div>
);

export default AiAssistant;
