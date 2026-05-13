import { useState } from 'react';
import { useAnalytics } from '@/hooks';
import { StatCard, SkeletonCard } from '@/components/common/UI';
import {
  Chart as ChartJS,
  ArcElement,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar, Line, Doughnut } from 'react-chartjs-2';

ChartJS.register(
  ArcElement,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Tooltip,
  Legend
);

export function AnalyticsPage() {
  const [period, setPeriod] = useState(7);
  const { data, loading } = useAnalytics(period);
  const isDark = document.documentElement.classList.contains('dark');

  const chartOpts = {
    responsive: true, maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: {
      x: { grid: { display: false }, ticks: { color: '#9ca3af', font: { size: 11 } } },
      y: { grid: { color: isDark ? '#1f2937' : '#f3f4f6' }, ticks: { color: '#9ca3af', font: { size: 11 } } },
    },
  };

  const labels = data?.mealStats?.map((d) => new Date(d._id).toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric' })) || [];
  const calData = data?.mealStats?.map((d) => d.totalCalories) || [];
  const protData = data?.mealStats?.map((d) => d.totalProtein) || [];
  const carbData = data?.mealStats?.map((d) => d.totalCarbs) || [];
  const catData = data?.categoryBreakdown || [];

  return (
    <div className="page-container space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="page-title">Analytics 📊</h1>
        <div className="flex gap-2">
          {[7, 14, 30].map((p) => (
            <button key={p} onClick={() => setPeriod(p)}
              className={`px-3 py-1.5 rounded-xl text-sm font-medium transition-colors ${period === p ? 'bg-primary-600 text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400'}`}>
              {p}d
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {loading ? Array(4).fill(0).map((_, i) => <SkeletonCard key={i} />) : (
          <>
            <StatCard label="Avg daily calories" value={`${data?.avgCalories || 0}`} sub={`${period}-day average`} color="#16a34a" />
            <StatCard label="Meals logged" value={data?.totalMeals || 0} sub={`in ${period} days`} color="#f97316" />
            <StatCard label="Weight change" value={`${data?.weightChange > 0 ? '+' : ''}${data?.weightChange || 0} kg`} sub="over period" color="#0ea5e9" />
            <StatCard label="Days tracked" value={data?.mealStats?.length || 0} sub={`of ${period} days`} color="#a855f7" />
          </>
        )}
      </div>

      <div className="card p-5">
        <p className="section-title">Calorie intake over {period} days</p>
        <div style={{ height: 220 }}>
          <Line data={{ labels, datasets: [{ data: calData, borderColor: '#16a34a', backgroundColor: 'rgba(22,163,74,0.08)', tension: 0.3, fill: true, pointRadius: 3, pointBackgroundColor: '#16a34a' }] }} options={chartOpts} />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="card p-5">
          <p className="section-title">Daily macros (g)</p>
          <div style={{ height: 200 }}>
            <Bar data={{
              labels,
              datasets: [
                { label: 'Protein', data: protData, backgroundColor: '#f97316', borderRadius: 4 },
                { label: 'Carbs',   data: carbData, backgroundColor: '#0ea5e9', borderRadius: 4 },
              ],
            }} options={{ ...chartOpts, plugins: { legend: { display: true, position: 'bottom', labels: { boxWidth: 10, font: { size: 11 }, color: isDark ? '#9ca3af' : '#6b7280' } } } }} />
          </div>
        </div>

        <div className="card p-5">
          <p className="section-title">Meals by category</p>
          <div className="flex items-center gap-6">
            <div style={{ height: 160, width: 160 }} className="flex-shrink-0">
              <Doughnut data={{
                labels: catData.map((c) => c._id),
                datasets: [{ data: catData.map((c) => c.totalCalories), backgroundColor: ['#f59e0b', '#16a34a', '#6366f1', '#f97316'], borderWidth: 0 }],
              }} options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, cutout: '60%' }} />
            </div>
            <div className="space-y-2">
              {catData.map((c, i) => (
                <div key={c._id} className="flex items-center gap-2 text-sm">
                  <div className="w-2.5 h-2.5 rounded-sm" style={{ background: ['#f59e0b', '#16a34a', '#6366f1', '#f97316'][i] }} />
                  <span className="capitalize text-gray-600 dark:text-gray-400">{c._id}</span>
                  <span className="font-medium text-gray-800 dark:text-gray-200 ml-auto pl-4">{c.count} meals</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AnalyticsPage;
