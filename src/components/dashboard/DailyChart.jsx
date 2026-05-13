import { Bar, Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, PointElement, LineElement, Title, Tooltip, Legend, Filler } from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, PointElement, LineElement, Title, Tooltip, Legend, Filler);

const chartOptions = (darkMode) => ({
  responsive: true,
  maintainAspectRatio: false,
  plugins: { legend: { display: false }, tooltip: { mode: 'index', intersect: false } },
  scales: {
    x: { grid: { display: false }, ticks: { color: darkMode ? '#6b7280' : '#9ca3af', font: { size: 11 } } },
    y: { grid: { color: darkMode ? '#1f2937' : '#f3f4f6' }, ticks: { color: darkMode ? '#6b7280' : '#9ca3af', font: { size: 11 } } },
  },
});

export default function DailyChart({ data }) {
  const isDark = document.documentElement.classList.contains('dark');
  const labels = data.mealStats?.map((d) => {
    const dt = new Date(d._id);
    return dt.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric' });
  }) || [];

  const calData = data.mealStats?.map((d) => d.totalCalories) || [];
  const waterData = data.waterStats?.map((d) => Math.round(d.totalWater / 100) / 10) || [];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <div className="card p-5">
        <p className="section-title">Calories this week</p>
        <div style={{ height: 180 }}>
          <Bar
            data={{
              labels,
              datasets: [{
                data: calData,
                backgroundColor: '#16a34a',
                borderRadius: 6,
                hoverBackgroundColor: '#15803d',
              }],
            }}
            options={chartOptions(isDark)}
          />
        </div>
      </div>

      <div className="card p-5">
        <p className="section-title">Water intake (L/day)</p>
        <div style={{ height: 180 }}>
          <Line
            data={{
              labels,
              datasets: [{
                data: waterData,
                borderColor: '#0ea5e9',
                backgroundColor: 'rgba(14,165,233,0.1)',
                tension: 0.4,
                fill: true,
                pointRadius: 4,
                pointBackgroundColor: '#0ea5e9',
              }],
            }}
            options={chartOptions(isDark)}
          />
        </div>
      </div>
    </div>
  );
}
