import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { aiAPI } from '@/api/services';
import { RiRobotLine, RiSendPlaneLine, RiUser3Line } from 'react-icons/ri';

const QUICK_PROMPTS = [
  "What should I eat for dinner?",
  "Am I hitting my protein goal?",
  "Suggest a healthy Indian snack",
  "How can I reduce my calorie intake?",
];

export default function AIAssistant() {
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: "Hi! I'm your MealSnap assistant 🌿 I can help you with meal suggestions, macro tracking, and personalized diet advice. What would you like to know today?",
    },
  ]);
  const [input,   setInput]   = useState('');
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const send = async (text) => {
    const msg = (text || input).trim();
    if (!msg || loading) return;
    setInput('');
    setMessages((prev) => [...prev, { role: 'user', content: msg }]);
    setLoading(true);

    try {
      const history = messages.slice(-8);
      const res = await aiAPI.chat(msg, history);
      setMessages((prev) => [...prev, { role: 'assistant', content: res.data.reply }]);
    } catch {
      setMessages((prev) => [...prev, { role: 'assistant', content: 'Sorry, I had trouble responding. Please try again.' }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-2 px-4 py-3 border-b border-gray-100 dark:border-gray-800">
        <div className="w-7 h-7 rounded-lg bg-primary-600 flex items-center justify-center">
          <RiRobotLine className="text-white text-sm" />
        </div>
        <div>
          <p className="text-sm font-semibold text-gray-900 dark:text-white">AI Nutrition Assistant</p>
          <p className="text-xs text-gray-400">Powered by Gemini</p>
        </div>
        <span className="ml-auto flex items-center gap-1 text-xs text-primary-600 dark:text-primary-400">
          <span className="w-1.5 h-1.5 rounded-full bg-primary-500 animate-pulse" />
          Online
        </span>
      </div>

      {/* Messages */}
      <div className="h-64 overflow-y-auto px-4 py-3 space-y-3 thin-scrollbar">
        <AnimatePresence>
          {messages.map((msg, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex gap-2 items-start ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
            >
              <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${
                msg.role === 'assistant' ? 'bg-primary-600' : 'bg-blue-500'
              }`}>
                {msg.role === 'assistant'
                  ? <RiRobotLine className="text-white text-xs" />
                  : <RiUser3Line className="text-white text-xs" />
                }
              </div>
              <div className={`max-w-[78%] px-3 py-2 rounded-2xl text-sm leading-relaxed ${
                msg.role === 'assistant'
                  ? 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 rounded-tl-sm'
                  : 'bg-primary-600 text-white rounded-tr-sm'
              }`}>
                {msg.content}
              </div>
            </motion.div>
          ))}
          {loading && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex gap-2 items-start">
              <div className="w-6 h-6 rounded-full bg-primary-600 flex items-center justify-center flex-shrink-0">
                <RiRobotLine className="text-white text-xs" />
              </div>
              <div className="bg-gray-100 dark:bg-gray-800 px-3 py-2 rounded-2xl rounded-tl-sm">
                <div className="flex gap-1 items-center h-4">
                  {[0, 1, 2].map((i) => (
                    <span key={i} className="w-1.5 h-1.5 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        <div ref={bottomRef} />
      </div>

      {/* Quick prompts */}
      <div className="px-4 py-2 flex gap-2 overflow-x-auto thin-scrollbar border-t border-gray-50 dark:border-gray-800/50">
        {QUICK_PROMPTS.map((p) => (
          <button
            key={p}
            onClick={() => send(p)}
            disabled={loading}
            className="flex-shrink-0 text-xs px-3 py-1.5 rounded-full border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:border-primary-400 hover:text-primary-600 transition-colors"
          >
            {p}
          </button>
        ))}
      </div>

      {/* Input */}
      <div className="flex gap-2 px-4 py-3 border-t border-gray-100 dark:border-gray-800">
        <input
          className="form-input flex-1"
          placeholder="Ask about your diet, recipes, macros..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && send()}
          disabled={loading}
        />
        <button onClick={() => send()} disabled={loading || !input.trim()} className="btn-primary px-3">
          <RiSendPlaneLine />
        </button>
      </div>
    </div>
  );
}
