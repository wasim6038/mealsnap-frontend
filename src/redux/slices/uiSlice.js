import { createSlice } from '@reduxjs/toolkit';

const uiSlice = createSlice({
  name: 'ui',
  initialState: {
    darkMode:         localStorage.getItem('darkMode') === 'true',
    sidebarCollapsed: false,
    addMealModal:     false,
    selectedDate:     new Date().toISOString().split('T')[0],
  },
  reducers: {
    toggleDarkMode: (state) => {
      state.darkMode = !state.darkMode;
      localStorage.setItem('darkMode', state.darkMode);
      document.documentElement.classList.toggle('dark', state.darkMode);
    },
    toggleSidebar:    (state) => { state.sidebarCollapsed = !state.sidebarCollapsed; },
    openAddMealModal:  (state) => { state.addMealModal = true; },
    closeAddMealModal: (state) => { state.addMealModal = false; },
    setSelectedDate:   (state, action) => { state.selectedDate = action.payload; },
  },
});
export const { toggleDarkMode, toggleSidebar, openAddMealModal, closeAddMealModal, setSelectedDate } = uiSlice.actions;
export default uiSlice.reducer;