import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AnimatePresence } from 'framer-motion';
import { closeAddMealModal } from '@/redux/slices/uiSlice';
import { mealAPI, foodAPI } from '@/api/services';
import { Modal } from '@/components/common/UI';
import { useDebounce } from '@/hooks';
import toast from 'react-hot-toast';
import { RiSearchLine, RiAddLine, RiCloseLine } from 'react-icons/ri';

const CATEGORIES = ['breakfast', 'lunch', 'dinner', 'snacks'];

const defaultForm = {
  name: '', category: 'breakfast', quantity: 100, unit: 'g',
  calories: '', protein: '', carbs: '', fat: '', fiber: '',
  notes: '',
};

export default function AddMealModal() {
  const dispatch = useDispatch();
  const { selectedDate } = useSelector((s) => s.ui);

  const [form, setForm]           = useState(defaultForm);
  const [searchQ, setSearchQ]     = useState('');
  const [results, setResults]     = useState([]);
  const [searching, setSearching] = useState(false);
  const [loading, setLoading]     = useState(false);
  const [tab, setTab]             = useState('manual'); // manual | search

  const debouncedQ = useDebounce(searchQ, 400);

  useEffect(() => {
    if (!debouncedQ.trim() || tab !== 'search') { setResults([]); return; }
    setSearching(true);
    foodAPI.search(debouncedQ)
      .then((res) => setResults(res.data.foods || []))
      .catch(() => {})
      .finally(() => setSearching(false));
  }, [debouncedQ, tab]);

  const fillFromFood = (food) => {
    const n = food.nutrients || {};
    setForm((prev) => ({
      ...prev,
      name: food.name,
      calories: Math.round(n.calories || 0),
      protein: Math.round(n.protein || 0),
      carbs: Math.round(n.carbs || 0),
      fat: Math.round(n.fat || 0),
      fiber: Math.round(n.fiber || 0),
      quantity: food.servingSize || 100,
      unit: food.servingSizeUnit || 'g',
    }));
    setResults([]);
    setSearchQ('');
    setTab('manual');
  };

  const handleChange = (e) => setForm((p) => ({ ...p, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim() || !form.calories) {
      toast.error('Name and calories are required'); return;
    }
    setLoading(true);
    try {
      await mealAPI.create({
        ...form,
        loggedAt: new Date(selectedDate),
        calories: Number(form.calories),
        protein: Number(form.protein) || 0,
        carbs: Number(form.carbs) || 0,
        fat: Number(form.fat) || 0,
        fiber: Number(form.fiber) || 0,
        quantity: Number(form.quantity),
      });
      toast.success('Meal logged! 🎉');
      dispatch(closeAddMealModal());
      setForm(defaultForm);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to log meal');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      <Modal title="Log a Meal" onClose={() => dispatch(closeAddMealModal())} size="lg">
        {/* Tabs */}
        <div className="flex gap-2 mb-4">
          {['manual', 'search'].map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors capitalize ${
                tab === t
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400'
              }`}
            >
              {t === 'manual' ? 'Manual Entry' : 'Search Food'}
            </button>
          ))}
        </div>

        {/* Food search tab */}
        {tab === 'search' && (
          <div className="mb-4">
            <div className="relative">
              <RiSearchLine className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                className="form-input pl-9"
                placeholder="Search food (e.g. chicken breast, oats...)"
                value={searchQ}
                onChange={(e) => setSearchQ(e.target.value)}
              />
            </div>
            {searching && <p className="text-xs text-gray-400 mt-2">Searching...</p>}
            {results.length > 0 && (
              <div className="mt-2 border border-gray-100 dark:border-gray-700 rounded-xl overflow-hidden max-h-52 overflow-y-auto thin-scrollbar">
                {results.map((food) => (
                  <button
                    key={food.fdcId}
                    onClick={() => fillFromFood(food)}
                    className="w-full flex items-center justify-between px-3 py-2.5 hover:bg-gray-50 dark:hover:bg-gray-800 text-left border-b border-gray-50 dark:border-gray-800 last:border-0"
                  >
                    <div>
                      <p className="text-sm font-medium text-gray-800 dark:text-gray-200 line-clamp-1">{food.name}</p>
                      <p className="text-xs text-gray-400">per {food.servingSize}{food.servingSizeUnit}</p>
                    </div>
                    <div className="text-right flex-shrink-0 ml-4">
                      <p className="text-sm font-semibold text-primary-600">{Math.round(food.nutrients?.calories || 0)} kcal</p>
                      <p className="text-xs text-gray-400">P:{Math.round(food.nutrients?.protein||0)}g C:{Math.round(food.nutrients?.carbs||0)}g F:{Math.round(food.nutrients?.fat||0)}g</p>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Manual form */}
        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2">
              <label className="form-label">Food name *</label>
              <input name="name" value={form.name} onChange={handleChange} className="form-input" placeholder="e.g. Grilled chicken breast" required />
            </div>
            <div>
              <label className="form-label">Category</label>
              <select name="category" value={form.category} onChange={handleChange} className="form-select">
                {CATEGORIES.map((c) => <option key={c} value={c} className="capitalize">{c.charAt(0).toUpperCase() + c.slice(1)}</option>)}
              </select>
            </div>
            <div>
              <label className="form-label">Quantity</label>
              <div className="flex gap-2">
                <input name="quantity" type="number" value={form.quantity} onChange={handleChange} className="form-input" placeholder="100" min="0" />
                <select name="unit" value={form.unit} onChange={handleChange} className="form-select w-20">
                  {['g', 'ml', 'oz', 'cup', 'tbsp', 'piece'].map((u) => <option key={u}>{u}</option>)}
                </select>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-4 gap-2">
            {[
              { name: 'calories', label: 'Calories *', unit: 'kcal', color: 'text-primary-600' },
              { name: 'protein', label: 'Protein', unit: 'g', color: 'text-orange-500' },
              { name: 'carbs', label: 'Carbs', unit: 'g', color: 'text-blue-500' },
              { name: 'fat', label: 'Fat', unit: 'g', color: 'text-yellow-500' },
            ].map(({ name, label, unit, color }) => (
              <div key={name}>
                <label className={`form-label ${color}`}>{label}</label>
                <input name={name} type="number" min="0" value={form[name]} onChange={handleChange}
                  className="form-input" placeholder="0" required={name === 'calories'} />
                <p className="text-xs text-gray-400 mt-0.5">{unit}</p>
              </div>
            ))}
          </div>

          <div>
            <label className="form-label">Notes (optional)</label>
            <input name="notes" value={form.notes} onChange={handleChange} className="form-input" placeholder="Any notes about this meal..." />
          </div>

          <div className="flex justify-end gap-2 pt-1">
            <button type="button" onClick={() => dispatch(closeAddMealModal())} className="btn-secondary">Cancel</button>
            <button type="submit" disabled={loading} className="btn-primary">
              {loading ? 'Logging...' : '✓ Log Meal'}
            </button>
          </div>
        </form>
      </Modal>
    </AnimatePresence>
  );
}
