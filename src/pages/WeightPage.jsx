import { useState } from 'react';
import { useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import { useWeight } from '@/hooks';
import { StatCard, EmptyState } from '@/components/common/UI';
import { Line } from 'react-chartjs-2';
import { RiAddLine, RiDeleteBinLine, RiArrowUpLine, RiArrowDownLine } from 'react-icons/ri';

export default function WeightPage() {
  const { user } = useSelector((s) => s.auth);
  const { logs, loading, addWeight, removeLog } = useWeight();
  const [weight, setWeight] = useState('');
  const [note, setNote]     = useState('');

  const handleAdd = async () => {
    const w = parseFloat(weight);
    if (!w || w < 20) return;
    await addWeight(w, note);
    setWeight(''); setNote('');
  };

  const current = logs[0]?.weight;
  const prev    = logs[1]?.weight;
  const diff    = current && prev ? parseFloat((current - prev).toFixed(1)) : null;
  const bmi     = user?.height && current ? parseFloat((current / Math.pow(user.height / 100, 2)).toFixed(1)) : null;

  const isDark = document.documentElement.classList.contains('dark');
  const labels = [...logs].reverse().map((l) => new Date(l.loggedAt).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' }));
  const weights = [...logs].reverse().map((l) => l.weight);

  return (
    <div className="page-container space-y-5">
      <h1 className="page-title">Weight Tracker ⚖️</h1>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatCard label="Current weight" value={current ? `${current} kg` : '—'} sub="latest entry" color="#16a34a" />
        <StatCard label="Change" value={diff !== null ? `${diff > 0 ? '+' : ''}${diff} kg` : '—'} sub="from last entry" color={diff < 0 ? '#16a34a' : '#f97316'} />
        <StatCard label="Goal weight" value={user?.targetWeight ? `${user.targetWeight} kg` : '—'} sub="target" color="#0ea5e9" />
        <StatCard label="BMI" value={bmi || '—'} sub={bmi < 18.5 ? 'Underweight' : bmi < 25 ? 'Normal' : bmi < 30 ? 'Overweight' : 'Obese'} color="#a855f7" />
      </div>

      {/* Log form */}
      <div className="card p-4">
        <p className="section-title">Log today's weight</p>
        <div className="flex gap-3 flex-wrap">
          <input
            type="number" step="0.1" min="20" max="500"
            placeholder="Weight in kg (e.g. 72.5)"
            value={weight} onChange={(e) => setWeight(e.target.value)}
            className="form-input max-w-xs"
          />
          <input placeholder="Note (optional)" value={note} onChange={(e) => setNote(e.target.value)} className="form-input flex-1 min-w-40" />
          <button onClick={handleAdd} disabled={!weight} className="btn-primary">
            <RiAddLine /> Log weight
          </button>
        </div>
      </div>

      {/* Chart */}
      {logs.length > 1 && (
        <div className="card p-5">
          <p className="section-title">Weight trend (last 30 days)</p>
          <div style={{ height: 220 }}>
            <Line
              data={{
                labels,
                datasets: [
                  {
                    label: 'Weight (kg)',
                    data: weights,
                    borderColor: '#16a34a',
                    backgroundColor: 'rgba(22,163,74,0.08)',
                    tension: 0.3,
                    fill: true,
                    pointRadius: 4,
                    pointBackgroundColor: '#16a34a',
                  },
                  user?.targetWeight && {
                    label: 'Goal',
                    data: Array(weights.length).fill(user.targetWeight),
                    borderColor: '#0ea5e9',
                    borderDash: [6, 4],
                    pointRadius: 0,
                    tension: 0,
                  },
                ].filter(Boolean),
              }}
              options={{
                responsive: true, maintainAspectRatio: false,
                plugins: { legend: { display: false } },
                scales: {
                  x: { grid: { display: false }, ticks: { color: '#9ca3af', font: { size: 11 } } },
                  y: { grid: { color: isDark ? '#1f2937' : '#f3f4f6' }, ticks: { color: '#9ca3af', font: { size: 11 } } },
                },
              }}
            />
          </div>
        </div>
      )}

      {/* History */}
      <div className="card overflow-hidden">
        <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-800">
          <p className="section-title m-0">History</p>
        </div>
        {loading ? (
          <div className="p-4 space-y-2">{Array(4).fill(0).map((_, i) => <div key={i} className="skeleton h-10 rounded-xl" />)}</div>
        ) : logs.length === 0 ? (
          <EmptyState icon="⚖️" title="No weight entries" subtitle="Start tracking your weight journey" />
        ) : (
          logs.map((log, i) => {
            const prevLog = logs[i + 1];
            const d = prevLog ? parseFloat((log.weight - prevLog.weight).toFixed(1)) : null;
            return (
              <div key={log._id} className="flex items-center gap-3 px-4 py-3 border-b border-gray-50 dark:border-gray-800 last:border-0 hover:bg-gray-50 dark:hover:bg-gray-800/40 transition-colors">
                <div className="flex-1">
                  <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">{log.weight} kg</p>
                  <p className="text-xs text-gray-400">{new Date(log.loggedAt).toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' })}{log.note ? ` · ${log.note}` : ''}</p>
                </div>
                {d !== null && (
                  <div className={`flex items-center gap-0.5 text-xs font-medium ${d < 0 ? 'text-primary-600' : d > 0 ? 'text-red-500' : 'text-gray-400'}`}>
                    {d < 0 ? <RiArrowDownLine /> : d > 0 ? <RiArrowUpLine /> : null}
                    {d !== 0 ? `${d > 0 ? '+' : ''}${d} kg` : 'No change'}
                  </div>
                )}
                {i === 0 && <span className="badge badge-green">Latest</span>}
                <button onClick={() => removeLog(log._id)} className="icon-btn text-gray-300 hover:text-red-500">
                  <RiDeleteBinLine className="text-sm" />
                </button>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
