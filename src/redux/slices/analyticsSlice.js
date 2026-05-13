import { createSlice } from '@reduxjs/toolkit';
const analyticsSlice = createSlice({
  name: 'analytics',
  initialState: { data: null, loading: false, error: null, period: 7 },
  reducers: { setPeriod: (state, action) => { state.period = action.payload; } },
});
export const { setPeriod } = analyticsSlice.actions;
export default analyticsSlice.reducer;