import { createSlice } from '@reduxjs/toolkit';

const waterSlice = createSlice({
  name: 'water',
  initialState: { logs: [], totalToday: 0, goal: 2500, loading: false, error: null },
  reducers: {},
  extraReducers: (builder) => {
    // handled via RTK createAsyncThunk inline in components or waterThunks
  },
});
export default waterSlice.reducer;