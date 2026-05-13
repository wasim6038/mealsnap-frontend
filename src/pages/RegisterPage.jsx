import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { registerUser } from '@/redux/slices/authSlice';
import toast from 'react-hot-toast';
import { RiEyeLine, RiEyeOffLine, RiMailLine, RiLockLine, RiUserLine } from 'react-icons/ri';

const STEPS = ['Account', 'Body Stats', 'Goals'];

export default function RegisterPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading } = useSelector((s) => s.auth);
  const [step, setStep] = useState(0);
  const [show, setShow] = useState(false);
  const [form, setForm] = useState({
    name: '', email: '', password: '',
    gender: 'male', age: '', height: '', weight: '',
    goal: 'maintain', activityLevel: 'moderately_active',
  });

  const set = (k, v) => setForm((p) => ({ ...p, [k]: v }));

  const handleSubmit = async () => {
    const res = await dispatch(registerUser(form));
    if (registerUser.fulfilled.match(res)) {
      toast.success('Account created! Welcome to MealSnap 🎉');
      navigate('/dashboard');
    } else {
      toast.error(res.payload || 'Registration failed');
    }
  };

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">Create your account</h2>
      <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">Start your health journey with MealSnap</p>

      {/* Step indicators */}
      <div className="flex items-center gap-2 mb-7">
        {STEPS.map((s, i) => (
          <div key={s} className="flex items-center gap-2">
            <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold transition-colors ${
              i <= step ? 'bg-primary-600 text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-400'
            }`}>{i + 1}</div>
            <span className={`text-xs font-medium hidden sm:inline ${i === step ? 'text-primary-600' : 'text-gray-400'}`}>{s}</span>
            {i < STEPS.length - 1 && <div className={`h-px w-6 ${i < step ? 'bg-primary-400' : 'bg-gray-200 dark:bg-gray-700'}`} />}
          </div>
        ))}
      </div>

      {/* Step 0: Account */}
      {step === 0 && (
        <div className="space-y-4">
          <div>
            <label className="form-label">Full name</label>
            <div className="relative">
              <RiUserLine className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input type="text" required placeholder="Arjun Raj" value={form.name}
                onChange={(e) => set('name', e.target.value)} className="form-input pl-9" />
            </div>
          </div>
          <div>
            <label className="form-label">Email</label>
            <div className="relative">
              <RiMailLine className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input type="email" required placeholder="you@email.com" value={form.email}
                onChange={(e) => set('email', e.target.value)} className="form-input pl-9" />
            </div>
          </div>
          <div>
            <label className="form-label">Password</label>
            <div className="relative">
              <RiLockLine className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input type={show ? 'text' : 'password'} required placeholder="Min. 6 characters" value={form.password}
                onChange={(e) => set('password', e.target.value)} className="form-input pl-9 pr-10" />
              <button type="button" onClick={() => setShow(!show)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                {show ? <RiEyeOffLine /> : <RiEyeLine />}
              </button>
            </div>
          </div>
          <button onClick={() => { if (!form.name || !form.email || !form.password) { toast.error('Fill all fields'); return; } setStep(1); }}
            className="btn-primary w-full justify-center py-2.5">Continue</button>
        </div>
      )}

      {/* Step 1: Body Stats */}
      {step === 1 && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
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
              <input type="number" min="10" max="120" placeholder="28" value={form.age}
                onChange={(e) => set('age', e.target.value)} className="form-input" />
            </div>
            <div>
              <label className="form-label">Height (cm)</label>
              <input type="number" min="50" max="300" placeholder="175" value={form.height}
                onChange={(e) => set('height', e.target.value)} className="form-input" />
            </div>
            <div>
              <label className="form-label">Weight (kg)</label>
              <input type="number" min="20" max="500" placeholder="70" value={form.weight}
                onChange={(e) => set('weight', e.target.value)} className="form-input" />
            </div>
          </div>
          <div className="flex gap-2">
            <button onClick={() => setStep(0)} className="btn-secondary flex-1 justify-center">Back</button>
            <button onClick={() => setStep(2)} className="btn-primary flex-1 justify-center">Continue</button>
          </div>
        </div>
      )}

      {/* Step 2: Goals */}
      {step === 2 && (
        <div className="space-y-4">
          <div>
            <label className="form-label">Your goal</label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { value: 'weight_loss', label: 'Lose weight', emoji: '🔥' },
                { value: 'maintain',    label: 'Maintain',    emoji: '⚖️' },
                { value: 'weight_gain', label: 'Gain weight', emoji: '💪' },
              ].map(({ value, label, emoji }) => (
                <button key={value} onClick={() => set('goal', value)}
                  className={`flex flex-col items-center py-3 rounded-xl border text-sm font-medium transition-all ${
                    form.goal === value
                      ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-400'
                      : 'border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400'
                  }`}>
                  <span className="text-2xl mb-1">{emoji}</span>{label}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="form-label">Activity level</label>
            <select value={form.activityLevel} onChange={(e) => set('activityLevel', e.target.value)} className="form-select">
              <option value="sedentary">Sedentary (little/no exercise)</option>
              <option value="lightly_active">Lightly active (1–3 days/week)</option>
              <option value="moderately_active">Moderately active (3–5 days/week)</option>
              <option value="very_active">Very active (6–7 days/week)</option>
              <option value="extra_active">Extra active (physical job)</option>
            </select>
          </div>
          <div className="flex gap-2">
            <button onClick={() => setStep(1)} className="btn-secondary flex-1 justify-center">Back</button>
            <button onClick={handleSubmit} disabled={loading} className="btn-primary flex-1 justify-center py-2.5">
              {loading ? 'Creating account...' : '🎉 Create Account'}
            </button>
          </div>
        </div>
      )}

      <p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-6">
        Already have an account?{' '}
        <Link to="/login" className="text-primary-600 font-medium hover:underline">Sign in</Link>
      </p>
    </div>
  );
}
