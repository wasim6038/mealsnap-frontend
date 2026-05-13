import { Outlet, Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { RiLeafLine } from 'react-icons/ri';

export default function AuthLayout() {
  const { isAuthenticated } = useSelector((s) => s.auth);
  if (isAuthenticated) return <Navigate to="/dashboard" replace />;

  return (
    <div className="min-h-screen flex bg-gradient-to-br from-primary-50 via-white to-blue-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950">
      {/* Left panel - branding */}
      <div className="hidden lg:flex flex-col justify-between w-[420px] bg-primary-600 text-white p-10 flex-shrink-0">
        <div>
          <div className="flex items-center gap-2 mb-12">
            <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center">
              <RiLeafLine className="text-white text-xl" />
            </div>
            <span className="text-xl font-semibold">MealSnap</span>
          </div>
          <h2 className="text-3xl font-bold leading-tight mb-4">
            Your AI-powered<br />nutrition companion
          </h2>
          <p className="text-primary-100 text-base leading-relaxed">
            Track meals, macros, water & weight. Get personalized AI diet plans and achieve your health goals faster.
          </p>
        </div>

        <div className="space-y-4">
          {[
            { emoji: '🥗', text: 'Smart meal logging with food search' },
            { emoji: '🤖', text: 'AI-generated personalized diet plans' },
            { emoji: '📊', text: 'Beautiful analytics & progress charts' },
            { emoji: '🔥', text: 'Streak system & gamification rewards' },
          ].map(({ emoji, text }) => (
            <div key={text} className="flex items-center gap-3">
              <span className="text-xl">{emoji}</span>
              <span className="text-primary-100 text-sm">{text}</span>
            </div>
          ))}
        </div>

        <p className="text-xs text-primary-200">© 2025 MealSnap. Built with ❤️ for your health.</p>
      </div>

      {/* Right panel - form */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-md">
          <div className="flex items-center gap-2 mb-8 lg:hidden">
            <div className="w-8 h-8 rounded-xl bg-primary-600 flex items-center justify-center">
              <RiLeafLine className="text-white text-lg" />
            </div>
            <span className="text-lg font-semibold text-gray-900 dark:text-white">MealSnap</span>
          </div>
          <Outlet />
        </div>
      </div>
    </div>
  );
}
