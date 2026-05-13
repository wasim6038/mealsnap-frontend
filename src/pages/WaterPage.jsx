import { useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import { useWater } from '@/hooks';
import { ProgressRing, StatCard } from '@/components/common/UI';
import { RiDropLine, RiAddLine, RiSubtractLine, RiDeleteBinLine } from 'react-icons/ri';
import { Line } from 'react-chartjs-2';

const QUICK_AMOUNTS = [150, 250, 350, 500];

export default function WaterPage() {
  const { selectedDate } = useSelector((s) => s.ui);
  const { logs, totalToday, goal, loading, addWater, removeLog } = useWater(selectedDate);

  const pct = goal > 0 ? Math.min(100, (totalToday / goal) * 100) : 0;
  const remaining = Math.max(0, goal - totalToday);

  return (
    <div className="page-container space-y-5">
      <h1 className="page-title">Water Tracker 💧</h1>

      {/* Main tracker */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Ring + quick add */}
        <div className="card p-6 flex flex-col items-center gap-4">
          <ProgressRing pct={pct} size={160} stroke={12} color="#0ea5e9">
            <span className="text-3xl font-bold text-gray-900 dark:text-white">{(totalToday / 1000).toFixed(1)}L</span>
            <span className="text-xs text-gray-400">{Math.round(pct)}% of goal</span>
          </ProgressRing>

          <p className="text-sm text-gray-500 dark:text-gray-400 text-center">
            {remaining > 0
              ? `${(remaining / 1000).toFixed(1)}L more to reach your ${(goal / 1000).toFixed(1)}L goal`
              : '🎉 Daily water goal achieved!'}
          </p>

          {/* Quick add buttons */}
          <div>
            <p className="text-xs text-gray-400 text-center mb-2">Quick add</p>
            <div className="flex gap-2 flex-wrap justify-center">
              {QUICK_AMOUNTS.map((amount) => (
                <button
                  key={amount}
                  onClick={() => addWater(amount)}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 text-sm font-medium hover:bg-blue-100 dark:hover:bg-blue-900/40 transition-colors border border-blue-100 dark:border-blue-800/40"
                >
                  <RiDropLine className="text-blue-400" />
                  +{amount}ml
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <StatCard label="Consumed" value={`${(totalToday / 1000).toFixed(2)}L`} sub="today" color="#0ea5e9" />
            <StatCard label="Remaining" value={`${(remaining / 1000).toFixed(2)}L`} sub="to go" color="#6366f1" />
            <StatCard label="Goal" value={`${(goal / 1000).toFixed(1)}L`} sub="daily target" color="#16a34a" />
            <StatCard label="Cups" value={Math.round(totalToday / 250)} sub="of water today" color="#f97316" />
          </div>
        </div>
      </div>

      {/* Animated water display */}
      <div className="card p-4">
        <p className="section-title">Today's log</p>
        {loading ? (
          <div className="skeleton h-20 rounded-xl" />
        ) : logs.length === 0 ? (
          <p className="text-sm text-gray-400 text-center py-6">No water logged today. Start drinking!</p>
        ) : (
          <div className="space-y-2 max-h-64 overflow-y-auto thin-scrollbar">
            {logs.map((log) => (
              <motion.div
                key={log._id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-blue-50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-800/30"
              >
                <RiDropLine className="text-blue-500 flex-shrink-0" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-blue-800 dark:text-blue-300">+{log.amount}ml</p>
                  <p className="text-xs text-blue-400">{new Date(log.loggedAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}</p>
                </div>
                <button onClick={() => removeLog(log._id)} className="icon-btn text-blue-300 hover:text-red-500">
                  <RiDeleteBinLine className="text-sm" />
                </button>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
