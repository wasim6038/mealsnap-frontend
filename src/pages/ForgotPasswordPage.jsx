import { useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { forgotPassword, resetPassword } from '@/redux/slices/authSlice';
import toast from 'react-hot-toast';
import { RiMailLine, RiLockLine, RiArrowLeftLine, RiEyeLine, RiEyeOffLine } from 'react-icons/ri';

export function ForgotPasswordPage() {
  const dispatch = useDispatch();
  const [email, setEmail]     = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent]       = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) return;
    setLoading(true);
    const res = await dispatch(forgotPassword(email));
    setLoading(false);
    if (forgotPassword.fulfilled.match(res)) {
      setSent(true);
      toast.success('Reset link sent if email exists');
    } else {
      toast.error('Something went wrong');
    }
  };

  if (sent) {
    return (
      <div className="text-center">
        <div className="w-16 h-16 rounded-2xl bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center mx-auto mb-4">
          <span className="text-3xl">📧</span>
        </div>
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Check your inbox</h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-6 max-w-xs mx-auto">
          If <strong>{email}</strong> is registered, you'll receive a password reset link shortly.
        </p>
        <Link to="/login" className="btn-primary inline-flex"><RiArrowLeftLine /> Back to login</Link>
      </div>
    );
  }

  return (
    <div>
      <Link to="/login" className="inline-flex items-center gap-1.5 text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 mb-6 transition-colors">
        <RiArrowLeftLine /> Back to login
      </Link>
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">Forgot password?</h2>
      <p className="text-sm text-gray-500 dark:text-gray-400 mb-8">Enter your email and we'll send a reset link.</p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="form-label">Email address</label>
          <div className="relative">
            <RiMailLine className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input type="email" required placeholder="you@email.com" value={email}
              onChange={(e) => setEmail(e.target.value)} className="form-input pl-9" />
          </div>
        </div>
        <button type="submit" disabled={loading} className="btn-primary w-full justify-center py-2.5">
          {loading ? 'Sending...' : 'Send reset link'}
        </button>
      </form>
    </div>
  );
}

export function ResetPasswordPage() {
  const { token }    = useParams();
  const dispatch     = useDispatch();
  const navigate     = useNavigate();
  const [password, setPassword] = useState('');
  const [confirm, setConfirm]   = useState('');
  const [show, setShow]         = useState(false);
  const [loading, setLoading]   = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirm) { toast.error('Passwords do not match'); return; }
    if (password.length < 6)  { toast.error('Password must be at least 6 characters'); return; }
    setLoading(true);
    const res = await dispatch(resetPassword({ token, password }));
    setLoading(false);
    if (resetPassword.fulfilled.match(res)) {
      toast.success('Password reset successful!');
      navigate('/dashboard');
    } else {
      toast.error(res.payload || 'Reset failed. Link may have expired.');
    }
  };

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">Reset password</h2>
      <p className="text-sm text-gray-500 dark:text-gray-400 mb-8">Enter your new password below.</p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="form-label">New password</label>
          <div className="relative">
            <RiLockLine className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input type={show ? 'text' : 'password'} required placeholder="Min. 6 characters"
              value={password} onChange={(e) => setPassword(e.target.value)} className="form-input pl-9 pr-10" />
            <button type="button" onClick={() => setShow(!show)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
              {show ? <RiEyeOffLine /> : <RiEyeLine />}
            </button>
          </div>
        </div>
        <div>
          <label className="form-label">Confirm new password</label>
          <div className="relative">
            <RiLockLine className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input type={show ? 'text' : 'password'} required placeholder="Repeat password"
              value={confirm} onChange={(e) => setConfirm(e.target.value)} className="form-input pl-9" />
          </div>
        </div>
        <button type="submit" disabled={loading} className="btn-primary w-full justify-center py-2.5">
          {loading ? 'Resetting...' : 'Reset password'}
        </button>
      </form>
    </div>
  );
}

export default ForgotPasswordPage;
