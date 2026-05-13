import { NavLink, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import { logoutUser } from '@/redux/slices/authSlice';
import {
  RiDashboardLine, RiBowlLine, RiDropLine, RiScalesLine,
  RiBarChartLine, RiRobotLine, RiUserLine, RiSettings3Line,
  RiShieldLine, RiLogoutBoxLine, RiLeafLine,
} from 'react-icons/ri';
import toast from 'react-hot-toast';

const navItems = [
  { label: 'Dashboard',   icon: RiDashboardLine, path: '/dashboard' },
  { label: 'Meals',       icon: RiBowlLine,       path: '/meals' },
  { label: 'Water',       icon: RiDropLine,       path: '/water' },
  { label: 'Weight',      icon: RiScalesLine,     path: '/weight' },
  { label: 'Analytics',   icon: RiBarChartLine,   path: '/analytics' },
  { label: 'AI Diet Plan',icon: RiRobotLine,      path: '/ai-plan' },
];

const bottomItems = [
  { label: 'Profile',  icon: RiUserLine,     path: '/profile' },
  { label: 'Settings', icon: RiSettings3Line, path: '/settings' },
];

export default function Sidebar({ collapsed }) {
  const dispatch  = useDispatch();
  const navigate  = useNavigate();
  const { user }  = useSelector((s) => s.auth);

  const handleLogout = async () => {
    await dispatch(logoutUser());
    toast.success('Logged out');
    navigate('/login');
  };

  const w = collapsed ? 'w-16' : 'w-60';

  return (
    <motion.aside
      animate={{ width: collapsed ? 64 : 240 }}
      transition={{ duration: 0.2, ease: 'easeInOut' }}
      className="flex flex-col h-full bg-white dark:bg-gray-900 border-r border-gray-100 dark:border-gray-800 flex-shrink-0 overflow-hidden"
    >
      {/* Logo */}
      <div className="flex items-center gap-3 px-4 py-5 border-b border-gray-100 dark:border-gray-800">
        <div className="w-8 h-8 rounded-xl bg-primary-600 flex items-center justify-center flex-shrink-0">
          <RiLeafLine className="text-white text-lg" />
        </div>
        {!collapsed && (
          <div>
            <p className="text-sm font-semibold text-gray-900 dark:text-white">MealSnap</p>
            <p className="text-xs text-gray-400">Diet Tracker</p>
          </div>
        )}
      </div>

      {/* Streak badge */}
      {!collapsed && user?.currentStreak > 0 && (
        <div className="mx-3 mt-3 px-3 py-2 rounded-xl bg-orange-50 dark:bg-orange-900/20 border border-orange-100 dark:border-orange-800/40 flex items-center gap-2">
          <span className="text-lg">🔥</span>
          <div>
            <p className="text-xs font-semibold text-orange-700 dark:text-orange-400">{user.currentStreak}-day streak!</p>
            <p className="text-xs text-orange-500">Keep going!</p>
          </div>
        </div>
      )}

      {/* Nav */}
      <nav className="flex-1 px-2 py-3 space-y-0.5 overflow-y-auto thin-scrollbar">
        {!collapsed && (
          <p className="text-xs font-medium text-gray-400 uppercase tracking-wider px-2 pb-1 pt-2">Main</p>
        )}
        {navItems.map(({ label, icon: Icon, path }) => (
          <NavLink
            key={path}
            to={path}
            className={({ isActive }) =>
              `nav-item ${isActive ? 'nav-item-active' : ''}`
            }
            title={collapsed ? label : undefined}
          >
            <Icon className="text-lg flex-shrink-0" />
            {!collapsed && <span>{label}</span>}
          </NavLink>
        ))}

        {!collapsed && (
          <p className="text-xs font-medium text-gray-400 uppercase tracking-wider px-2 pb-1 pt-4">Account</p>
        )}
        {bottomItems.map(({ label, icon: Icon, path }) => (
          <NavLink
            key={path}
            to={path}
            className={({ isActive }) => `nav-item ${isActive ? 'nav-item-active' : ''}`}
            title={collapsed ? label : undefined}
          >
            <Icon className="text-lg flex-shrink-0" />
            {!collapsed && <span>{label}</span>}
          </NavLink>
        ))}

        {user?.role === 'admin' && (
          <NavLink
            to="/admin"
            className={({ isActive }) => `nav-item ${isActive ? 'nav-item-active' : ''}`}
            title={collapsed ? 'Admin' : undefined}
          >
            <RiShieldLine className="text-lg flex-shrink-0" />
            {!collapsed && <span>Admin Panel</span>}
          </NavLink>
        )}
      </nav>

      {/* User + logout */}
      <div className="border-t border-gray-100 dark:border-gray-800 p-3">
        {!collapsed && (
          <div className="flex items-center gap-2 px-2 py-2 mb-1">
            <div className="w-7 h-7 rounded-full bg-primary-600 flex items-center justify-center text-white text-xs font-semibold flex-shrink-0">
              {user?.name?.[0]?.toUpperCase() || 'U'}
            </div>
            <div className="min-w-0">
              <p className="text-xs font-medium text-gray-800 dark:text-gray-200 truncate">{user?.name}</p>
              <p className="text-xs text-gray-400 capitalize">{user?.plan || 'free'}</p>
            </div>
          </div>
        )}
        <button
          onClick={handleLogout}
          className="nav-item text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 w-full"
          title={collapsed ? 'Logout' : undefined}
        >
          <RiLogoutBoxLine className="text-lg flex-shrink-0" />
          {!collapsed && <span>Logout</span>}
        </button>
      </div>
    </motion.aside>
  );
}
