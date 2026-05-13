import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '@/api/axios';

export const fetchMeals = createAsyncThunk('meals/fetch', async (params = {}, { rejectWithValue }) => {
  try {
    const res = await api.get('/meals', { params });
    return res.data;
  } catch (err) { return rejectWithValue(err.response?.data?.message); }
});

export const fetchDailySummary = createAsyncThunk('meals/summary', async (date, { rejectWithValue }) => {
  try {
    const res = await api.get('/meals/summary', { params: { date } });
    return res.data.summary;
  } catch (err) { return rejectWithValue(err.response?.data?.message); }
});

export const addMeal = createAsyncThunk('meals/add', async (data, { rejectWithValue }) => {
  try {
    const res = await api.post('/meals', data);
    return res.data.meal;
  } catch (err) { return rejectWithValue(err.response?.data?.message); }
});

export const updateMeal = createAsyncThunk('meals/update', async ({ id, data }, { rejectWithValue }) => {
  try {
    const res = await api.put(`/meals/${id}`, data);
    return res.data.meal;
  } catch (err) { return rejectWithValue(err.response?.data?.message); }
});

export const deleteMeal = createAsyncThunk('meals/delete', async (id, { rejectWithValue }) => {
  try {
    await api.delete(`/meals/${id}`);
    return id;
  } catch (err) { return rejectWithValue(err.response?.data?.message); }
});

export const toggleFavorite = createAsyncThunk('meals/favorite', async (id, { rejectWithValue }) => {
  try {
    const res = await api.put(`/meals/${id}/favorite`);
    return res.data.meal;
  } catch (err) { return rejectWithValue(err.response?.data?.message); }
});

const mealSlice = createSlice({
  name: 'meals',
  initialState: { items: [], summary: null, loading: false, error: null, total: 0 },
  reducers: { clearMeals: (state) => { state.items = []; state.summary = null; } },
  extraReducers: (builder) => {
    builder
      .addCase(fetchMeals.pending,    (s) => { s.loading = true; s.error = null; })
      .addCase(fetchMeals.fulfilled,  (s, a) => { s.loading = false; s.items = a.payload.meals; s.total = a.payload.total; })
      .addCase(fetchMeals.rejected,   (s, a) => { s.loading = false; s.error = a.payload; })
      .addCase(fetchDailySummary.fulfilled, (s, a) => { s.summary = a.payload; })
      .addCase(addMeal.fulfilled,     (s, a) => { s.items.unshift(a.payload); })
      .addCase(updateMeal.fulfilled,  (s, a) => { const i = s.items.findIndex(m => m._id === a.payload._id); if (i !== -1) s.items[i] = a.payload; })
      .addCase(deleteMeal.fulfilled,  (s, a) => { s.items = s.items.filter(m => m._id !== a.payload); })
      .addCase(toggleFavorite.fulfilled, (s, a) => { const i = s.items.findIndex(m => m._id === a.payload._id); if (i !== -1) s.items[i] = a.payload; });
  },
});
export const { clearMeals } = mealSlice.actions;
export default mealSlice.reducer;