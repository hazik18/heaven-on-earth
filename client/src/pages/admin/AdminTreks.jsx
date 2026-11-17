import { useState, useEffect } from 'react';
import api from '../../api';
import useModalBehavior from '../../hooks/useModalBehavior';
import DeleteConfirmModal from '../../components/admin/DeleteConfirmModal';
import SingleImageUpload from '../../components/admin/SingleImageUpload';

const STEPS = [
  { id: 0, label: 'Basic Info',  icon: 'info' },
  { id: 1, label: 'Images',      icon: 'image' },
  { id: 2, label: 'Trek Details',icon: 'terrain' },
  { id: 3, label: 'Itinerary',   icon: 'calendar_today' },
  { id: 4, label: 'Extras',      icon: 'backpack' },
];

const emptyForm = {
  name: '', slug: '', overview: '', description: '', coverImage: '',
  images: [],
  duration: { nights: 5, days: 6 },
  altitude: { min: 0, max: 3000 },
  distance: { total: 50 },
  difficulty: 'moderate',
  fitnessLevel: 'intermediate',
  pricing: { perPerson: '' },
  startPoint: '', endPoint: '',
  groupSize: { min: 4, max: 12 },
  bestSeason: '',
  highlights: '',
  isFeatured: false,
  itinerary: [{ day: 1, title: '', description: '', distance: '', altitude: '', duration: '' }],
  inclusions: '', exclusions: '', whatToBring: '',
};

const inputCls = (err) =>
  `w-full bg-white border rounded-lg px-4 py-2.5 text-[15px] text-slate-900 transition-colors outline-none ${
    err ? 'border-red-400 focus:border-red-500' : 'border-slate-300 focus:border-[#C2410C] focus:ring-2 focus:ring-orange-500/20'
  }`;

const ErrMsg = ({ msg }) =>
  msg ? (
    <p className="mt-1 text-xs text-red-600 flex items-center gap-1">
      <span className="material-icons text-[14px]">error_outline</span>
      {msg}
    </p>
  ) : null;

function validateStep(step, form) {
  const errs = {};
  if (step === 0) {
    if (!form.name.trim())        errs.name = 'Trek name is required';
    if (!form.slug.trim())        errs.slug = 'URL slug is required';
    if (!form.overview.trim())    errs.overview = 'Overview is required';
    if (!form.description.trim()) errs.description = 'Description is required';
    if (!form.coverImage.trim() && form.images.length === 0)  errs.coverImage = 'Cover image URL or gallery image is required';
  }
  if (step === 2) {
    if (!form.startPoint.trim())         errs.startPoint = 'Start point is required';
    if (!form.endPoint.trim())           errs.endPoint = 'End point is required';
    if (!form.altitude.max)              errs.altMax = 'Maximum altitude is required';
    if (!form.duration.nights)           errs.nights = 'Number of nights is required';
    if (!form.duration.days)             errs.days = 'Number of days is required';
  }
  return errs;
}

