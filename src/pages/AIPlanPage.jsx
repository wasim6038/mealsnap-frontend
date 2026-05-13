import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { aiAPI } from '@/api/services';
import { RiRobotLine, RiRefreshLine } from 'react-icons/ri';
import toast from 'react-hot-toast';

const PLAN_TYPES = [
  { id: 'weight_loss',   label: 'Weight Loss',   emoji: '🔥' },
  { id: 'muscle_gain',   label: 'Muscle Gain',   emoji: '💪' },
  { id: 'vegetarian',    label: 'Vegetarian',    emoji: '🥦' },
  { id: 'vegan',         label: 'Vegan',         emoji: '🌱' },
  { id: 'indian',        label: 'Indian Diet',   emoji: '🍛' },
];

const CAT_COLORS = { breakfast: '#f59e0b', lunch: '#16a34a', dinner: '#6366f1', snacks: '#f97316' };

export default function AIPlanPage() {
  const [planType, setPlanType] = useState('weight_loss');
  const [days, setDays]         = useState(1);
  const [plan, setPlan]         = useState(null);
  const [loading, setLoading]   = useState(false);

  const generate = async () => {
    setLoading(true);
    setPlan(null);
    try {
      const res = await aiAPI.getMealPlan({ planType, days });
      setPlan(res.data.plan);
    } catch {
      toast.error('Failed to generate plan. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-container space-y-5">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-2xl bg-primary-600 flex items-center justify-center">
          <RiRobotLine className="text-white text-xl" />
        </div>
        <div>
          <h1 className="page-title">AI Diet Plan</h1>
          <p className="text-sm text-gray-400 dark:text-gray-500">Personalized plans powered by Gemini AI</p>
        </div>
      </div>

      {/* Controls */}
      <div className="card p-4 space-y-4">
        <div>
          <p className="form-label mb-2">Diet type</p>
          <div className="flex flex-wrap gap-2">
            {PLAN_TYPES.map(({ id, label, emoji }) => (
              <button key={id} onClick={() => setPlanType(id)}
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-sm font-medium border transition-all ${
                  planType === id
                    ? 'bg-primary-600 text-white border-primary-600'
                    : 'border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:border-primary-400'
                }`}>
                {emoji} {label}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div>
            <p className="form-label">Number of days</p>
            <div className="flex gap-2">
              {[1, 3, 7].map((d) => (
                <button key={d} onClick={() => setDays(d)}
                  className={`w-10 h-10 rounded-xl text-sm font-medium transition-colors ${days === d ? 'bg-primary-600 text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400'}`}>
                  {d}
                </button>
              ))}
            </div>
          </div>

          <button onClick={generate} disabled={loading} className="btn-primary ml-auto mt-5">
            {loading ? (
              <><RiRefreshLine className="animate-spin" /> Generating...</>
            ) : (
              <><RiRobotLine /> Generate Plan</>
            )}
          </button>
        </div>
      </div>

      {/* Loading state */}
      {loading && (
        <div className="card p-8 flex flex-col items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center">
            <RiRobotLine className="text-primary-600 text-2xl animate-pulse" />
          </div>
          <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Gemini is crafting your personalized plan...</p>
          <p className="text-xs text-gray-400">This may take a few seconds</p>
          <div className="flex gap-1.5 mt-2">
            {[0, 1, 2].map((i) => (
              <div key={i} className="w-2 h-2 rounded-full bg-primary-400 animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />
            ))}
          </div>
        </div>
      )}

      {/* Plan display */}
      <AnimatePresence>
        {plan && !loading && plan.map((day, di) => (
          <motion.div key={di} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: di * 0.05 }} className="card overflow-hidden">
            <div className="px-4 py-3 bg-primary-50 dark:bg-primary-900/20 border-b border-primary-100 dark:border-primary-800/40">
              <p className="text-sm font-semibold text-primary-800 dark:text-primary-300">
                {days > 1 ? `Day ${day.day}` : 'Your meal plan'} · {day.totalCalories} kcal total
              </p>
              {day.summary && <p className="text-xs text-primary-600 dark:text-primary-400 mt-0.5">{day.summary}</p>}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-0 divide-y divide-gray-50 dark:divide-gray-800 sm:divide-y-0 sm:divide-x">
              {day.meals?.map((meal, mi) => (
                <div key={mi} className="p-4 hover:bg-gray-50 dark:hover:bg-gray-800/40 transition-colors">
                  <div className="flex items-start justify-between gap-2 mb-1.5">
                    <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">{meal.name}</p>
                    <span className="badge badge-green flex-shrink-0 text-xs">{meal.calories} kcal</span>
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed mb-2">{meal.description}</p>
                  <div className="flex gap-2 text-xs text-gray-400">
                    <span>P:{meal.protein}g</span>
                    <span>C:{meal.carbs}g</span>
                    <span>F:{meal.fat}g</span>
                  </div>
                  {meal.tips && (
                    <p className="text-xs text-primary-600 dark:text-primary-400 mt-1.5 italic">💡 {meal.tips}</p>
                  )}
                </div>
              ))}
            </div>
          </motion.div>
        ))}
      </AnimatePresence>

      {/* Placeholder when no plan */}
      {!plan && !loading && (
        <div className="card p-12 flex flex-col items-center text-center gap-3">
          <span className="text-5xl">🤖</span>
          <h3 className="text-base font-semibold text-gray-700 dark:text-gray-300">Ready to generate your plan</h3>
          <p className="text-sm text-gray-400 max-w-xs">Select your diet type and number of days, then click Generate Plan to get a personalized AI meal plan.</p>
          <button onClick={generate} className="btn-primary mt-2"><RiRobotLine /> Generate Plan</button>
        </div>
      )}
    </div>
  );
}
