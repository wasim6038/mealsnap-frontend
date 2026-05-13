import { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import { openAddMealModal } from '@/redux/slices/uiSlice';
import { useMeals } from '@/hooks';
import { mealAPI } from '@/api/services';
import { EmptyState, MacroBar, StatCard } from '@/components/common/UI';
import { RiAddLine, RiDeleteBinLine, RiHeartLine, RiHeartFill, RiBowlLine } from 'react-icons/ri';
import toast from 'react-hot-toast';

const CAT_COLORS = { breakfast: '#f59e0b', lunch: '#16a34a', dinner: '#6366f1', snacks: '#f97316' };
const CAT_EMOJIS = { breakfast: '🌅', lunch: '🌞', dinner: '🌙', snacks: '🍎' };

export function MealsPage() {
  const dispatch = useDispatch();
  const { selectedDate } = useSelector((s) => s.ui);
  const { meals, summary, loading, reload, setMeals } = useMeals(selectedDate);

  const grouped = meals.reduce((acc, m) => {
    acc[m.category] = acc[m.category] || [];
    acc[m.category].push(m);
    return acc;
  }, {});

  const handleDelete = async (id) => {
    try {
      await mealAPI.remove(id);
      setMeals((prev) => prev.filter((m) => m._id !== id));
      toast.success('Meal removed');
    } catch { toast.error('Failed to delete'); }
  };

  const handleFav = async (id) => {
    try {
      const res = await mealAPI.toggleFav(id);
      setMeals((prev) => prev.map((m) => m._id === id ? res.data.meal : m));
    } catch {}
  };

  return (
    <div className="page-container space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="page-title">Meal Log</h1>
        <button onClick={() => dispatch(openAddMealModal())} className="btn-primary">
          <RiAddLine /> Log Meal
        </button>
      </div>

      {/* Summary row */}
      {summary && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <StatCard label="Total calories" value={`${summary.calories} kcal`} sub={`${summary.remaining} remaining`} color="#16a34a" pct={(summary.calories / summary.calorieTarget) * 100} />
          <StatCard label="Protein" value={`${Math.round(summary.protein)}g`} sub={`of ${summary.proteinTarget}g`} color="#f97316" pct={(summary.protein / summary.proteinTarget) * 100} />
          <StatCard label="Carbs" value={`${Math.round(summary.carbs)}g`} sub={`of ${summary.carbsTarget}g`} color="#0ea5e9" pct={(summary.carbs / summary.carbsTarget) * 100} />
          <StatCard label="Fat" value={`${Math.round(summary.fat)}g`} sub={`of ${summary.fatTarget}g`} color="#a855f7" pct={(summary.fat / summary.fatTarget) * 100} />
        </div>
      )}

      {/* Meals by category */}
      {loading ? (
        <div className="space-y-3">{Array(3).fill(0).map((_, i) => <div key={i} className="skeleton h-28 rounded-2xl" />)}</div>
      ) : meals.length === 0 ? (
        <EmptyState icon="🍽" title="No meals logged yet" subtitle="Start tracking your nutrition by logging your first meal"
          action={<button onClick={() => dispatch(openAddMealModal())} className="btn-primary"><RiAddLine /> Log first meal</button>} />
      ) : (
        <div className="space-y-4">
          {['breakfast', 'lunch', 'dinner', 'snacks'].map((cat) => {
            const items = grouped[cat];
            if (!items?.length) return null;
            const catCals = items.reduce((a, m) => a + m.calories, 0);
            return (
              <div key={cat} className="card overflow-hidden">
                <div className="flex items-center justify-between px-4 py-3 border-b border-gray-50 dark:border-gray-800">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{CAT_EMOJIS[cat]}</span>
                    <span className="text-sm font-semibold capitalize text-gray-800 dark:text-gray-200">{cat}</span>
                    <span className="badge" style={{ background: CAT_COLORS[cat] + '20', color: CAT_COLORS[cat] }}>{items.length} items</span>
                  </div>
                  <span className="text-sm font-semibold text-gray-600 dark:text-gray-400">{catCals} kcal</span>
                </div>
                <AnimatePresence>
                  {items.map((meal) => (
                    <motion.div key={meal._id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, height: 0 }}
                      className="flex items-center gap-3 px-4 py-3 border-b border-gray-50 dark:border-gray-800 last:border-0 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                      <div className="w-9 h-9 rounded-xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-lg flex-shrink-0">
                        <RiBowlLine className="text-gray-500" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-800 dark:text-gray-200 truncate">{meal.name}</p>
                        <p className="text-xs text-gray-400">
                          {meal.quantity}{meal.unit} · P:{Math.round(meal.protein)}g C:{Math.round(meal.carbs)}g F:{Math.round(meal.fat)}g
                        </p>
                      </div>
                      <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex-shrink-0">{meal.calories} kcal</p>
                      <button onClick={() => handleFav(meal._id)} className="icon-btn">
                        {meal.isFavorite ? <RiHeartFill className="text-red-500" /> : <RiHeartLine className="text-gray-400" />}
                      </button>
                      <button onClick={() => handleDelete(meal._id)} className="icon-btn text-gray-400 hover:text-red-500">
                        <RiDeleteBinLine />
                      </button>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default MealsPage;
