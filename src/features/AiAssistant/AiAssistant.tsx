
import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Send, Sparkles, Bot, User, Loader2, Lightbulb, TrendingUp, HelpCircle, Palette, DollarSign } from 'lucide-react';
import { GoogleGenAI } from "@google/genai";
import { Product, Order } from '@/types';

interface AiAssistantProps {
  products: Product[];
  orders: Order[];
}

const AiAssistant: React.FC<AiAssistantProps> = ({ products, orders }) => {
  const [messages, setMessages] = useState<{role: 'user' | 'bot', content: string}[]>([]);
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
    { text: "¿Qué precio sugerís para una remera?", icon: <DollarSign size={14} /> },
    { text: "Ideas de frases para el Día del Padre", icon: <Palette size={14} /> },
    { text: "¿Cómo puedo mejorar mis ventas?", icon: <TrendingUp size={14} /> },
    { text: "Estrategia para liquidar stock de tazas", icon: <Lightbulb size={14} /> }
  ];

  const categories = [
    { icon: <Palette size={16} />, label: "Tips de Diseño", color: "text-purple-600 bg-purple-50 hover:bg-purple-100" },
    { icon: <TrendingUp size={16} />, label: "Análisis Ventas", color: "text-emerald-600 bg-emerald-50 hover:bg-emerald-100" },
    { icon: <HelpCircle size={16} />, label: "Soporte Andy", color: "text-indigo-600 bg-indigo-50 hover:bg-indigo-100" }
  ];

  return (
    <div className="h-full flex flex-col bg-white">
      {/* Categories */}
      <div className="border-b border-slate-200 p-4">
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
          {categories.map((cat, i) => (
            <button
              key={i}
              onClick={() => setInput(`Ayúdame con ${cat.label.toLowerCase()}`)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-xs transition-all whitespace-nowrap ${cat.color}`}
            >
              {cat.icon}
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto">
        {messages.length === 0 ? (
          /* Empty State with Suggestions */
          <div className="h-full flex flex-col items-center justify-center p-8 space-y-8">
            <div className="text-center space-y-4">
              <h3 className="text-2xl font-black text-slate-900">¿En qué puedo ayudarte?</h3>
              <p className="text-sm text-slate-500 font-medium">Selecciona una opción o escribe tu consulta</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full max-w-2xl">
              {suggestions.map((sug, i) => (
                <motion.button
                  key={i}
                  onClick={() => setInput(sug.text)}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="flex items-start gap-3 p-4 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-2xl text-left transition-all group"
                >
                  <div className="p-2 bg-white rounded-lg text-indigo-600 group-hover:text-purple-600 transition-colors">
                    {sug.icon}
                  </div>
                  <span className="text-sm font-bold text-slate-700 flex-1">{sug.text}</span>
                </motion.button>
              ))}
            </div>
          </div>
        ) : (
          /* Messages */
          <div className="p-4 md:p-6 space-y-4">
            <AnimatePresence initial={false}>
              {messages.map((m, i) => (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  key={i}
                  className={`flex gap-3 ${m.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
                >
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${m.role === 'user' ? 'bg-slate-900 text-white' : 'bg-gradient-to-br from-purple-600 to-indigo-600 text-white'}`}>
                    {m.role === 'user' ? <User size={16}/> : <Sparkles size={16}/>}
                  </div>
                  <div className={`flex-1 max-w-[80%] ${m.role === 'user' ? 'text-right' : 'text-left'}`}>
                    <div className={`inline-block p-3 rounded-2xl ${m.role === 'user' ? 'bg-slate-100 text-slate-900' : 'bg-white border border-slate-200 text-slate-900'}`}>
                      <p className="text-sm leading-relaxed whitespace-pre-wrap">{m.content}</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
            {isLoading && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex gap-3"
              >
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-600 to-indigo-600 flex items-center justify-center">
                  <Loader2 size={16} className="animate-spin text-white"/>
                </div>
                <div className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-2xl">
                  <div className="flex gap-1">
                    <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{animationDelay: '0ms'}}></div>
                    <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{animationDelay: '150ms'}}></div>
                    <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{animationDelay: '300ms'}}></div>
                  </div>
                </div>
              </motion.div>
            )}
            <div ref={scrollRef}></div>
          </div>
        )}
      </div>

      {/* Input Area */}
      <div className="border-t border-slate-200 p-4">
        <div className="relative">
          <input
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyPress={e => e.key === 'Enter' && handleSend()}
            placeholder="Mensaje a Gemini..."
            className="w-full pl-4 pr-12 py-3 bg-slate-50 border border-slate-200 rounded-full font-medium text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all placeholder:text-slate-400"
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || isLoading}
            className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-slate-900 text-white rounded-full flex items-center justify-center hover:bg-black transition-all disabled:opacity-50 disabled:cursor-not-allowed active:scale-95"
          >
            <Send size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default AiAssistant;
