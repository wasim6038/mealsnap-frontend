import { useState, useEffect, useCallback, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { mealAPI, waterAPI, weightAPI, analyticsAPI } from '@/api/services';
import toast from 'react-hot-toast';

// ─── useDebounce ──────────────────────────────────────────────────────────────
export const useDebounce = (value, delay = 400) => {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return debounced;
};

// ─── useLocalStorage ─────────────────────────────────────────────────────────
export const useLocalStorage = (key, initialValue) => {
  const [value, setValue] = useState(() => {
    try { return JSON.parse(localStorage.getItem(key)) ?? initialValue; }
    catch { return initialValue; }
  });
  const setStored = useCallback((val) => {
    setValue(val);
    localStorage.setItem(key, JSON.stringify(val));
  }, [key]);
  return [value, setStored];
};

// ─── useMeals ─────────────────────────────────────────────────────────────────
export const useMeals = (date) => {
  const [meals, setMeals] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [mealsRes, summaryRes] = await Promise.all([
        mealAPI.getAll({ date }),
        mealAPI.getSummary(date),
      ]);
      setMeals(mealsRes.data.meals);
      setSummary(summaryRes.data.summary);
    } catch { toast.error('Failed to load meals'); }
    finally { setLoading(false); }
  }, [date]);

  useEffect(() => { load(); }, [load]);

  return { meals, summary, loading, reload: load, setMeals };
};

// ─── useWater ─────────────────────────────────────────────────────────────────
export const useWater = (date) => {
  const [logs, setLogs] = useState([]);
  const [totalToday, setTotalToday] = useState(0);
  const [goal, setGoal] = useState(2500);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await waterAPI.getLogs(date);
      setLogs(res.data.logs);
      setTotalToday(res.data.totalToday);
      setGoal(res.data.goal);
    } catch { toast.error('Failed to load water logs'); }
    finally { setLoading(false); }
  }, [date]);

  useEffect(() => { load(); }, [load]);

  const addWater = async (amount) => {
    try {
      await waterAPI.add({ amount });
      setTotalToday((prev) => prev + amount);
      setLogs((prev) => [{ _id: Date.now(), amount, loggedAt: new Date() }, ...prev]);
      toast.success(`+${amount}ml logged!`);
    } catch { toast.error('Failed to log water'); }
  };

  const removeLog = async (id) => {
    try {
      console.log('Removing log with ID:', id);
      const log = logs.find((l) => l._id === id);
      console.log('Found log:', log);
      await waterAPI.remove(id);
      setLogs((prev) => prev.filter((l) => l._id !== id));
      if (log) setTotalToday((prev) => Math.max(0, prev - log.amount));
    } catch { toast.error('Failed to delete log'); }
  };

  return { logs, totalToday, goal, loading, reload: load, addWater, removeLog };
};

// ─── useWeight ────────────────────────────────────────────────────────────────
export const useWeight = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await weightAPI.getLogs({ days: 30 });
      setLogs(res.data.result);
    } catch { toast.error('Failed to load weight logs'); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const addWeight = async (weight, note) => {
    try {
      const res = await weightAPI.add({ weight, note });
      setLogs((prev) => [res.data.result, ...prev]);
      toast.success('Weight logged!');
    } catch { toast.error('Failed to log weight'); }
  };

  const removeLog = async (id) => {
    try {
      await weightAPI.remove(id);
      setLogs((prev) => prev.filter((l) => l._id !== id));
    } catch { toast.error('Failed to delete log'); }
  };

  return { logs, loading, reload: load, addWeight, removeLog };
};

// ─── useAnalytics ─────────────────────────────────────────────────────────────
export const useAnalytics = (period = 7) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    analyticsAPI.get(period)
      .then((res) => setData(res.data))
      .catch(() => toast.error('Failed to load analytics'))
      .finally(() => setLoading(false));
  }, [period]);

  return { data, loading };
};

// ─── useClickOutside ──────────────────────────────────────────────────────────
export const useClickOutside = (callback) => {
  const ref = useRef(null);
  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) callback(); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [callback]);
  return ref;
};

// ─── useTheme ─────────────────────────────────────────────────────────────────
export const useTheme = () => {
  const darkMode = useSelector((s) => s.ui.darkMode);
  useEffect(() => {
    document.documentElement.classList.toggle('dark', darkMode);
  }, [darkMode]);
  return { darkMode };
};
