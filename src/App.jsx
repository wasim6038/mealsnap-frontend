import { useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchCurrentUser } from '@/redux/slices/authSlice';
import { useTheme } from '@/hooks';

import AppLayout    from '@/components/layout/AppLayout';
import AuthLayout   from '@/components/layout/AuthLayout';
import PrivateRoute from '@/components/common/PrivateRoute';
import AdminRoute   from '@/components/common/AdminRoute';

// Pages
import LoginPage         from '@/pages/LoginPage';
import RegisterPage      from '@/pages/RegisterPage';
import ForgotPasswordPage from '@/pages/ForgotPasswordPage';
import ResetPasswordPage  from '@/pages/ResetPasswordPage';
import DashboardPage     from '@/pages/DashboardPage';
import MealsPage         from '@/pages/MealsPage';
import WaterPage         from '@/pages/WaterPage';
import WeightPage        from '@/pages/WeightPage';
import AnalyticsPage     from '@/pages/AnalyticsPage';
import AIPlanPage        from '@/pages/AIPlanPage';
import ProfilePage       from '@/pages/ProfilePage';
import SettingsPage      from '@/pages/SettingsPage';
import AdminPage         from '@/pages/AdminPage';
import NotFoundPage      from '@/pages/NotFoundPage';
import SplashScreen      from '@/components/common/SplashScreen';

export default function App() {
  const dispatch = useDispatch();
  const { initializing } = useSelector((s) => s.auth);
  useTheme();

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (token) dispatch(fetchCurrentUser());
    else { /* mark done */ dispatch({ type: 'auth/me/rejected' }); }
  }, [dispatch]);

  if (initializing) return <SplashScreen />;

  return (
    <Routes>
      {/* Public auth routes */}
      <Route element={<AuthLayout />}>
        <Route path="/login"          element={<LoginPage />} />
        <Route path="/register"       element={<RegisterPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password/:token" element={<ResetPasswordPage />} />
      </Route>

      {/* Protected app routes */}
      <Route element={<PrivateRoute><AppLayout /></PrivateRoute>}>
        <Route index                    element={<Navigate to="/dashboard" replace />} />
        <Route path="/dashboard"        element={<DashboardPage />} />
        <Route path="/meals"            element={<MealsPage />} />
        <Route path="/water"            element={<WaterPage />} />
        <Route path="/weight"           element={<WeightPage />} />
        <Route path="/analytics"        element={<AnalyticsPage />} />
        <Route path="/ai-plan"          element={<AIPlanPage />} />
        <Route path="/profile"          element={<ProfilePage />} />
        <Route path="/settings"         element={<SettingsPage />} />

        {/* Admin only */}
        <Route path="/admin" element={<AdminRoute><AdminPage /></AdminRoute>} />
      </Route>

      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}
