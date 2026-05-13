import { configureStore } from '@reduxjs/toolkit';
import authReducer     from './slices/authSlice';
import mealReducer     from './slices/mealSlice';
import waterReducer    from './slices/waterSlice';
import weightReducer   from './slices/weightSlice';
import analyticsReducer from './slices/analyticsSlice';
import uiReducer       from './slices/uiSlice';

export const store = configureStore({
  reducer: {
    auth:      authReducer,
    meals:     mealReducer,
    water:     waterReducer,
    weight:    weightReducer,
    analytics: analyticsReducer,
    ui:        uiReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({ serializableCheck: { ignoredActions: ['persist/PERSIST'] } }),
});
