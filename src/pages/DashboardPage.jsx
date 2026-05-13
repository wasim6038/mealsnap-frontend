import { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { motion } from 'framer-motion';
import { openAddMealModal } from '@/redux/slices/uiSlice';
import { StatCard, MacroBar, ProgressRing, SkeletonCard } from '@/components/common/UI';
import AIAssistant from '@/components/ai/AIAssistant';
import DailyChart  from '@/components/dashboard/DailyChart';
import { mealAPI, analyticsAPI, aiAPI } from '@/api/services';
import {
  RiFireLine, RiDropLine, RiScalesLine, RiAddLine,
  RiAppleLine, RiTrophyLine, RiRobotLine,
} from 'react-icons/ri';

export default function DashboardPage() {
  const dispatch = useDispatch();
  const { user }         = useSelector((s) => s.auth);
  const { selectedDate } = useSelector((s) => s.ui);

  const [summary,  setSummary]  = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [tip,      setTip]      = useState('');
  const [loading,  setLoading]  = useState(true);

  useEffect(() => {
    Promise.all([
      mealAPI.getSummary(selectedDate),
      analyticsAPI.get(7),
    ]).then(([sumRes, anaRes]) => {
      setSummary(sumRes.data.summary);
      setAnalytics(anaRes.data);
    }).finally(() => setLoading(false));

    // AI daily tip (non-blocking)
    aiAPI.getDailyTip().then((r) => setTip(r.data.tip)).catch(() => {});
  }, [selectedDate]);

  const calPct  = summary ? (summary.calories  / summary.calorieTarget)  * 100 : 0;
  const protPct = summary ? (summary.protein   / summary.proteinTarget)  * 100 : 0;
  const carbPct = summary ? (summary.carbs     / summary.carbsTarget)    * 100 : 0;
  const fatPct  = summary ? (summary.fat       / summary.fatTarget)      * 100 : 0;

  return (
    <div className="page-container space-y-5">
      {/* Greeting */}
      <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between">
        <div>
          <h1 className="page-title">
            Good {new Date().getHours() < 12 ? 'morning' : new Date().getHours() < 17 ? 'afternoon' : 'evening'}, {user?.name?.split(' ')[0]}! 👋
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
            {new Date(selectedDate).toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' })}
          </p>
        </div>
        <button onClick={() => dispatch(openAddMealModal())} className="btn-primary sm:hidden">
          <RiAddLine /> Log Meal
        </button>
      </motion.div>

      {/* Streak + level */}
      {user?.currentStreak > 0 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }}
          className="flex items-center gap-3 px-4 py-3 rounded-2xl bg-gradient-to-r from-orange-50 to-yellow-50 dark:from-orange-900/20 dark:to-yellow-900/10 border border-orange-100 dark:border-orange-800/30">
          <span className="text-2xl">🔥</span>
          <div>
            <p className="text-sm font-semibold text-orange-800 dark:text-orange-300">{user.currentStreak}-day streak! Keep it up!</p>
            <p className="text-xs text-orange-500">Level {user.level || 1} · {user.totalPoints || 0} points</p>
          </div>
          <div className="ml-auto flex gap-1">
            {user.badges?.slice(0, 3).map((b, i) => <span key={i} className="text-lg">{b}</span>)}
          </div>
        </motion.div>
      )}

      {/* AI Tip */}
      {tip && (
        <div className="flex items-start gap-3 px-4 py-3 rounded-2xl bg-primary-50 dark:bg-primary-900/20 border border-primary-100 dark:border-primary-800/30">
          <RiRobotLine className="text-primary-600 text-lg mt-0.5 flex-shrink-0" />
          <p className="text-sm text-primary-800 dark:text-primary-200">{tip}</p>
        </div>
      )}

      {/* Summary cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {loading ? (
          Array(4).fill(0).map((_, i) => <SkeletonCard key={i} />)
        ) : (
          <>
            <StatCard
              label="Calories today" icon={RiFireLine}
              value={`${summary?.calories || 0}`}
              sub={`of ${summary?.calorieTarget || user?.dailyCalorieTarget || 2000} kcal`}
              color="#16a34a" pct={calPct}
            />
            <StatCard
              label="Remaining" icon={RiAppleLine}
              value={`${summary?.remaining || 0}`}
              sub="kcal left" color="#0ea5e9" pct={100 - calPct}
            />
            <StatCard
              label="Meals logged" icon={RiTrophyLine}
              value={summary?.mealCount || 0}
              sub="today" color="#f97316"
            />
            <StatCard
              label="Protein" icon={RiScalesLine}
              value={`${Math.round(summary?.protein || 0)}g`}
              sub={`of ${summary?.proteinTarget || user?.dailyProteinTarget || 150}g`}
              color="#f97316" pct={protPct}
            />
          </>
        )}
      </div>

      {/* Macros + Ring */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Calorie ring */}
        <div className="card p-5 flex flex-col items-center justify-center">
          <p className="section-title text-center mb-3">Daily calorie goal</p>
          <ProgressRing pct={calPct} size={140} stroke={10} color="#16a34a">
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{Math.round(calPct)}%</p>
            <p className="text-xs text-gray-400">of goal</p>
          </ProgressRing>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-4 text-center">
            {summary?.calories || 0} / {summary?.calorieTarget || 2000} kcal consumed
          </p>
        </div>

        {/* Macro bars */}
        <div className="card p-5 lg:col-span-2">
          <p className="section-title">Macros breakdown</p>
          <div className="space-y-4">
            <MacroBar label="Protein"       current={summary?.protein || 0} target={summary?.proteinTarget || 150} color="#f97316" />
            <MacroBar label="Carbohydrates" current={summary?.carbs   || 0} target={summary?.carbsTarget   || 250} color="#0ea5e9" />
            <MacroBar label="Fat"           current={summary?.fat     || 0} target={summary?.fatTarget     || 65}  color="#a855f7" />
            <MacroBar label="Fiber"         current={summary?.fiber   || 0} target={30}                           color="#22c55e" />
          </div>
        </div>
      </div>

      {/* Weekly chart */}
      {analytics && <DailyChart data={analytics} />}

      {/* AI Assistant */}
      <AIAssistant />
    </div>
  );
}
