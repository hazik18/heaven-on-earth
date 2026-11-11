import { useState, useEffect } from 'react';
import api from '../../api';
import mockRoutes from '../../data/routes.mock.json';
import DeleteConfirmModal from '../../components/admin/DeleteConfirmModal';

const STEPS = [
  { id: 0, label: 'Basic Info', icon: 'alt_route' },
  { id: 1, label: 'Logistics & Passes', icon: 'landscape' },
  { id: 2, label: 'Permits & Highlights', icon: 'verified_user' },
  { id: 3, label: 'Itinerary', icon: 'calendar_today' },
  { id: 4, label: 'Images', icon: 'image' }
];

const CATEGORY_LABELS = {
  highway: 'Highway Approaches',
  lake_valley: 'Lakes & Valleys',
  offbeat: 'Offbeat & High-Altitude'
};

const emptyForm = {
  title: '',
  slug: '',
  category: 'highway',
  from_location: 'Leh',
  to_location: '',
  approx_distance: 'approx. 120 km',
  approx_duration: 'approx. 5–6 hrs',
  approx_cost: 'approx. ₹15,000–22,000',
  mode: 'Car / Bike / 4x4',
  best_season: 'May–Sep',
  permits_required: true,
  permit_details: {
    indian:
      'Environment Development Fee (EDF) online via lahdclehpermit.in (approx. ₹400–600 per person).',
    foreigner:
      'Protected Area Permit (PAP) required; must be booked via a registered local operator like Kashmir Offbeat.'
  },
  key_passes: [{ name: '', altitude: '' }],
  highlights: '',
  itinerary_summary: '',
  itinerary: [{ day: 1, title: '', description: '', distance: '', altitude: '', duration: '' }],
  images: [],
  imageUrlInput: '',
  isFeatured: false,
  isActive: true
};

const inputCls = (err) =>
  `w-full bg-white border rounded-lg px-4 py-2 text-sm text-slate-800 transition-colors outline-none ${
    err ? 'border-red-400 focus:border-red-500' : 'border-slate-300 focus:border-[#FF8C00]'
  }`;

const ErrMsg = ({ msg }) =>
  msg ? (
    <p className="mt-1 text-xs text-red-500 flex items-center gap-1">
      <span className="material-icons text-[14px]">error_outline</span>
      {msg}
    </p>
  ) : null;

const slugify = (str) =>
  str
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');

const ensureApprox = (val) => {
  if (!val || typeof val !== 'string') return val || '';
  const trimmed = val.trim();
  if (!trimmed) return '';
  return /^approx\./i.test(trimmed) ? trimmed : `approx. ${trimmed}`;
};

function validateStep(step, form) {
  const errs = {};
  if (step === 0) {
    if (!form.title.trim()) errs.title = 'Route title is required';
    if (!form.slug.trim()) errs.slug = 'URL slug is required';
    if (!form.from_location.trim()) errs.from_location = 'From location is required';
    if (!form.to_location.trim()) errs.to_location = 'To location is required';
    if (!form.itinerary_summary.trim()) errs.itinerary_summary = 'Itinerary summary is required';
  }
  if (step === 1) {
    if (!form.approx_distance.trim()) errs.approx_distance = 'Approximate distance is required';
    if (!form.approx_duration.trim()) errs.approx_duration = 'Approximate duration is required';
    if (!form.mode.trim()) errs.mode = 'Travel mode is required';
    if (!form.best_season.trim()) errs.best_season = 'Best season is required';
  }
  return errs;
}

