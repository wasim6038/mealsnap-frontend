import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { toggleDarkMode } from '@/redux/slices/uiSlice';
import { updateProfile } from '@/redux/slices/authSlice';
import toast from 'react-hot-toast';
import api from '@/api/axios';
import {
  RiMoonLine, RiSunLine, RiBellLine, RiLockLine,
  RiDeleteBinLine, RiSaveLine, RiDropLine,
} from 'react-icons/ri';

export default function SettingsPage() {
  const dispatch    = useDispatch();
  const { user }    = useSelector((s) => s.auth);
  const { darkMode } = useSelector((s) => s.ui);

  const [notifications, setNotifications] = useState({
    mealReminders:  user?.notifications?.mealReminders  ?? true,
    waterReminders: user?.notifications?.waterReminders ?? true,
    weeklyReport:   user?.notifications?.weeklyReport   ?? true,
  });

  const [waterGoal, setWaterGoal] = useState(user?.dailyWaterTarget || 2500);
  const [calGoal,   setCalGoal]   = useState(user?.dailyCalorieTarget || 2000);
  const [passwords, setPasswords] = useState({ current: '', newPass: '', confirm: '' });
  const [saving,    setSaving]    = useState(false);

  const saveNotifications = async () => {
    setSaving(true);
    await dispatch(updateProfile({ notifications }));
    toast.success('Notification settings saved');
    setSaving(false);
  };

  const saveGoals = async () => {
    setSaving(true);
    await dispatch(updateProfile({ dailyWaterTarget: waterGoal, dailyCalorieTarget: calGoal }));
    toast.success('Goals updated');
    setSaving(false);
  };

  const changePassword = async () => {
    if (passwords.newPass !== passwords.confirm) { toast.error('Passwords do not match'); return; }
    if (passwords.newPass.length < 6) { toast.error('Password must be at least 6 characters'); return; }
    setSaving(true);
    try {
      await api.put('/auth/update-password', { currentPassword: passwords.current, newPassword: passwords.newPass });
      toast.success('Password changed successfully');
      setPasswords({ current: '', newPass: '', confirm: '' });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to change password');
    } finally {
      setSaving(false);
    }
  };

  const Section = ({ title, icon: Icon, children }) => (
    <div className="card p-5 space-y-4">
      <div className="flex items-center gap-2 pb-1 border-b border-gray-100 dark:border-gray-800">
        <Icon className="text-primary-600 text-lg" />
        <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-200">{title}</h3>
      </div>
      {children}
    </div>
  );

  const Toggle = ({ label, desc, checked, onChange }) => (
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm font-medium text-gray-700 dark:text-gray-300">{label}</p>
        {desc && <p className="text-xs text-gray-400 mt-0.5">{desc}</p>}
      </div>
      <button
        onClick={() => onChange(!checked)}
        className={`relative w-10 h-5 rounded-full transition-colors flex-shrink-0 ${checked ? 'bg-primary-600' : 'bg-gray-200 dark:bg-gray-700'}`}
      >
        <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${checked ? 'translate-x-5' : 'translate-x-0.5'}`} />
      </button>
    </div>
  );

  return (
    <div className="page-container space-y-4 max-w-2xl">
      <h1 className="page-title">Settings</h1>

      {/* Appearance */}
      <Section title="Appearance" icon={RiSunLine}>
        <Toggle
          label="Dark mode"
          desc="Switch between light and dark theme"
          checked={darkMode}
          onChange={() => dispatch(toggleDarkMode())}
        />
      </Section>

      {/* Notifications */}
      <Section title="Notifications" icon={RiBellLine}>
        <Toggle label="Meal reminders" desc="Get reminded to log your meals"
          checked={notifications.mealReminders} onChange={(v) => setNotifications((p) => ({ ...p, mealReminders: v }))} />
        <Toggle label="Water reminders" desc="Hydration reminders throughout the day"
          checked={notifications.waterReminders} onChange={(v) => setNotifications((p) => ({ ...p, waterReminders: v }))} />
        <Toggle label="Weekly report" desc="Receive a weekly summary email"
          checked={notifications.weeklyReport} onChange={(v) => setNotifications((p) => ({ ...p, weeklyReport: v }))} />
        <button onClick={saveNotifications} disabled={saving} className="btn-primary">
          <RiSaveLine /> Save preferences
        </button>
      </Section>

      {/* Daily Goals */}
      <Section title="Daily Goals" icon={RiDropLine}>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="form-label">Daily calorie target (kcal)</label>
            <input type="number" value={calGoal} onChange={(e) => setCalGoal(Number(e.target.value))}
              className="form-input" min="800" max="6000" />
          </div>
          <div>
            <label className="form-label">Daily water target (ml)</label>
            <input type="number" value={waterGoal} onChange={(e) => setWaterGoal(Number(e.target.value))}
              className="form-input" min="500" max="8000" />
          </div>
        </div>
        <button onClick={saveGoals} disabled={saving} className="btn-primary">
          <RiSaveLine /> Save goals
        </button>
      </Section>

      {/* Change Password */}
      <Section title="Change Password" icon={RiLockLine}>
        <div className="space-y-3">
          <div>
            <label className="form-label">Current password</label>
            <input type="password" value={passwords.current} onChange={(e) => setPasswords((p) => ({ ...p, current: e.target.value }))}
              className="form-input" placeholder="••••••••" />
          </div>
          <div>
            <label className="form-label">New password</label>
            <input type="password" value={passwords.newPass} onChange={(e) => setPasswords((p) => ({ ...p, newPass: e.target.value }))}
              className="form-input" placeholder="Min. 6 characters" />
          </div>
          <div>
            <label className="form-label">Confirm new password</label>
            <input type="password" value={passwords.confirm} onChange={(e) => setPasswords((p) => ({ ...p, confirm: e.target.value }))}
              className="form-input" placeholder="Repeat new password" />
          </div>
        </div>
        <button onClick={changePassword} disabled={saving || !passwords.current || !passwords.newPass} className="btn-primary">
          <RiLockLine /> Update password
        </button>
      </Section>

      {/* Danger zone */}
      <Section title="Danger Zone" icon={RiDeleteBinLine}>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Deleting your account is permanent and cannot be undone. All your data — meals, weight logs, and water logs — will be erased.
        </p>
        <button className="btn-danger"><RiDeleteBinLine /> Delete my account</button>
      </Section>
    </div>
  );
}
