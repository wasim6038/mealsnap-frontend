import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '@/api/axios';

// ─── Thunks ───────────────────────────────────────────────────────────────────
export const registerUser = createAsyncThunk('auth/register', async (data, { rejectWithValue }) => {
  try {
    const res = await api.post('/auth/register', data);
    localStorage.setItem('accessToken', res.data.accessToken);
    localStorage.setItem('refreshToken', res.data.refreshToken);
    return res.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Registration failed');
  }
});

export const loginUser = createAsyncThunk('auth/login', async (data, { rejectWithValue }) => {
  try {
    const res = await api.post('/auth/login', data);
    localStorage.setItem('accessToken', res.data.accessToken);
    localStorage.setItem('refreshToken', res.data.refreshToken);
    return res.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Login failed');
  }
});

export const logoutUser = createAsyncThunk('auth/logout', async (_, { rejectWithValue }) => {
  try {
    await api.post('/auth/logout');
  } catch { /* silent */ }
  localStorage.removeItem('accessToken');
  localStorage.removeItem('refreshToken');
});

export const fetchCurrentUser = createAsyncThunk('auth/me', async (_, { rejectWithValue }) => {
  try {
    const res = await api.get('/auth/me');
    return res.data;
  } catch (err) {
    localStorage.removeItem('accessToken');
    return rejectWithValue(err.response?.data?.message || 'Session expired');
  }
});

export const updateProfile = createAsyncThunk('auth/updateProfile', async (data, { rejectWithValue }) => {
  try {
    const res = await api.put('/users/profile', data);
    return res.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Update failed');
  }
});

export const forgotPassword = createAsyncThunk('auth/forgotPassword', async (email, { rejectWithValue }) => {
  try {
    const res = await api.post('/auth/forgot-password', { email });
    return res.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed');
  }
});

export const resetPassword = createAsyncThunk('auth/resetPassword', async ({ token, password }, { rejectWithValue }) => {
  try {
    const res = await api.put(`/auth/reset-password/${token}`, { password });
    return res.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Reset failed');
  }
});

// ─── Slice ───────────────────────────────────────────────────────────────────
const authSlice = createSlice({
  name: 'auth',
  initialState: {
    user:          null,
    accessToken:   localStorage.getItem('accessToken') || null,
    isAuthenticated: false,
    loading:       false,
    initializing:  true,
    error:         null,
  },
  reducers: {
    clearError: (state) => { state.error = null; },
    setUser:    (state, action) => { state.user = action.payload; state.isAuthenticated = true; },
  },
  extraReducers: (builder) => {
    const pending  = (state) => { state.loading = true; state.error = null; };
    const rejected = (state, action) => { state.loading = false; state.error = action.payload; };

    builder
      // register
      .addCase(registerUser.pending,  pending)
      .addCase(registerUser.fulfilled, (state, action) => {
        state.loading = false; state.user = action.payload.user;
        state.accessToken = action.payload.accessToken; state.isAuthenticated = true;
      })
      .addCase(registerUser.rejected, rejected)
      // login
      .addCase(loginUser.pending,  pending)
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false; state.user = action.payload.user;
        state.accessToken = action.payload.accessToken; state.isAuthenticated = true;
      })
      .addCase(loginUser.rejected, rejected)
      // logout
      .addCase(logoutUser.fulfilled, (state) => {
        state.user = null; state.accessToken = null; state.isAuthenticated = false;
      })
      // me
      .addCase(fetchCurrentUser.pending, (state) => { state.initializing = true; })
      .addCase(fetchCurrentUser.fulfilled, (state, action) => {
        state.initializing = false; state.user = action.payload.user;
        state.isAuthenticated = true; state.loading = false;
      })
      .addCase(fetchCurrentUser.rejected, (state) => {
        state.initializing = false; state.isAuthenticated = false; state.user = null;
      })
      // updateProfile
      .addCase(updateProfile.pending,  pending)
      .addCase(updateProfile.fulfilled, (state, action) => {
        state.loading = false; state.user = action.payload.user;
      })
      .addCase(updateProfile.rejected, rejected);
  },
});

export const { clearError, setUser } = authSlice.actions;
export default authSlice.reducer;