export default function AdminRoutes() {
  const [routes, setRoutes] = useState([]);
  const [usingMockFallback, setUsingMockFallback] = useState(false);
  const [loading, setLoading] = useState(true);
  const [seeding, setSeeding] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [step, setStep] = useState(0);
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [dragOver, setDragOver] = useState(false);
  const [filterCat, setFilterCat] = useState('');

  useEffect(() => {
    load();
  }, []);

  const load = () => {
    setLoading(true);
    api
      .adminGetRoutes()
      .then((data) => {
        if (Array.isArray(data) && data.length > 0 && !String(data[0]._id || data[0].id || '').startsWith('route-')) {
          setRoutes(data);
          setUsingMockFallback(false);
        } else {
          setRoutes(mockRoutes);
          setUsingMockFallback(true);
        }
      })
      .catch(() => {
        setRoutes(mockRoutes);
        setUsingMockFallback(true);
      })
      .finally(() => setLoading(false));
  };

  const handleSeedFromMock = async () => {
    setSeeding(true);
    try {
      const res = await api.adminSeedRoutes();
      alert(res.message || 'Successfully seeded Ladakh routes into database!');
      load();
    } catch (err) {
      alert(err.message || 'Failed to seed routes into database');
    } finally {
      setSeeding(false);
    }
  };

  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm);
    setStep(0);
    setErrors({});
    setShowForm(true);
  };

  const openEdit = (route) => {
    const isMockItem = String(route._id || route.id || '').startsWith('route-');
    setEditing(isMockItem ? null : route._id || route.id);
    setForm({
      title: route.title || '',
      slug: route.slug || '',
      category: route.category || 'highway',
      from_location: route.from_location || '',
      to_location: route.to_location || '',
      approx_distance: route.approx_distance || '',
      approx_duration: route.approx_duration || '',
      approx_cost: route.approx_cost || 'approx. ₹15,000–25,000',
      mode: route.mode || 'Car / Bike / 4x4',
      best_season: route.best_season || '',
      permits_required: Boolean(route.permits_required),
      permit_details: {
        indian:
          route.permit_details?.indian ||
          'Environment Development Fee (EDF) online via lahdclehpermit.in (approx. ₹400–600 per person).',
        foreigner:
          route.permit_details?.foreigner ||
          'Protected Area Permit (PAP) required; must be booked via a registered local operator like Kashmir Offbeat.'
      },
      key_passes:
        route.key_passes?.length > 0 ? route.key_passes : [{ name: '', altitude: '' }],
      highlights: (route.highlights || []).join('\n'),
      itinerary_summary: route.itinerary_summary || '',
      itinerary:
        route.itinerary?.length > 0
          ? route.itinerary
          : [{ day: 1, title: '', description: '', distance: '', altitude: '', duration: '' }],
      images: route.images || [],
      imageUrlInput: '',
      isFeatured: Boolean(route.isFeatured),
      isActive: route.isActive !== false
    });
    setStep(0);
    setErrors({});
    setShowForm(true);
  };

  const handleNext = () => {
    const errs = validateStep(step, form);
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }
    setErrors({});
    setStep((s) => s + 1);
  };

  const handleBack = () => {
    setErrors({});
    setStep((s) => s - 1);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validateStep(step, form);
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }
    setSaving(true);
    const payload = {
      title: form.title.trim(),
      slug: form.slug.trim(),
      category: form.category,
      from_location: form.from_location.trim(),
      to_location: form.to_location.trim(),
      approx_distance: ensureApprox(form.approx_distance),
      approx_duration: ensureApprox(form.approx_duration),
      approx_cost: ensureApprox(form.approx_cost),
      mode: form.mode.trim(),
      best_season: form.best_season.trim(),
      permits_required: Boolean(form.permits_required),
      permit_details: form.permit_details,
      key_passes: form.key_passes
        .filter((p) => p.name.trim())
        .map((p) => ({
          name: p.name.trim(),
          altitude: ensureApprox(p.altitude || 'approx. 4,000 m')
        })),
      highlights: form.highlights
        .split('\n')
        .map((s) => s.trim())
        .filter(Boolean),
      itinerary_summary: form.itinerary_summary.trim(),
      itinerary: form.itinerary
        .filter((d) => d.title.trim() || d.description.trim())
        .map((d, idx) => ({
          day: idx + 1,
          title: d.title.trim(),
          description: d.description.trim(),
          distance: ensureApprox(d.distance),
          altitude: ensureApprox(d.altitude),
          duration: ensureApprox(d.duration)
        })),
      images:
        form.images.length > 0
          ? form.images
          : [
              'https://images.pexels.com/photos/5204954/pexels-photo-5204954.jpeg?auto=compress&cs=tinysrgb&w=1600'
            ],
      isFeatured: form.isFeatured,
      isActive: form.isActive
    };

    try {
      if (editing) {
        await api.adminUpdateRoute(editing, payload);
      } else {
        await api.adminCreateRoute(payload);
      }
      setShowForm(false);
      setEditing(null);
      setForm(emptyForm);
      load();
    } catch (err) {
      setErrors({ submit: err.message || 'Failed to save route. Please try again.' });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    const id = deleteTarget._id || deleteTarget.id;
    if (String(id).startsWith('route-')) {
      setRoutes((prev) => prev.filter((r) => (r._id || r.id) !== id));
      setDeleteTarget(null);
      return;
    }
    await api.adminDeleteRoute(id);
    setDeleteTarget(null);
    load();
  };

  // Key Passes helpers
  const addKeyPass = () =>
    setForm((f) => ({ ...f, key_passes: [...f.key_passes, { name: '', altitude: '' }] }));

  const removeKeyPass = (idx) =>
    setForm((f) => ({
      ...f,
      key_passes: f.key_passes.filter((_, i) => i !== idx)
    }));

  const updateKeyPass = (idx, field, val) => {
    const updated = [...form.key_passes];
    updated[idx] = { ...updated[idx], [field]: val };
    setForm((f) => ({ ...f, key_passes: updated }));
  };

  // Itinerary helpers
  const addItineraryDay = () =>
    setForm((f) => ({
      ...f,
      itinerary: [
        ...f.itinerary,
        {
          day: f.itinerary.length + 1,
          title: '',
          description: '',
          distance: '',
          altitude: '',
          duration: ''
        }
      ]
    }));

  const removeItineraryDay = (idx) => {
    const updated = form.itinerary
      .filter((_, i) => i !== idx)
      .map((d, i) => ({ ...d, day: i + 1 }));
    setForm((f) => ({ ...f, itinerary: updated }));
  };

  const updateItineraryDay = (idx, field, val) => {
    const updated = [...form.itinerary];
    updated[idx] = { ...updated[idx], [field]: val };
    setForm((f) => ({ ...f, itinerary: updated }));
  };

  // Image helpers
  const addImageUrl = () => {
    if (!form.imageUrlInput.trim()) return;
    setForm((f) => ({
      ...f,
      images: [...f.images, f.imageUrlInput.trim()],
      imageUrlInput: ''
    }));
  };

  const handleImageFiles = (files) => {
    const imgs = Array.from(files)
      .filter((f) => f.type.startsWith('image/'))
      .slice(0, 6 - form.images.length);
    const oversized = imgs.filter((f) => f.size > 3 * 1024 * 1024);
    if (oversized.length > 0) {
      alert(`${oversized.length} image(s) exceed 3 MB and were skipped`);
    }
    const valid = imgs.filter((f) => f.size <= 3 * 1024 * 1024);
    valid.forEach((file) => {
      const reader = new FileReader();
      reader.onload = (e) =>
        setForm((prev) => ({
          ...prev,
          images: [...prev.images, e.target.result]
        }));
      reader.readAsDataURL(file);
    });
  };

  const visibleRoutes = filterCat ? routes.filter((r) => r.category === filterCat) : routes;
  const isLastStep = step === STEPS.length - 1;

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 md:mb-8">
        <div>
          <h1 className="text-2xl md:text-3xl text-slate-800 font-bold">
            Route Catalogue Manager
          </h1>
          <p className="text-slate-500 mt-1 text-sm">
            Manage Ladakh highway approaches, high-altitude lake circuits, and offbeat passes
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={handleSeedFromMock}
            disabled={seeding}
            className="bg-slate-800 hover:bg-slate-900 disabled:opacity-50 text-white px-4 py-2.5 rounded-xl font-bold text-sm flex items-center gap-2 shadow-sm"
          >
            <span className="material-icons text-sm">
              {seeding ? 'sync' : 'cloud_download'}
            </span>
            {seeding ? 'Seeding Routes...' : 'Seed from Mock Data'}
          </button>
          <button
            type="button"
            onClick={openCreate}
            className="bg-[#FF8C00] hover:bg-[#E67E00] text-white px-5 py-2.5 rounded-xl font-bold text-sm flex items-center gap-2 shadow-sm"
          >
            <span className="material-icons text-sm">add</span> Add Route
          </button>
        </div>
      </div>

      {/* Mock Data Notice Banner if DB is not yet seeded */}
      {usingMockFallback && (
        <div className="mb-6 bg-amber-50 border border-amber-200 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <span className="material-icons text-amber-600 mt-0.5">info</span>
            <div>
              <p className="text-sm font-bold text-slate-800">
                Previewing Phase 1 Mock Catalogue (`routes.mock.json`)
              </p>
              <p className="text-xs text-slate-600">
                Click <strong>"Seed from Mock Data"</strong> to populate all 11 Ladakh routes into the live MongoDB collection for production management.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleSeedFromMock}
            disabled={seeding}
            className="shrink-0 bg-amber-600 hover:bg-amber-700 text-white px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider"
          >
            {seeding ? 'Seeding...' : 'Seed 11 Routes Now'}
          </button>
        </div>
      )}

      {/* Category Filter Pills */}
      <div className="flex flex-wrap gap-2 mb-6">
        {[
          { id: '', label: `All (${routes.length})` },
          {
            id: 'highway',
            label: `Highway Approaches (${routes.filter((r) => r.category === 'highway').length})`
          },
          {
            id: 'lake_valley',
            label: `Lakes & Valleys (${routes.filter((r) => r.category === 'lake_valley').length})`
          },
          {
            id: 'offbeat',
            label: `Offbeat & High-Altitude (${routes.filter((r) => r.category === 'offbeat').length})`
          }
        ].map((c) => (
          <button
            key={c.id}
            type="button"
            onClick={() => setFilterCat(c.id)}
            className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${
              filterCat === c.id
                ? 'bg-[#FF8C00] text-white shadow-sm'
                : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            {c.label}
          </button>
        ))}
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white border border-slate-200 rounded-2xl shadow-xl w-full max-w-3xl my-8">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-slate-200">
              <h2 className="text-xl text-slate-900 font-bold">
                {editing ? 'Edit Route Entry' : 'New Route Entry'}
              </h2>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="p-1.5 hover:bg-slate-100 rounded-lg transition-colors text-slate-500"
              >
                <span className="material-icons">close</span>
              </button>
            </div>

            {/* Step Indicator */}
            <div className="px-6 py-4 border-b border-slate-200">
              <div className="flex items-center gap-0">
                {STEPS.map((s, i) => (
                  <div key={s.id} className="flex items-center flex-1 last:flex-none">
                    <button
                      type="button"
                      onClick={() => {
                        setErrors({});
                        setStep(i);
                      }}
                      className="flex flex-col items-center gap-1 group"
                    >
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                          i < step
                            ? 'bg-green-500 text-white'
                            : i === step
                            ? 'bg-[#FF8C00] text-white ring-4 ring-[#FF8C00]/20'
                            : 'bg-slate-200 text-slate-400'
                        }`}
                      >
                        {i < step ? (
                          <span className="material-icons text-[16px]">check</span>
                        ) : (
                          i + 1
                        )}
                      </div>
                      <span
                        className={`text-[10px] font-semibold whitespace-nowrap ${
                          i === step
                            ? 'text-[#FF8C00]'
                            : i < step
                            ? 'text-green-500'
                            : 'text-slate-500'
                        }`}
                      >
                        {s.label}
                      </span>
                    </button>
                    {i < STEPS.length - 1 && (
                      <div
                        className={`flex-1 h-0.5 mx-2 mb-5 transition-colors ${
                          i < step ? 'bg-green-500' : 'bg-slate-100'
                        }`}
                      />
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Step Content */}
            <div className="px-6 py-5 max-h-[55vh] overflow-y-auto">
              {/* Step 0: Basic Info */}
              {step === 0 && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-bold text-slate-500 uppercase block mb-1">
                        Route Title <span className="text-red-500">*</span>
                      </label>
                      <input
                        value={form.title}
                        onChange={(e) => {
                          const title = e.target.value;
                          setForm((f) => ({
                            ...f,
                            title,
                            slug: editing ? f.slug : slugify(title)
                          }));
                        }}
                        className={inputCls(errors.title)}
                        placeholder="e.g., Leh to Nubra Valley"
                      />
                      <ErrMsg msg={errors.title} />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-slate-500 uppercase block mb-1">
                        URL Slug <span className="text-red-500">*</span>
                      </label>
                      <input
                        value={form.slug}
                        onChange={(e) => setForm((f) => ({ ...f, slug: e.target.value }))}
                        className={inputCls(errors.slug)}
                        placeholder="leh-to-nubra-valley"
                      />
                      <ErrMsg msg={errors.slug} />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="text-xs font-bold text-slate-500 uppercase block mb-1">
                        Category <span className="text-red-500">*</span>
                      </label>
                      <select
                        value={form.category}
                        onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
                        className={inputCls()}
                      >
                        <option value="highway">Highway Approaches (highway)</option>
                        <option value="lake_valley">Lakes & Valleys (lake_valley)</option>
                        <option value="offbeat">Offbeat & High-Altitude (offbeat)</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-xs font-bold text-slate-500 uppercase block mb-1">
                        From Location <span className="text-red-500">*</span>
                      </label>
                      <input
                        value={form.from_location}
                        onChange={(e) => setForm((f) => ({ ...f, from_location: e.target.value }))}
                        className={inputCls(errors.from_location)}
                        placeholder="e.g., Leh"
                      />
                      <ErrMsg msg={errors.from_location} />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-slate-500 uppercase block mb-1">
                        To Location <span className="text-red-500">*</span>
                      </label>
                      <input
                        value={form.to_location}
                        onChange={(e) => setForm((f) => ({ ...f, to_location: e.target.value }))}
                        className={inputCls(errors.to_location)}
                        placeholder="e.g., Nubra Valley"
                      />
                      <ErrMsg msg={errors.to_location} />
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-500 uppercase block mb-1">
                      Itinerary Summary (Markdown / HTML) <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      rows={4}
                      value={form.itinerary_summary}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, itinerary_summary: e.target.value }))
                      }
                      className={inputCls(errors.itinerary_summary)}
                      placeholder="Concise summary of the route, passes, halts, and key highlights..."
                    />
                    <ErrMsg msg={errors.itinerary_summary} />
                  </div>
                </div>
              )}

              {/* Step 1: Logistics & Passes */}
              {step === 1 && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-bold text-slate-500 uppercase block mb-1">
                        Approx. Distance <span className="text-red-500">*</span>
                      </label>
                      <input
                        value={form.approx_distance}
                        onChange={(e) =>
                          setForm((f) => ({ ...f, approx_distance: e.target.value }))
                        }
                        className={inputCls(errors.approx_distance)}
                        placeholder="approx. 120 km"
                      />
                      <ErrMsg msg={errors.approx_distance} />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-slate-500 uppercase block mb-1">
                        Approx. Duration <span className="text-red-500">*</span>
                      </label>
                      <input
                        value={form.approx_duration}
                        onChange={(e) =>
                          setForm((f) => ({ ...f, approx_duration: e.target.value }))
                        }
                        className={inputCls(errors.approx_duration)}
                        placeholder="approx. 5–6 hrs"
                      />
                      <ErrMsg msg={errors.approx_duration} />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="text-xs font-bold text-slate-500 uppercase block mb-1">
                        Travel Mode <span className="text-red-500">*</span>
                      </label>
                      <input
                        value={form.mode}
                        onChange={(e) => setForm((f) => ({ ...f, mode: e.target.value }))}
                        className={inputCls(errors.mode)}
                        placeholder="Car / Bike / 4x4"
                      />
                      <ErrMsg msg={errors.mode} />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-slate-500 uppercase block mb-1">
                        Best Season <span className="text-red-500">*</span>
                      </label>
                      <input
                        value={form.best_season}
                        onChange={(e) => setForm((f) => ({ ...f, best_season: e.target.value }))}
                        className={inputCls(errors.best_season)}
                        placeholder="May–Sep"
                      />
                      <ErrMsg msg={errors.best_season} />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-slate-500 uppercase block mb-1">
                        Approx. Cost
                      </label>
                      <input
                        value={form.approx_cost}
                        onChange={(e) => setForm((f) => ({ ...f, approx_cost: e.target.value }))}
                        className={inputCls()}
                        placeholder="approx. ₹15,000–22,000"
                      />
                    </div>
                  </div>

                  {/* Key Passes */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="text-xs font-bold text-slate-500 uppercase">
                        Key Passes (`name` & `altitude`)
                      </label>
                      <button
                        type="button"
                        onClick={addKeyPass}
                        className="text-xs font-bold text-[#FF8C00] hover:underline flex items-center gap-1"
                      >
                        <span className="material-icons text-sm">add</span> Add Pass
                      </button>
                    </div>
                    <div className="space-y-2">
                      {form.key_passes.map((pass, idx) => (
                        <div key={idx} className="flex items-center gap-3">
                          <input
                            value={pass.name}
                            onChange={(e) => updateKeyPass(idx, 'name', e.target.value)}
                            placeholder="Pass Name (e.g., Khardung La)"
                            className={inputCls()}
                          />
                          <input
                            value={pass.altitude}
                            onChange={(e) => updateKeyPass(idx, 'altitude', e.target.value)}
                            placeholder="Altitude (e.g., approx. 5,359 m)"
                            className={inputCls()}
                          />
                          {form.key_passes.length > 1 && (
                            <button
                              type="button"
                              onClick={() => removeKeyPass(idx)}
                              className="p-2 text-red-500 hover:bg-red-50 rounded-lg"
                            >
                              <span className="material-icons text-base">delete</span>
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Step 2: Permits & Highlights */}
              {step === 2 && (
                <div className="space-y-4">
                  <div className="flex items-center gap-3 p-3.5 bg-orange-50 border border-orange-200 rounded-xl">
                    <input
                      type="checkbox"
                      id="permits_required"
                      checked={form.permits_required}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, permits_required: e.target.checked }))
                      }
                      className="w-4 h-4 accent-[#FF8C00]"
                    />
                    <label
                      htmlFor="permits_required"
                      className="text-sm font-bold text-slate-800 cursor-pointer"
                    >
                      Permits Required (EDF for Indian Tourists / PAP for Foreign Nationals)
                    </label>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-500 uppercase block mb-1">
                      Indian Tourist Permit Rules (EDF Notice)
                    </label>
                    <textarea
                      rows={2}
                      value={form.permit_details.indian}
                      onChange={(e) =>
                        setForm((f) => ({
                          ...f,
                          permit_details: { ...f.permit_details, indian: e.target.value }
                        }))
                      }
                      className={inputCls()}
                    />
                  </div>

                  <div>
                    <label className="text
                    -xs font-bold text-slate-500 uppercase block mb-1">
                      Foreign National Permit Rules (PAP Notice)
                    </label>
                    <textarea
                      rows={2}
                      value={form.permit_details.foreigner}
                      onChange={(e) =>
                        setForm((f) => ({
                          ...f,
                          permit_details: { ...f.permit_details, foreigner: e.target.value }
                        }))
                      }
                      className={inputCls()}
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-500 uppercase block mb-1">
                      Route Highlights (one per line)
                    </label>
                    <textarea
                      rows={4}
                      value={form.highlights}
                      onChange={(e) => setForm((f) => ({ ...f, highlights: e.target.value }))}
                      placeholder="Khardung La Pass (approx. 5,359 m)&#10;Diskit Monastery&#10;Hunder Sand Dunes"
                      className={inputCls()}
                    />
                  </div>

                  <div className="flex items-center gap-3 p-3 bg-slate-100 rounded-lg">
                    <input
                      type="checkbox"
                      id="isFeatured"
                      checked={form.isFeatured}
                      onChange={(e) => setForm((f) => ({ ...f, isFeatured: e.target.checked }))}
                      className="w-4 h-4 accent-[#FF8C00]"
                    />
                    <label htmlFor="isFeatured" className="text-sm text-slate-700 cursor-pointer">
                      Mark as Featured Route
                    </label>
                  </div>
                </div>
              )}

              {/* Step 3: Day-Wise Itinerary */}
              {step === 3 && (
                <div className="space-y-3">
                  {form.itinerary.map((day, idx) => (
                    <div
                      key={idx}
                      className="bg-slate-100/60 border border-slate-300 rounded-xl p-4"
                    >
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-xs font-bold text-[#FF8C00] bg-orange-100 px-2.5 py-1 rounded-full">
                          Day {day.day}
                        </span>
                        {form.itinerary.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeItineraryDay(idx)}
                            className="text-red-500 hover:text-red-600 text-xs flex items-center gap-1"
                          >
                            <span className="material-icons text-[15px]">delete</span> Remove
                          </button>
                        )}
                      </div>
                      <div className="space-y-3">
                        <input
                          value={day.title}
                          onChange={(e) => updateItineraryDay(idx, 'title', e.target.value)}
                          placeholder="Day title, e.g., Leh to Diskit & Hunder via Khardung La"
                          className={inputCls()}
                        />
                        <textarea
                          rows={2}
                          value={day.description}
                          onChange={(e) => updateItineraryDay(idx, 'description', e.target.value)}
                          placeholder="Describe the day's route, stops, passes, and halts"
                          className={inputCls()}
                        />
                        <div className="grid grid-cols-3 gap-3">
                          <input
                            value={day.distance}
                            onChange={(e) => updateItineraryDay(idx, 'distance', e.target.value)}
                            placeholder="approx. 120 km"
                            className={inputCls()}
                          />
                          <input
                            value={day.altitude}
                            onChange={(e) => updateItineraryDay(idx, 'altitude', e.target.value)}
                            placeholder="approx. 5,359 m max"
                            className={inputCls()}
                          />
                          <input
                            value={day.duration}
                            onChange={(e) => updateItineraryDay(idx, 'duration', e.target.value)}
                            placeholder="approx. 5–6 hrs"
                            className={inputCls()}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={addItineraryDay}
                    className="w-full bg-slate-100 hover:bg-slate-200 border border-dashed border-slate-300 text-slate-600 px-4 py-2.5 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 transition-colors"
                  >
                    <span className="material-icons text-[18px]">add</span> Add Itinerary Day
                  </button>
                </div>
              )}

              {/* Step 4: Images */}
              {step === 4 && (
                <div className="space-y-4">
                  <div className="flex gap-2">
                    <input
                      type="url"
                      value={form.imageUrlInput}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, imageUrlInput: e.target.value }))
                      }
                      placeholder="https://images.pexels.com/..."
                      className={inputCls()}
                    />
                    <button
                      type="button"
                      onClick={addImageUrl}
                      className="shrink-0 bg-[#FF8C00] hover:bg-[#E67E00] text-white px-4 py-2 rounded-lg text-sm font-bold"
                    >
                      Add URL
                    </button>
                  </div>

                  <div
                    onDrop={(e) => {
                      e.preventDefault();
                      setDragOver(false);
                      handleImageFiles(e.dataTransfer.files);
                    }}
                    onDragOver={(e) => {
                      e.preventDefault();
                      setDragOver(true);
                    }}
                    onDragLeave={() => setDragOver(false)}
                    className={`border-2 border-dashed rounded-xl p-6 text-center transition-colors ${
                      dragOver
                        ? 'border-[#FF8C00] bg-[#FF8C00]/5'
                        : 'border-slate-300 bg-slate-50 hover:border-slate-400'
                    }`}
                  >
                    <span className="material-icons text-4xl text-slate-400 mb-2 block">
                      cloud_upload
                    </span>
                    <p className="text-slate-600 font-semibold text-sm mb-1">
                      Drag & drop landscape images here
                    </p>
                    <p className="text-slate-400 text-xs mb-3">PNG, JPG, WEBP (max 3 MB each)</p>
                    <label className="inline-block bg-slate-800 hover:bg-slate-900 text-white px-4 py-2 rounded-lg font-semibold cursor-pointer text-xs">
                      Browse Files
                      <input
                        type="file"
                        multiple
                        accept="image/*"
                        onChange={(e) => handleImageFiles(e.target.files)}
                        className="hidden"
                      />
                    </label>
                  </div>

                  {form.images.length > 0 && (
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                      {form.images.map((img, i) => (
                        <div
                          key={i}
                          className="relative group rounded-xl overflow-hidden border border-slate-300 aspect-video"
                        >
                          <img src={img} alt="" className="w-full h-full object-cover" />
                          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <button
                              type="button"
                              onClick={() =>
                                setForm((f) => ({
                                  ...f,
                                  images: f.images.filter((_, idx) => idx !== i)
                                }))
                              }
                              className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded-lg text-xs font-semibold flex items-center gap-1"
                            >
                              <span className="material-icons text-[14px]">delete</span> Remove
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 border-t border-slate-200 bg-slate-50 rounded-b-2xl">
              {errors.submit && (
                <div className="mb-3 flex items-center gap-2 bg-red-50 border border-red-200 text-red-600 px-4 py-2.5 rounded-lg text-sm">
                  <span className="material-icons text-[18px]">error_outline</span>
                  {errors.submit}
                </div>
              )}
              <div className="flex items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={step === 0 ? () => setShowForm(false) : handleBack}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-slate-300 text-slate-600 hover:bg-slate-100 transition-colors text-sm font-semibold"
                >
                  <span className="material-icons text-[18px]">
                    {step === 0 ? 'close' : 'arrow_back'}
                  </span>
                  {step === 0 ? 'Cancel' : 'Back'}
                </button>

                <div className="text-xs text-slate-500">
                  Step {step + 1} of {STEPS.length}
                </div>

                {isLastStep ? (
                  <button
                    type="button"
                    onClick={handleSubmit}
                    disabled={saving}
                    className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-green-600 hover:bg-green-500 disabled:opacity-50 text-white font-bold text-sm transition-colors"
                  >
                    {saving ? (
                      <>
                        <span className="material-icons animate-spin text-[18px]">refresh</span>{' '}
                        Saving...
                      </>
                    ) : (
                      <>
                        <span className="material-icons text-[18px]">
                          {editing ? 'save' : 'add_circle'}
                        </span>{' '}
                        {editing ? 'Update Route' : 'Create Route'}
                      </>
                    )}
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleNext}
                    className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#FF8C00] hover:bg-[#E67E00] text-white font-bold text-sm transition-colors shadow-sm"
                  >
                    Next <span className="material-icons text-[18px]">arrow_forward</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Routes Table */}
      {loading ? (
        <div className="text-center py-20 text-slate-600">Loading routes...</div>
      ) : visibleRoutes.length === 0 ? (
        <div className="text-center py-20 text-slate-500">
          <span className="material-icons text-5xl mb-3 block opacity-30">alt_route</span>
          No routes found. Click "Add Route" or "Seed from Mock Data".
        </div>
      ) : (
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-slate-500 border-b border-slate-200 bg-slate-50">
                  <th className="px-4 py-3 font-bold text-slate-600 text-xs uppercase">Route</th>
                  <th className="px-4 py-3 font-bold text-slate-600 text-xs uppercase">Category</th>
                  <th className="px-4 py-3 font-bold text-slate-600 text-xs uppercase">
                    Distance & Duration
                  </th>
                  <th className="px-4 py-3 font-bold text-slate-600 text-xs uppercase">
                    Key Passes
                  </th>
                  <th className="px-4 py-3 font-bold text-slate-600 text-xs uppercase">Permits</th>
                  <th className="px-4 py-3 font-bold text-slate-600 text-xs uppercase text-right">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {visibleRoutes.map((route) => (
                  <tr
                    key={route._id || route.id || route.slug}
                    className="border-b border-slate-200/60 hover:bg-slate-50 transition-colors"
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <img
                          src={
                            route.images?.[0] ||
                            'https://images.pexels.com/photos/5204954/pexels-photo-5204954.jpeg?auto=compress&cs=tinysrgb&w=400'
                          }
                          alt=""
                          className="w-11 h-11 rounded-lg object-cover shrink-0"
                        />
                        <div>
                          <p className="font-bold text-slate-800">{route.title}</p>
                          <p className="text-xs text-slate-500">
                            {route.from_location} → {route.to_location} · {route.best_season}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-orange-50 text-[#FF8C00]">
                        {CATEGORY_LABELS[route.category] || route.category}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-600">
                      <div className="font-semibold text-slate-800">
                        {ensureApprox(route.approx_distance)}
                      </div>
                      <div className="text-xs text-slate-500">
                        {ensureApprox(route.approx_duration)}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-xs text-slate-600">
                      {route.key_passes?.map((p) => `${p.name} (${p.altitude})`).join(', ') || '—'}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                          route.permits_required
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-green-100 text-green-800'
                        }`}
                      >
                        {route.permits_required ? 'EDF / PAP' : 'No Permit'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right whitespace-nowrap">
                      <button
                        type="button"
                        onClick={() => openEdit(route)}
                        className="text-[#FF8C00] hover:text-[#FF8C00]/80 mr-3 transition-colors"
                        title="Edit Route"
                      >
                        <span className="material-icons text-[18px]">edit</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setDeleteTarget(route)}
                        className="text-red-500 hover:text-red-400 transition-colors"
                        title="Delete Route"
                      >
                        <span className="material-icons text-[18px]">delete</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <DeleteConfirmModal
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        itemName={deleteTarget?.title || 'this route'}
      />
    </div>
  );
}