export default function AdminTreks() {
  const [treks, setTreks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [step, setStep] = useState(0);
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  useModalBehavior(showForm, () => setShowForm(false), saving);
  const [dragOver, setDragOver] = useState(false);

  useEffect(() => { load(); }, []);

  const load = () => {
    setLoading(true);
    api.adminGetTreks().then(setTreks).catch(() => {}).finally(() => setLoading(false));
  };

  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm);
    setStep(0);
    setErrors({});
    setShowForm(true);
  };

  const openEdit = (trek) => {
    setEditing(trek._id);
    setForm({
      name: trek.name || '',
      slug: trek.slug || '',
      overview: trek.overview || '',
      description: trek.description || '',
      coverImage: trek.coverImage || '',
      images: trek.images || [],
      duration: trek.duration || { nights: 5, days: 6 },
      altitude: trek.altitude || { min: 0, max: 3000 },
      distance: trek.distance || { total: 50 },
      difficulty: trek.difficulty || 'moderate',
      fitnessLevel: trek.fitnessLevel || 'intermediate',
      pricing: { perPerson: trek.pricing?.perPerson || '' },
      startPoint: trek.startPoint || '',
      endPoint: trek.endPoint || '',
      groupSize: trek.groupSize || { min: 4, max: 12 },
      bestSeason: (trek.bestSeason || []).join(', '),
      highlights: (trek.highlights || []).join('\n'),
      isFeatured: trek.isFeatured || false,
      itinerary: trek.itinerary?.length > 0 ? trek.itinerary : [{ day: 1, title: '', description: '', distance: '', altitude: '', duration: '' }],
      inclusions: (trek.inclusions || []).join('\n'),
      exclusions: (trek.exclusions || []).join('\n'),
      whatToBring: (trek.whatToBring || []).join('\n'),
    });
    setStep(0);
    setErrors({});
    setShowForm(true);
  };

  const handleNext = () => {
    for (let sIdx = 0; sIdx < STEPS.length; sIdx++) {
      const errs = validateStep(sIdx, form);
      if (Object.keys(errs).length > 0) { setErrors(errs); setStep(sIdx); return; }
    }
    setErrors({});
    setStep(s => s + 1);
  };

  const handleBack = () => { setErrors({}); setStep(s => s - 1); };

  const handleSubmit = async (e) => {
    if (saving) return;
    e.preventDefault();
    for (let sIdx = 0; sIdx < STEPS.length; sIdx++) {
      const errs = validateStep(sIdx, form);
      if (Object.keys(errs).length > 0) { setErrors(errs); setStep(sIdx); return; }
    }
    setSaving(true);
    const updatedCoverImage = form.images.length > 0 ? form.images[0] : form.coverImage;
    const payload = {
      ...form,
      coverImage: updatedCoverImage,
      highlights: form.highlights.split('\n').filter(Boolean),
      inclusions: form.inclusions.split('\n').filter(Boolean),
      exclusions: form.exclusions.split('\n').filter(Boolean),
      whatToBring: form.whatToBring.split('\n').filter(Boolean),
      bestSeason: form.bestSeason.split(',').map(s => s.trim()).filter(Boolean),
      pricing: { perPerson: Number(form.pricing.perPerson) },
      itinerary: form.itinerary.filter(d => d.title || d.description),
    };
    try {
      if (editing) await api.adminUpdateTrek(editing, payload);
      else         await api.adminCreateTrek(payload);
      setShowForm(false);
      setEditing(null);
      setForm(emptyForm);
      load();
    } catch (err) {
      setErrors({ submit: err.message || 'Failed to save trek. Please try again.' });
    } finally {
      setSaving(false);
    }
  };

  const [deleteTarget, setDeleteTarget] = useState(null);

  const handleDelete = async () => {
    await api.adminDeleteTrek(deleteTarget._id);
    setDeleteTarget(null);
    load();
  };

  const addItineraryDay = () =>
    setForm(f => ({ ...f, itinerary: [...f.itinerary, { day: f.itinerary.length + 1, title: '', description: '', distance: '', altitude: '', duration: '' }] }));

  const removeItineraryDay = (idx) => {
    const updated = form.itinerary.filter((_, i) => i !== idx).map((d, i) => ({ ...d, day: i + 1 }));
    setForm(f => ({ ...f, itinerary: updated }));
  };

  const updateItineraryDay = (idx, field, value) => {
    const updated = [...form.itinerary];
    updated[idx] = { ...updated[idx], [field]: value };
    setForm(f => ({ ...f, itinerary: updated }));
  };

  const handleImageFiles = (files) => {
    const imgs = Array.from(files).filter(f => f.type.startsWith('image/')).slice(0, 4 - form.images.length);
    const oversized = imgs.filter(f => f.size > 3 * 1024 * 1024);
    if (oversized.length > 0) { alert(`${oversized.length} image(s) exceed 3 MB and were skipped`); }
    const valid = imgs.filter(f => f.size <= 3 * 1024 * 1024);
    valid.forEach((file, idx) => {
      const reader = new FileReader();
      reader.onload = (e) => setForm(prev => {
        const newImages = [...prev.images, e.target.result];
        return { ...prev, images: newImages, coverImage: prev.coverImage || newImages[0] };
      });
      reader.readAsDataURL(file);
    });
  };

  const isLastStep = step === STEPS.length - 1;

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 md:mb-8">
        <div>
          <h1 className="text-2xl md:text-3xl text-slate-900 font-bold">Treks</h1>
          <p className="text-slate-600 mt-1 text-sm">Manage trekking routes</p>
        </div>
        <button onClick={openCreate} className="bg-[#C2410C] hover:bg-[#9A3412] text-white px-5 py-2.5 rounded-xl font-bold text-sm flex items-center gap-2 shadow-sm self-start sm:self-auto shrink-0">
          <span className="material-icons text-sm">add</span> Add Trek
        </button>
      </div>

      {/* Form Modal */}
      {showForm && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-start sm:items-center justify-center p-4 overflow-y-auto"
          onClick={() => { if (!saving) setShowForm(false); }}
          role="dialog"
          aria-modal="true"
        >
          <div className="bg-white border border-slate-200 rounded-2xl shadow-xl w-full max-w-6xl my-8" onClick={e => e.stopPropagation()}>

            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-slate-200">
              <h2 className="text-xl text-slate-900 font-bold">{editing ? 'Edit Trek' : 'New Trek'}</h2>
              <button type="button" aria-label="Close modal" onClick={() => setShowForm(false)} className="p-1.5 hover:bg-slate-100 rounded-lg transition-colors text-slate-500">
                <span className="material-icons">close</span>
              </button>
            </div>

            {/* Step Indicator */}
            <div className="px-6 py-4 border-b border-slate-200 overflow-x-auto">
              <div className="flex items-center gap-0 min-w-[440px]">
                {STEPS.map((s, i) => (
                  <div key={s.id} className="flex items-center flex-1 last:flex-none">
                    <button
                      type="button"
                      onClick={() => {
                        if (i > step) {
                          for (let sIdx = step; sIdx < i; sIdx++) {
                            const errs = validateStep(sIdx, form);
                            if (Object.keys(errs).length > 0) { setErrors(errs); setStep(sIdx); return; }
                          }
                        }
                        setErrors({}); setStep(i);
                      }}
                      className="flex flex-col items-center gap-1 group"
                    >
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                        i < step ? 'bg-green-500 text-white' : i === step ? 'bg-[#C2410C] text-white ring-4 ring-[#FF8C00]/20' : 'bg-slate-200 text-slate-700'
                      }`}>
                        {i < step ? <span className="material-icons text-[16px]">check</span> : i + 1}
                      </div>
                      <span className={`text-xs font-semibold whitespace-nowrap ${i === step ? 'text-[#C2410C]' : i < step ? 'text-emerald-700' : 'text-slate-500'}`}>
                        {s.label}
                      </span>
                    </button>
                    {i < STEPS.length - 1 && (
                      <div className={`flex-1 h-0.5 mx-2 mb-5 transition-colors ${i < step ? 'bg-green-500' : 'bg-slate-100'}`} />
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Step Content */}
            <div className="px-6 md:px-8 py-6 max-h-[68vh] overflow-y-auto">

              {/* Step 0 – Basic Info */}
              {step === 0 && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-[13px] font-bold text-slate-700 uppercase block mb-1">Trek Name <span className="text-red-600">*</span></label>
                      <input value={form.name} onChange={e => setForm(f => ({...f, name: e.target.value}))}
                        className={inputCls(errors.name)} placeholder="e.g., Kashmir Great Lakes" />
                      <ErrMsg msg={errors.name} />
                    </div>
                    <div>
                      <label className="text-[13px] font-bold text-slate-700 uppercase block mb-1">URL Slug <span className="text-red-600">*</span></label>
                      <input value={form.slug} onChange={e => setForm(f => ({...f, slug: e.target.value}))}
                        className={inputCls(errors.slug)} placeholder="kashmir-great-lakes" />
                      <ErrMsg msg={errors.slug} />
                    </div>
                  </div>
                  <div>
                    <label className="text-[13px] font-bold text-slate-700 uppercase block mb-1">Overview <span className="text-red-600">*</span></label>
                    <textarea rows={2} value={form.overview} onChange={e => setForm(f => ({...f, overview: e.target.value}))}
                      className={inputCls(errors.overview)} placeholder="One-line summary of the trek" />
                    <ErrMsg msg={errors.overview} />
                  </div>
                  <div>
                    <label className="text-[13px] font-bold text-slate-700 uppercase block mb-1">Description <span className="text-red-600">*</span></label>
                    <textarea rows={4} value={form.description} onChange={e => setForm(f => ({...f, description: e.target.value}))}
                      className={inputCls(errors.description)} placeholder="Detailed description of the trek experience" />
                    <ErrMsg msg={errors.description} />
                  </div>
                  <SingleImageUpload
                    label="Cover Image"
                    value={form.coverImage}
                    onChange={(val) => setForm(f => ({ ...f, coverImage: val }))}
                    required
                    error={errors.coverImage}
                  />
                </div>
              )}

              {/* Step 1 – Images */}
              {step === 1 && (
                <div className="space-y-4">
                  <div
                    onDrop={(e) => { e.preventDefault(); setDragOver(false); handleImageFiles(e.dataTransfer.files); }}
                    onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                    onDragLeave={() => setDragOver(false)}
                    className={`border-2 border-dashed rounded-xl p-8 text-center transition-colors ${
                      form.images.length >= 4 ? 'opacity-50 pointer-events-none border-slate-300 bg-slate-100/20' :
                      dragOver ? 'border-[#FF8C00] bg-[#FF8C00]/5' : 'border-slate-300 bg-slate-50 hover:border-slate-400'
                    }`}
                  >
                    <span className="material-icons text-5xl text-slate-400 mb-3 block">cloud_upload</span>
                    <p className="text-slate-600 font-semibold mb-1">
                      {form.images.length >= 4 ? 'Maximum 4 images reached' : 'Drag & drop images here'}
                    </p>
                    <p className="text-slate-400 text-xs mb-4">PNG, JPG, WEBP (max 3 MB each)</p>
                    <label className="inline-block bg-[#C2410C] hover:bg-[#9A3412] text-white px-5 py-2 rounded-lg font-semibold cursor-pointer text-sm">
                      Browse Files
                      <input type="file" multiple accept="image/*" onChange={e => { handleImageFiles(e.target.files); e.target.value = ''; }} className="hidden" disabled={form.images.length >= 4} />
                    </label>
                    <p className="text-slate-500 text-xs mt-3">{form.images.length} / 4 images added</p>
                  </div>
                  {form.images.length > 0 && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {form.images.map((img, i) => (
                        <div key={i} className="relative group rounded-xl overflow-hidden border border-slate-300 aspect-video">
                          <img src={img} alt="" className="w-full h-full object-cover" />
                          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <button type="button" onClick={() => setForm(f => { const newImages = f.images.filter((_, idx) => idx !== i); return { ...f, images: newImages, coverImage: newImages[0] || '' }; })}
                              className="bg-red-600 hover:bg-red-700 text-white px-3 py-1.5 rounded-lg text-sm font-semibold flex items-center gap-1.5">
                              <span className="material-icons text-[16px]">delete</span> Remove
                            </button>
                          </div>
                          <div className="absolute top-2 left-2 bg-black/60 text-white px-2 py-0.5 rounded text-xs font-bold">
                            {i + 1}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Step 2 – Trek Details */}
              {step === 2 && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-[13px] font-bold text-slate-700 uppercase block mb-1">Start Point <span className="text-red-600">*</span></label>
                      <input value={form.startPoint} onChange={e => setForm(f => ({...f, startPoint: e.target.value}))}
                        className={inputCls(errors.startPoint)} placeholder="e.g., Sonamarg" />
                      <ErrMsg msg={errors.startPoint} />
                    </div>
                    <div>
                      <label className="text-[13px] font-bold text-slate-700 uppercase block mb-1">End Point <span className="text-red-600">*</span></label>
                      <input value={form.endPoint} onChange={e => setForm(f => ({...f, endPoint: e.target.value}))}
                        className={inputCls(errors.endPoint)} placeholder="e.g., Naranag" />
                      <ErrMsg msg={errors.endPoint} />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div>
                      <label className="text-[13px] font-bold text-slate-700 uppercase block mb-1">Nights <span className="text-red-600">*</span></label>
                      <input type="number" min="1" value={form.duration.nights} onChange={e => setForm(f => ({...f, duration: {...f.duration, nights: Number(e.target.value)}}))}
                        className={inputCls(errors.nights)} />
                      <ErrMsg msg={errors.nights} />
                    </div>
                    <div>
                      <label className="text-[13px] font-bold text-slate-700 uppercase block mb-1">Days <span className="text-red-600">*</span></label>
                      <input type="number" min="1" value={form.duration.days} onChange={e => setForm(f => ({...f, duration: {...f.duration, days: Number(e.target.value)}}))}
                        className={inputCls(errors.days)} />
                      <ErrMsg msg={errors.days} />
                    </div>
                    <div>
                      <label className="text-[13px] font-bold text-slate-700 uppercase block mb-1">Min Alt (m)</label>
                      <input type="number" value={form.altitude.min} onChange={e => setForm(f => ({...f, altitude: {...f.altitude, min: Number(e.target.value)}}))}
                        className={inputCls()} />
                    </div>
                    <div>
                      <label className="text-[13px] font-bold text-slate-700 uppercase block mb-1">Max Alt (m) <span className="text-red-600">*</span></label>
                      <input type="number" value={form.altitude.max} onChange={e => setForm(f => ({...f, altitude: {...f.altitude, max: Number(e.target.value)}}))}
                        className={inputCls(errors.altMax)} />
                      <ErrMsg msg={errors.altMax} />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div>
                      <label className="text-[13px] font-bold text-slate-700 uppercase block mb-1">Distance (km)</label>
                      <input type="number" value={form.distance.total} onChange={e => setForm(f => ({...f, distance: {...f.distance, total: Number(e.target.value)}}))}
                        className={inputCls()} />
                    </div>
                    <div>
                      <label className="text-[13px] font-bold text-slate-700 uppercase block mb-1">Difficulty</label>
                      <select value={form.difficulty} onChange={e => setForm(f => ({...f, difficulty: e.target.value}))} className={inputCls()}>
                        <option value="easy">Easy</option>
                        <option value="moderate">Moderate</option>
                        <option value="difficult">Difficult</option>
                        <option value="challenging">Challenging</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-[13px] font-bold text-slate-700 uppercase block mb-1">Fitness</label>
                      <select value={form.fitnessLevel} onChange={e => setForm(f => ({...f, fitnessLevel: e.target.value}))} className={inputCls()}>
                        <option value="beginner">Beginner</option>
                        <option value="intermediate">Intermediate</option>
                        <option value="advanced">Advanced</option>
                      </select>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="text-[13px] font-bold text-slate-700 uppercase block mb-1">Min Group</label>
                      <input type="number" value={form.groupSize.min} onChange={e => setForm(f => ({...f, groupSize: {...f.groupSize, min: Number(e.target.value)}}))} className={inputCls()} />
                    </div>
                    <div>
                      <label className="text-[13px] font-bold text-slate-700 uppercase block mb-1">Max Group</label>
                      <input type="number" value={form.groupSize.max} onChange={e => setForm(f => ({...f, groupSize: {...f.groupSize, max: Number(e.target.value)}}))} className={inputCls()} />
                    </div>
                    <div>
                      <label className="text-[13px] font-bold text-slate-700 uppercase block mb-1">Best Season</label>
                      <input value={form.bestSeason} onChange={e => setForm(f => ({...f, bestSeason: e.target.value}))} placeholder="June, July, August" className={inputCls()} />
                    </div>
                  </div>
                  <div>
                    <label className="text-[13px] font-bold text-slate-700 uppercase block mb-1">Highlights (one per line)</label>
                    <textarea rows={3} value={form.highlights} onChange={e => setForm(f => ({...f, highlights: e.target.value}))}
                      placeholder="7 Alpine Lakes&#10;Meadows&#10;Mountain Passes" className={inputCls()} />
                  </div>
                  <div className="flex items-center gap-2 p-3 bg-slate-100/40 rounded-lg">
                    <input type="checkbox" id="featured" checked={form.isFeatured} onChange={e => setForm(f => ({...f, isFeatured: e.target.checked}))} className="w-4 h-4 accent-[#FF8C00]" />
                    <label htmlFor="featured" className="text-sm text-slate-600 cursor-pointer">Mark as Featured Trek</label>
                  </div>
                </div>
              )}

              {/* Step 3 – Itinerary */}
              {step === 3 && (
                <div className="space-y-3">
                  {form.itinerary.map((day, idx) => (
                    <div key={idx} className="bg-slate-100/50 border border-slate-300 rounded-xl p-4">
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-sm font-bold text-[#C2410C] flex items-center gap-2">
                          <span className="bg-amber-100 text-amber-900 border border-amber-300 px-2 py-0.5 rounded-full text-xs">Day {day.day}</span>
                        </span>
                        {form.itinerary.length > 1 && (
                          <button type="button" onClick={() => removeItineraryDay(idx)}
                            className="text-red-600 hover:text-red-800 text-xs flex items-center gap-1">
                            <span className="material-icons text-[15px]">delete</span> Remove
                          </button>
                        )}
                      </div>
                      <div className="space-y-3">
                        <input value={day.title} onChange={e => updateItineraryDay(idx, 'title', e.target.value)}
                          placeholder="Day title, e.g., Sonamarg to Nichnai" className={inputCls()} />
                        <textarea rows={2} value={day.description} onChange={e => updateItineraryDay(idx, 'description', e.target.value)}
                          placeholder="Describe the day's trek" className={inputCls()} />
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                          <input value={day.distance} onChange={e => updateItineraryDay(idx, 'distance', e.target.value)}
                            placeholder="Distance, e.g. 11 km" className={inputCls()} />
                          <input value={day.altitude} onChange={e => updateItineraryDay(idx, 'altitude', e.target.value)}
                            placeholder="Altitude, e.g. 11500 ft" className={inputCls()} />
                          <input value={day.duration} onChange={e => updateItineraryDay(idx, 'duration', e.target.value)}
                            placeholder="Duration, e.g. 5-6 hrs" className={inputCls()} />
                        </div>
                      </div>
                    </div>
                  ))}
                  <button type="button" onClick={addItineraryDay}
                    className="w-full bg-slate-100 hover:bg-slate-200 border border-dashed border-slate-300 text-slate-600 px-4 py-2.5 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 transition-colors">
                    <span className="material-icons text-[18px]">add</span> Add Day
                  </button>
                </div>
              )}

              {/* Step 4 – Extras */}
              {step === 4 && (
                <div className="space-y-4">
                  <div>
                    <label className="text-[13px] font-bold text-slate-700 uppercase block mb-1">
                      <span className="material-icons text-emerald-700 text-[14px] align-middle mr-1">add_circle</span>
                      Inclusions <span className="text-slate-400 normal-case font-normal">(one per line)</span>
                    </label>
                    <textarea rows={4} value={form.inclusions} onChange={e => setForm(f => ({...f, inclusions: e.target.value}))}
                      placeholder="Trek Guide&#10;Camping Equipment&#10;All Meals&#10;Permits & Fees" className={inputCls()} />
                  </div>
                  <div>
                    <label className="text-[13px] font-bold text-slate-700 uppercase block mb-1">
                      <span className="material-icons text-red-600 text-[14px] align-middle mr-1">remove_circle</span>
                      Exclusions <span className="text-slate-400 normal-case font-normal">(one per line)</span>
                    </label>
                    <textarea rows={3} value={form.exclusions} onChange={e => setForm(f => ({...f, exclusions: e.target.value}))}
                      placeholder="Airfare&#10;Personal Expenses&#10;Travel Insurance" className={inputCls()} />
                  </div>
                  <div>
                    <label className="text-[13px] font-bold text-slate-700 uppercase block mb-1">
                      <span className="material-icons text-blue-700 text-[14px] align-middle mr-1">backpack</span>
                      What to Bring <span className="text-slate-400 normal-case font-normal">(one per line)</span>
                    </label>
                    <textarea rows={4} value={form.whatToBring} onChange={e => setForm(f => ({...f, whatToBring: e.target.value}))}
                      placeholder="Warm Sleeping Bag&#10;Trekking Poles&#10;Rain Jacket&#10;Sunscreen" className={inputCls()} />
                  </div>
                </div>
              )}
            </div>

            {/* Footer – Navigation + Submit */}
            <div className="px-6 py-4 border-t border-slate-200 bg-slate-50 rounded-b-2xl">
              {errors.submit && (
                <div className="mb-3 flex items-center gap-2 bg-red-50 border border-red-200 text-red-600 px-4 py-2.5 rounded-lg text-sm">
                  <span className="material-icons text-[18px]">error_outline</span>
                  {errors.submit}
                </div>
              )}
              <div className="flex items-center justify-between gap-3">
                <button type="button" onClick={step === 0 ? () => setShowForm(false) : handleBack}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-slate-300 text-slate-600 hover:bg-slate-100 transition-colors text-sm font-semibold">
                  <span className="material-icons text-[18px]">{step === 0 ? 'close' : 'arrow_back'}</span>
                  {step === 0 ? 'Cancel' : 'Back'}
                </button>

                <div className="flex items-center gap-2 text-xs text-slate-500">
                  Step {step + 1} of {STEPS.length}
                </div>

                {isLastStep ? (
                  <button type="button" onClick={handleSubmit} disabled={saving}
                    className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 disabled:opacity-50 text-white font-bold text-sm transition-colors">
                    {saving ? (
                      <><span className="material-icons animate-spin text-[18px]">refresh</span> Saving...</>
                    ) : (
                      <><span className="material-icons text-[18px]">{editing ? 'save' : 'add_circle'}</span> {editing ? 'Update Trek' : 'Create Trek'}</>
                    )}
                  </button>
                ) : (
                  <button type="button" onClick={handleNext}
                    className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#C2410C] hover:bg-[#9A3412] text-white font-bold text-sm transition-colors shadow-sm">
                    Next <span className="material-icons text-[18px]">arrow_forward</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Trek Table */}
      {loading ? (
        <div className="text-center py-20 text-slate-600">Loading...</div>
      ) : treks.length === 0 ? (
        <div className="text-center py-20 text-slate-500">
          <span className="material-icons text-5xl mb-3 block opacity-30">terrain</span>
          No treks yet. Click "Add Trek" to create your first one.
        </div>
      ) : (
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-slate-500 border-b border-slate-200 bg-slate-50">
                <th className="px-4 py-3 font-bold text-slate-500 text-sm">Trek</th>
                <th className="px-4 py-3 font-bold text-slate-500 text-sm">Duration</th>
                <th className="px-4 py-3 font-bold text-slate-500 text-sm">Difficulty</th>
                <th className="px-4 py-3 font-bold text-slate-500 text-sm">Altitude</th>
                <th className="px-4 py-3 font-bold text-slate-500 text-sm text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {treks.map(trek => (
                <tr key={trek._id} className="border-b border-slate-200 hover:bg-slate-100/70 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <img src={trek.coverImage} alt="" className="w-10 h-10 rounded-lg object-cover flex-shrink-0" />
                      <div>
                        <p className="font-bold text-slate-900">{trek.name}</p>
                        <p className="text-[13px] text-slate-600">{trek.startPoint} → {trek.endPoint}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-slate-500">{trek.duration.nights}N / {trek.duration.days}D</td>
                  <td className="px-4 py-3 capitalize">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                      trek.difficulty === 'easy' ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' :
                      trek.difficulty === 'moderate' ? 'bg-amber-100 text-amber-800 border border-amber-300' :
                      trek.difficulty === 'difficult' ? 'bg-orange-100 text-orange-900 border border-orange-300' :
                      'bg-red-100 text-red-800 border border-red-300'
                    }`}>{trek.difficulty}</span>
                  </td>
                  <td className="px-4 py-3 text-slate-500">{trek.altitude.max}m</td>
                  <td className="px-4 py-3 text-right">
                    <button onClick={() => openEdit(trek)} className="text-[#C2410C] hover:text-[#9A3412] mr-3 transition-colors">
                      <span className="material-icons text-[18px]">edit</span>
                    </button>
                    <button onClick={() => setDeleteTarget(trek)} className="text-red-600 hover:text-red-600 transition-colors">
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
        itemName={deleteTarget?.name || 'this trek'}
      />
    </div>
  );
}
