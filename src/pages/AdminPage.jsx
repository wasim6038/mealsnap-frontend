import { useState, useEffect } from 'react';
import { adminAPI } from '@/api/services';
import { StatCard, SkeletonCard, Badge } from '@/components/common/UI';
import { Bar } from 'react-chartjs-2';
import toast from 'react-hot-toast';
import {
  RiUserLine, RiShieldLine, RiDeleteBinLine, RiLockLine,
  RiLockUnlockLine, RiSearchLine, RiVipCrownLine, RiBarChartLine,
} from 'react-icons/ri';

export default function AdminPage() {
  const [stats,   setStats]   = useState(null);
  const [users,   setUsers]   = useState([]);
  const [total,   setTotal]   = useState(0);
  const [loading, setLoading] = useState(true);
  const [search,  setSearch]  = useState('');
  const [page,    setPage]    = useState(1);
  const [tab,     setTab]     = useState('overview');
  const LIMIT = 15;

  const loadStats = async () => {
    const res = await adminAPI.getStats();
    setStats(res.data.stats);
  };

  const loadUsers = async () => {
    const res = await adminAPI.getUsers({ page, limit: LIMIT, search });
    setUsers(res.data.users);
    setTotal(res.data.total);
  };

  useEffect(() => {
    setLoading(true);
    Promise.all([loadStats(), loadUsers()]).finally(() => setLoading(false));
  }, [page, search]);

  const handleBlock = async (id, isBlocked) => {
    await adminAPI.toggleBlock(id);
    toast.success(isBlocked ? 'User unblocked' : 'User blocked');
    loadUsers();
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this user permanently?')) return;
    await adminAPI.deleteUser(id);
    toast.success('User deleted');
    loadUsers();
  };

  const handlePlan = async (id, plan) => {
    await adminAPI.updatePlan(id, plan);
    toast.success(`Plan updated to ${plan}`);
    loadUsers();
  };

  const isDark = document.documentElement.classList.contains('dark');
  const signupLabels  = stats?.signupTrend?.map((d) => d._id) || [];
  const signupCounts  = stats?.signupTrend?.map((d) => d.count) || [];

  return (
    <div className="page-container space-y-5">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-2xl bg-purple-600 flex items-center justify-center">
          <RiShieldLine className="text-white text-xl" />
        </div>
        <div>
          <h1 className="page-title">Admin Panel</h1>
          <p className="text-sm text-gray-400">Manage users and monitor platform activity</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2">
        {['overview', 'users'].map((t) => (
          <button key={t} onClick={() => setTab(t)}
            className={`px-4 py-2 rounded-xl text-sm font-medium capitalize transition-colors ${
              tab === t ? 'bg-purple-600 text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400'
            }`}>{t}</button>
        ))}
      </div>

      {/* Overview tab */}
      {tab === 'overview' && (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {loading ? Array(6).fill(0).map((_, i) => <SkeletonCard key={i} />) : (
              <>
                <StatCard label="Total users"    value={stats?.totalUsers    || 0} color="#6366f1" icon={RiUserLine} />
                <StatCard label="Premium users"  value={stats?.premiumUsers  || 0} color="#f59e0b" icon={RiVipCrownLine} />
                <StatCard label="Free users"     value={stats?.freeUsers     || 0} color="#0ea5e9" icon={RiUserLine} />
                <StatCard label="Active (7d)"    value={stats?.activeUsers   || 0} color="#16a34a" icon={RiBarChartLine} />
                <StatCard label="New this month" value={stats?.newUsersMonth || 0} color="#f97316" icon={RiUserLine} />
                <StatCard label="Total meals"    value={stats?.totalMeals   || 0} color="#a855f7" icon={RiBarChartLine} />
              </>
            )}
          </div>

          {/* Signup trend chart */}
          {stats?.signupTrend?.length > 0 && (
            <div className="card p-5">
              <p className="section-title">User signups — last 7 days</p>
              <div style={{ height: 200 }}>
                <Bar data={{
                  labels: signupLabels,
                  datasets: [{ data: signupCounts, backgroundColor: '#6366f1', borderRadius: 6 }],
                }} options={{
                  responsive: true, maintainAspectRatio: false,
                  plugins: { legend: { display: false } },
                  scales: {
                    x: { grid: { display: false }, ticks: { color: '#9ca3af', font: { size: 11 } } },
                    y: { grid: { color: isDark ? '#1f2937' : '#f3f4f6' }, ticks: { color: '#9ca3af', font: { size: 11 }, stepSize: 1 } },
                  },
                }} />
              </div>
            </div>
          )}
        </>
      )}

      {/* Users tab */}
      {tab === 'users' && (
        <>
          {/* Search */}
          <div className="relative max-w-sm">
            <RiSearchLine className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input placeholder="Search by name or email..." value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              className="form-input pl-9" />
          </div>

          <div className="card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100 dark:border-gray-800">
                    {['User', 'Email', 'Plan', 'Status', 'Joined', 'Actions'].map((h) => (
                      <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    Array(5).fill(0).map((_, i) => (
                      <tr key={i} className="border-b border-gray-50 dark:border-gray-800">
                        {Array(6).fill(0).map((_, j) => (
                          <td key={j} className="px-4 py-3"><div className="skeleton h-4 rounded" /></td>
                        ))}
                      </tr>
                    ))
                  ) : users.map((u) => (
                    <tr key={u._id} className="border-b border-gray-50 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/40 transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-full bg-primary-600 flex items-center justify-center text-white text-xs font-semibold flex-shrink-0">
                            {u.name?.[0]?.toUpperCase()}
                          </div>
                          <span className="font-medium text-gray-800 dark:text-gray-200 whitespace-nowrap">{u.name}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-gray-500 dark:text-gray-400 text-xs">{u.email}</td>
                      <td className="px-4 py-3">
                        <select value={u.plan} onChange={(e) => handlePlan(u._id, e.target.value)}
                          className="text-xs border border-gray-200 dark:border-gray-700 rounded-lg px-2 py-1 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 focus:outline-none cursor-pointer">
                          <option value="free">Free</option>
                          <option value="premium">Premium</option>
                        </select>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`badge ${u.isBlocked ? 'badge-red' : 'badge-green'}`}>
                          {u.isBlocked ? 'Blocked' : 'Active'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-xs text-gray-400 whitespace-nowrap">
                        {new Date(u.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: '2-digit' })}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1">
                          <button onClick={() => handleBlock(u._id, u.isBlocked)}
                            className="icon-btn text-xs" title={u.isBlocked ? 'Unblock' : 'Block'}>
                            {u.isBlocked ? <RiLockUnlockLine className="text-primary-500" /> : <RiLockLine className="text-orange-500" />}
                          </button>
                          <button onClick={() => handleDelete(u._id)} className="icon-btn" title="Delete">
                            <RiDeleteBinLine className="text-red-400" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {total > LIMIT && (
              <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100 dark:border-gray-800">
                <p className="text-xs text-gray-400">Showing {(page - 1) * LIMIT + 1}–{Math.min(page * LIMIT, total)} of {total}</p>
                <div className="flex gap-2">
                  <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1} className="btn-secondary text-xs py-1.5 px-3">Prev</button>
                  <button onClick={() => setPage((p) => p + 1)} disabled={page * LIMIT >= total} className="btn-secondary text-xs py-1.5 px-3">Next</button>
                </div>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
