import { useDispatch, useSelector } from 'react-redux';
import { toggleDarkMode, toggleSidebar, openAddMealModal, setSelectedDate } from '@/redux/slices/uiSlice';
import {
  RiMenu2Line, RiSunLine, RiMoonLine, RiAddLine,
  RiNotification3Line, RiCalendarLine,
} from 'react-icons/ri';
import { Link, useLocation } from 'react-router-dom';

const pageTitles = {
  '/dashboard': 'Dashboard',
  '/meals':     'Meal Log',
  '/water':     'Water Tracker',
  '/weight':    'Weight Tracker',
  '/analytics': 'Analytics',
  '/ai-plan':   'AI Diet Plan',
  '/profile':   'My Profile',
  '/settings':  'Settings',
  '/admin':     'Admin Panel',
};

export default function Topbar() {
  const dispatch = useDispatch();
  const location = useLocation();
  const { darkMode, selectedDate } = useSelector((s) => s.ui);
  const { user } = useSelector((s) => s.auth);

  const title = pageTitles[location.pathname] || 'MealSnap';
  const today = new Date().toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' });

  return (
    <header className="h-14 flex items-center px-4 gap-3 bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800 flex-shrink-0">
      <button onClick={() => dispatch(toggleSidebar())} className="icon-btn">
        <RiMenu2Line className="text-lg" />
      </button>

      <h1 className="text-base font-semibold text-gray-900 dark:text-white flex-1">{title}</h1>

      {/* Date selector */}
      <div className="hidden sm:flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-800 px-3 py-1.5 rounded-xl border border-gray-100 dark:border-gray-700">
        <RiCalendarLine />
        <input
          type="date"
          value={selectedDate}
          onChange={(e) => dispatch(setSelectedDate(e.target.value))}
          className="bg-transparent text-xs text-gray-600 dark:text-gray-300 focus:outline-none cursor-pointer"
        />
      </div>

      {/* Dark mode */}
      <button onClick={() => dispatch(toggleDarkMode())} className="icon-btn">
        {darkMode ? <RiSunLine className="text-yellow-400 text-lg" /> : <RiMoonLine className="text-lg" />}
      </button>

      {/* Notifications placeholder */}
      <button className="icon-btn relative">
        <RiNotification3Line className="text-lg" />
        <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-primary-500" />
      </button>

      {/* Add meal */}
      <button
        onClick={() => dispatch(openAddMealModal())}
        className="btn-primary hidden sm:inline-flex"
      >
        <RiAddLine className="text-base" />
        Log Meal
      </button>

      {/* Avatar */}
      <div className="w-8 h-8 rounded-full bg-primary-600 flex items-center justify-center text-white text-xs font-semibold flex-shrink-0">
        <Link to="/profile">{user?.name?.[0]?.toUpperCase() || 'U'}</Link>
      </div>
    </header>
  );
}
