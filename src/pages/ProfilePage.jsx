import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { updateProfile } from '@/redux/slices/authSlice';
import { ProgressRing, StatCard } from '@/components/common/UI';
import toast from 'react-hot-toast';
import { RiEditLine, RiCheckLine, RiCloseLine, RiTrophyLine, RiFireLine, RiStarLine } from 'react-icons/ri';

const BADGE_MAP = { '🏆': 'First meal logged', '🔥': '7-day streak', '💪': '30 meals logged', '⭐': 'Goal achieved' };

export default function ProfilePage() {
  const dispatch   = useDispatch();
  const { user, loading } = useSelector((s) => s.auth);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({
    name: user?.name || '', gender: user?.gender || 'male',
    age: user?.age || '', height: user?.height || '', weight: user?.weight || '',
    targetWeight: user?.targetWeight || '',
    goal: user?.goal || 'maintain', activityLevel: user?.activityLevel || 'moderately_active',
    dietType: user?.dietType || 'standard',
  });

  const set = (k, v) => setForm((p) => ({ ...p, [k]: v }));

  const handleSave = async () => {
    const res = await dispatch(updateProfile(form));
    if (updateProfile.fulfilled.match(res)) {
      toast.success('Profile updated!');
      setEditing(false);
    } else {
      toast.error('Failed to update profile');
    }
  };

  const bmiCategory = (bmi) => {
    if (!bmi) return { label: 'Unknown', color: '#9ca3af' };
    if (bmi < 18.5) return { label: 'Underweight', color: '#3b82f6' };
    if (bmi < 25)   return { label: 'Normal',      color: '#16a34a' };
    if (bmi < 30)   return { label: 'Overweight',  color: '#f97316' };
    return               { label: 'Obese',         color: '#ef4444' };
  };

  const bmi  = user?.bmi;
  const bmiv = bmiCategory(bmi);
  const bmiPct = bmi ? Math.min(100, ((bmi - 15) / (40 - 15)) * 100) : 0;

  return (
    <div className="page-container space-y-5">
      {/* Header card */}
      <div className="card p-5 flex flex-col sm:flex-row items-start sm:items-center gap-4">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center text-white text-2xl font-bold flex-shrink-0">
          {user?.name?.[0]?.toUpperCase()}
        </div>
        <div className="flex-1 min-w-0">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">{user?.name}</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">{user?.email}</p>
          <div className="flex items-center gap-2 mt-1.5">
            <span className={`badge ${user?.plan === 'premium' ? 'badge-green' : 'badge-blue'} capitalize`}>{user?.plan || 'free'}</span>
            <span className="badge badge-orange">Level {user?.level || 1}</span>
            <span className="badge badge-purple">{user?.totalPoints || 0} pts</span>
          </div>
        </div>
        <button onClick={() => editing ? handleSave() : setEditing(true)} disabled={loading}
          className={editing ? 'btn-primary' : 'btn-secondary'}>
          {editing ? (<><RiCheckLine /> Save changes</>) : (<><RiEditLine /> Edit profile</>)}
        </button>
        {editing && (
          <button onClick={() => setEditing(false)} className="btn-secondary"><RiCloseLine /> Cancel</button>
        )}
      </div>

      {/* Streak + badges */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <StatCard label="Current streak" icon={RiFireLine} value={`${user?.currentStreak || 0} days`} sub={`Best: ${user?.longestStreak || 0} days`} color="#f97316" />
        <StatCard label="Total points"   icon={RiTrophyLine} value={user?.totalPoints || 0} sub={`Level ${user?.level || 1}`} color="#a855f7" />
        <div className="card p-4">
          <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2">Badges earned</p>
          <div className="flex flex-wrap gap-2">
            {user?.badges?.length > 0
              ? user.badges.map((b, i) => (
                  <span key={i} title={BADGE_MAP[b] || b} className="text-2xl cursor-default" role="img" aria-label={BADGE_MAP[b]}>{b}</span>
                ))
              : <p className="text-xs text-gray-400">Log meals to earn badges!</p>
            }
          </div>
        </div>
      </div>

      {/* BMI Card */}
      <div className="card p-5 flex flex-col sm:flex-row items-center gap-6">
        <ProgressRing pct={bmiPct} size={110} stroke={9} color={bmiv.color}>
          <p className="text-xl font-bold text-gray-900 dark:text-white">{bmi || '—'}</p>
          <p className="text-xs" style={{ color: bmiv.color }}>{bmiv.label}</p>
        </ProgressRing>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 flex-1">
          {[
            { label: 'BMR',  value: user?.bmr  ? `${user.bmr} kcal`  : '—', tip: 'Basal metabolic rate' },
            { label: 'TDEE', value: user?.tdee  ? `${user.tdee} kcal` : '—', tip: 'Total daily energy expenditure' },
            { label: 'Cal target', value: user?.dailyCalorieTarget ? `${user.dailyCalorieTarget} kcal` : '—', tip: 'Daily calorie goal' },
            { label: 'Protein goal', value: `${user?.dailyProteinTarget || 150}g`, tip: 'Daily protein target' },
            { label: 'Carbs goal',   value: `${user?.dailyCarbsTarget  || 250}g`, tip: 'Daily carbs target' },
            { label: 'Fat goal',     value: `${user?.dailyFatTarget    || 65}g`,  tip: 'Daily fat target' },
          ].map(({ label, value, tip }) => (
            <div key={label} title={tip}>
              <p className="text-xs text-gray-400 dark:text-gray-500">{label}</p>
              <p className="text-sm font-semibold text-gray-800 dark:text-gray-200 mt-0.5">{value}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Edit form */}
      {editing && (
        <div className="card p-5 space-y-4">
          <p className="section-title">Edit profile</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="form-label">Full name</label>
              <input value={form.name} onChange={(e) => set('name', e.target.value)} className="form-input" />
            </div>
            <div>
              <label className="form-label">Gender</label>
              <select value={form.gender} onChange={(e) => set('gender', e.target.value)} className="form-select">
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div>
              <label className="form-label">Age</label>
              <input type="number" value={form.age} onChange={(e) => set('age', e.target.value)} className="form-input" placeholder="28" />
            </div>
            <div>
              <label className="form-label">Height (cm)</label>
              <input type="number" value={form.height} onChange={(e) => set('height', e.target.value)} className="form-input" placeholder="175" />
            </div>
            <div>
              <label className="form-label">Current weight (kg)</label>
              <input type="number" value={form.weight} onChange={(e) => set('weight', e.target.value)} className="form-input" placeholder="70" />
            </div>
            <div>
              <label className="form-label">Target weight (kg)</label>
              <input type="number" value={form.targetWeight} onChange={(e) => set('targetWeight', e.target.value)} className="form-input" placeholder="65" />
            </div>
            <div>
              <label className="form-label">Goal</label>
              <select value={form.goal} onChange={(e) => set('goal', e.target.value)} className="form-select">
                <option value="weight_loss">Weight loss</option>
                <option value="maintain">Maintain weight</option>
                <option value="weight_gain">Weight gain</option>
              </select>
            </div>
            <div>
              <label className="form-label">Activity level</label>
              <select value={form.activityLevel} onChange={(e) => set('activityLevel', e.target.value)} className="form-select">
                <option value="sedentary">Sedentary</option>
                <option value="lightly_active">Lightly active</option>
                <option value="moderately_active">Moderately active</option>
                <option value="very_active">Very active</option>
                <option value="extra_active">Extra active</option>
              </select>
            </div>
            <div>
              <label className="form-label">Diet type</label>
              <select value={form.dietType} onChange={(e) => set('dietType', e.target.value)} className="form-select">
                <option value="standard">Standard</option>
                <option value="vegetarian">Vegetarian</option>
                <option value="vegan">Vegan</option>
                <option value="keto">Keto</option>
                <option value="indian">Indian</option>
              </select>
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <button onClick={() => setEditing(false)} className="btn-secondary">Cancel</button>
            <button onClick={handleSave} disabled={loading} className="btn-primary">
              {loading ? 'Saving...' : '✓ Save changes'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
