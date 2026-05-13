import { Outlet } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { toggleSidebar } from '@/redux/slices/uiSlice';
import Sidebar from './Sidebar';
import Topbar  from './Topbar';
import AddMealModal from '@/components/meals/AddMealModal';

export default function AppLayout() {
  const { sidebarCollapsed, addMealModal } = useSelector((s) => s.ui);

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50 dark:bg-gray-950">
      <Sidebar collapsed={sidebarCollapsed} />

      <div className="flex flex-col flex-1 overflow-hidden">
        <Topbar />
        <main className="flex-1 overflow-y-auto thin-scrollbar">
          <Outlet />
        </main>
      </div>

      {addMealModal && <AddMealModal />}
    </div>
  );
}
