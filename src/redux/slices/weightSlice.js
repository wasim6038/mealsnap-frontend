import { createSlice } from '@reduxjs/toolkit';

const weightSlice = createSlice({
  name: 'weight',
  initialState: { logs: [], loading: false, error: null },
  reducers: {},
});
export default weightSlice.reducer;