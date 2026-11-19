import { useState, useEffect } from 'react';
import api from '../../api';
import useModalBehavior from '../../hooks/useModalBehavior';
import DeleteConfirmModal from '../../components/admin/DeleteConfirmModal';
import SingleImageUpload from '../../components/admin/SingleImageUpload';
import AdminCard from '../../components/admin/AdminCard';
import AdminStepModal from '../../components/admin/AdminStepModal';

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
  `w-full bg-slate-950 border rounded-lg px-4 py-2.5 text-[15px] text-slate-100 transition-colors outline-none ${
    err ? 'border-red-400 focus:border-red-500' : 'border-slate-700 focus:border-[#C2410C] focus:ring-2 focus:ring-orange-500/20'
  }`;

const ErrMsg = ({ msg }) =>
  msg ? (
    <p className="mt-1 text-xs text-red-400 flex items-center gap-1">
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
          <h1 className="text-2xl md:text-3xl text-slate-100 font-bold">Treks</h1>
          <p className="text-slate-300 mt-1 text-sm">Manage trekking routes</p>
        </div>
        <button onClick={openCreate} className="bg-[#C2410C] hover:bg-[#9A3412] text-white px-5 py-2.5 rounded-xl font-bold text-sm flex items-center gap-2 shadow-sm self-start sm:self-auto shrink-0">
          <span className="material-icons text-sm">add</span> Add Trek
        </button>
      </div>

      {/* Form Modal */}
      <AdminStepModal
        isOpen={showForm}
        onClose={() => setShowForm(false)}
        title={editing ? 'Edit Trek' : 'New Trek'}
        subtitle={editing ? form.name : null}
        steps={STEPS}
        step={step}
        onStepClick={(i) => {
          if (i > step) {
            for (let sIdx = step; sIdx < i; sIdx++) {
              const errs = validateStep(sIdx, form);
              if (Object.keys(errs).length > 0) { setErrors(errs); setStep(sIdx); return; }
            }
          }
          setErrors({}); setStep(i);
        }}
        onBack={handleBack}
        onNext={handleNext}
        onSubmit={handleSubmit}
        saving={saving}
        submitError={errors.submit}
        submitLabel={editing ? 'Update Trek' : 'Create Trek'}
      >

              {/* Step 0 – Basic Info */}
              {step === 0 && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-[13px] font-bold text-slate-200 uppercase block mb-1">Trek Name <span className="text-red-400">*</span></label>
                      <input value={form.name} onChange={e => setForm(f => ({...f, name: e.target.value}))}
                        className={inputCls(errors.name)} placeholder="e.g., Kashmir Great Lakes" />
                      <ErrMsg msg={errors.name} />
                    </div>
                    <div>
                      <label className="text-[13px] font-bold text-slate-200 uppercase block mb-1">URL Slug <span className="text-red-400">*</span></label>
                      <input value={form.slug} onChange={e => setForm(f => ({...f, slug: e.target.value}))}
                        className={inputCls(errors.slug)} placeholder="kashmir-great-lakes" />
                      <ErrMsg msg={errors.slug} />
                    </div>
                  </div>
                  <div>
                    <label className="text-[13px] font-bold text-slate-200 uppercase block mb-1">Overview <span className="text-red-400">*</span></label>
                    <textarea rows={2} value={form.overview} onChange={e => setForm(f => ({...f, overview: e.target.value}))}
                      className={inputCls(errors.overview)} placeholder="One-line summary of the trek" />
                    <ErrMsg msg={errors.overview} />
                  </div>
                  <div>
                    <label className="text-[13px] font-bold text-slate-200 uppercase block mb-1">Description <span className="text-red-400">*</span></label>
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
                    className={`border-2 border-dashed rounded-xl p-5 sm:p-8 text-center transition-colors ${
                      form.images.length >= 4 ? 'opacity-50 pointer-events-none border-slate-700 bg-slate-800/20' :
                      dragOver ? 'border-[#FF8C00] bg-[#FF8C00]/5' : 'border-slate-700 bg-slate-950/60 hover:border-slate-400'
                    }`}
                  >
                    <span className="material-icons text-5xl text-slate-300 mb-3 block">cloud_upload</span>
                    <p className="text-slate-300 font-semibold mb-1">
                      {form.images.length >= 4 ? 'Maximum 4 images reached' : 'Drag & drop images here'}
                    </p>
                    <p className="text-slate-300 text-xs mb-4">PNG, JPG, WEBP (max 3 MB each)</p>
                    <label className="inline-block bg-[#C2410C] hover:bg-[#9A3412] text-white px-5 py-2 rounded-lg font-semibold cursor-pointer text-sm">
                      Browse Files
                      <input type="file" multiple accept="image/*" onChange={e => { handleImageFiles(e.target.files); e.target.value = ''; }} className="hidden" disabled={form.images.length >= 4} />
                    </label>
                    <p className="text-slate-300 text-xs mt-3">{form.images.length} / 4 images added</p>
                  </div>
                  {form.images.length > 0 && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {form.images.map((img, i) => (
                        <div key={i} className="relative group rounded-xl overflow-hidden border border-slate-700 aspect-video">
                          <img src={img} alt="" className="w-full h-full object-cover" />
                          <div className="absolute inset-0 bg-black/50 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity flex items-center justify-center">
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
                      <label className="text-[13px] font-bold text-slate-200 uppercase block mb-1">Start Point <span className="text-red-400">*</span></label>
                      <input value={form.startPoint} onChange={e => setForm(f => ({...f, startPoint: e.target.value}))}
                        className={inputCls(errors.startPoint)} placeholder="e.g., Sonamarg" />
                      <ErrMsg msg={errors.startPoint} />
                    </div>
                    <div>
                      <label className="text-[13px] font-bold text-slate-200 uppercase block mb-1">End Point <span className="text-red-400">*</span></label>
                      <input value={form.endPoint} onChange={e => setForm(f => ({...f, endPoint: e.target.value}))}
                        className={inputCls(errors.endPoint)} placeholder="e.g., Naranag" />
                      <ErrMsg msg={errors.endPoint} />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="text-[13px] font-bold text-slate-200 uppercase block mb-1">Nights <span className="text-red-400">*</span></label>
                      <input type="number" min="1" value={form.duration.nights} onChange={e => setForm(f => ({...f, duration: {...f.duration, nights: Number(e.target.value)}}))}
                        className={inputCls(errors.nights)} />
                      <ErrMsg msg={errors.nights} />
                    </div>
                    <div>
                      <label className="text-[13px] font-bold text-slate-200 uppercase block mb-1">Days <span className="text-red-400">*</span></label>
                      <input type="number" min="1" value={form.duration.days} onChange={e => setForm(f => ({...f, duration: {...f.duration, days: Number(e.target.value)}}))}
                        className={inputCls(errors.days)} />
                      <ErrMsg msg={errors.days} />
                    </div>
                    <div>
                      <label className="text-[13px] font-bold text-slate-200 uppercase block mb-1">Min Alt (m)</label>
                      <input type="number" value={form.altitude.min} onChange={e => setForm(f => ({...f, altitude: {...f.altitude, min: Number(e.target.value)}}))}
                        className={inputCls()} />
                    </div>
                    <div>
                      <label className="text-[13px] font-bold text-slate-200 uppercase block mb-1">Max Alt (m) <span className="text-red-400">*</span></label>
                      <input type="number" value={form.altitude.max} onChange={e => setForm(f => ({...f, altitude: {...f.altitude, max: Number(e.target.value)}}))}
                        className={inputCls(errors.altMax)} />
                      <ErrMsg msg={errors.altMax} />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div>
                      <label className="text-[13px] font-bold text-slate-200 uppercase block mb-1">Distance (km)</label>
                      <input type="number" value={form.distance.total} onChange={e => setForm(f => ({...f, distance: {...f.distance, total: Number(e.target.value)}}))}
                        className={inputCls()} />
                    </div>
                    <div>
                      <label className="text-[13px] font-bold text-slate-200 uppercase block mb-1">Difficulty</label>
                      <select value={form.difficulty} onChange={e => setForm(f => ({...f, difficulty: e.target.value}))} className={inputCls()}>
                        <option value="easy">Easy</option>
                        <option value="moderate">Moderate</option>
                        <option value="difficult">Difficult</option>
                        <option value="challenging">Challenging</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-[13px] font-bold text-slate-200 uppercase block mb-1">Fitness</label>
                      <select value={form.fitnessLevel} onChange={e => setForm(f => ({...f, fitnessLevel: e.target.value}))} className={inputCls()}>
                        <option value="beginner">Beginner</option>
                        <option value="intermediate">Intermediate</option>
                        <option value="advanced">Advanced</option>
                      </select>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="text-[13px] font-bold text-slate-200 uppercase block mb-1">Min Group</label>
                      <input type="number" value={form.groupSize.min} onChange={e => setForm(f => ({...f, groupSize: {...f.groupSize, min: Number(e.target.value)}}))} className={inputCls()} />
                    </div>
                    <div>
                      <label className="text-[13px] font-bold text-slate-200 uppercase block mb-1">Max Group</label>
                      <input type="number" value={form.groupSize.max} onChange={e => setForm(f => ({...f, groupSize: {...f.groupSize, max: Number(e.target.value)}}))} className={inputCls()} />
                    </div>
                    <div>
                      <label className="text-[13px] font-bold text-slate-200 uppercase block mb-1">Best Season</label>
                      <input value={form.bestSeason} onChange={e => setForm(f => ({...f, bestSeason: e.target.value}))} placeholder="June, July, August" className={inputCls()} />
                    </div>
                  </div>
                  <div>
                    <label className="text-[13px] font-bold text-slate-200 uppercase block mb-1">Highlights (one per line)</label>
                    <textarea rows={3} value={form.highlights} onChange={e => setForm(f => ({...f, highlights: e.target.value}))}
                      placeholder="7 Alpine Lakes&#10;Meadows&#10;Mountain Passes" className={inputCls()} />
                  </div>
                  <div className="flex items-center gap-2 p-3 bg-slate-800/40 rounded-lg">
                    <input type="checkbox" id="featured" checked={form.isFeatured} onChange={e => setForm(f => ({...f, isFeatured: e.target.checked}))} className="w-4 h-4 accent-[#FF8C00]" />
                    <label htmlFor="featured" className="text-sm text-slate-300 cursor-pointer">Mark as Featured Trek</label>
                  </div>
                </div>
              )}

              {/* Step 3 – Itinerary */}
              {step === 3 && (
                <div className="space-y-3">
                  {form.itinerary.map((day, idx) => (
                    <div key={idx} className="bg-slate-800/50 border border-slate-700 rounded-xl p-4">
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-sm font-bold text-[#C2410C] flex items-center gap-2">
                          <span className="bg-amber-500/15 text-amber-300 border border-amber-500/30 px-2 py-0.5 rounded-full text-xs">Day {day.day}</span>
                        </span>
                        {form.itinerary.length > 1 && (
                          <button type="button" onClick={() => removeItineraryDay(idx)}
                            className="text-red-400 hover:text-red-300 text-xs flex items-center gap-1">
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
                    className="w-full bg-slate-800 hover:bg-slate-700 border border-dashed border-slate-700 text-slate-300 px-4 py-2.5 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 transition-colors">
                    <span className="material-icons text-[18px]">add</span> Add Day
                  </button>
                </div>
              )}

              {/* Step 4 – Extras */}
              {step === 4 && (
                <div className="space-y-4">
                  <div>
                    <label className="text-[13px] font-bold text-slate-200 uppercase block mb-1">
                      <span className="material-icons text-emerald-400 text-[14px] align-middle mr-1">add_circle</span>
                      Inclusions <span className="text-slate-300 normal-case font-normal">(one per line)</span>
                    </label>
                    <textarea rows={4} value={form.inclusions} onChange={e => setForm(f => ({...f, inclusions: e.target.value}))}
                      placeholder="Trek Guide&#10;Camping Equipment&#10;All Meals&#10;Permits & Fees" className={inputCls()} />
                  </div>
                  <div>
                    <label className="text-[13px] font-bold text-slate-200 uppercase block mb-1">
                      <span className="material-icons text-red-400 text-[14px] align-middle mr-1">remove_circle</span>
                      Exclusions <span className="text-slate-300 normal-case font-normal">(one per line)</span>
                    </label>
                    <textarea rows={3} value={form.exclusions} onChange={e => setForm(f => ({...f, exclusions: e.target.value}))}
                      placeholder="Airfare&#10;Personal Expenses&#10;Travel Insurance" className={inputCls()} />
                  </div>
                  <div>
                    <label className="text-[13px] font-bold text-slate-200 uppercase block mb-1">
                      <span className="material-icons text-blue-400 text-[14px] align-middle mr-1">backpack</span>
                      What to Bring <span className="text-slate-300 normal-case font-normal">(one per line)</span>
                    </label>
                    <textarea rows={4} value={form.whatToBring} onChange={e => setForm(f => ({...f, whatToBring: e.target.value}))}
                      placeholder="Warm Sleeping Bag&#10;Trekking Poles&#10;Rain Jacket&#10;Sunscreen" className={inputCls()} />
                  </div>
                </div>
              )}
            
      </AdminStepModal>


      {/* Trek Table */}
      {loading ? (
        <div className="text-center py-20 text-slate-300">Loading...</div>
      ) : treks.length === 0 ? (
        <div className="text-center py-20 text-slate-300">
          <span className="material-icons text-5xl mb-3 block opacity-30">terrain</span>
          No treks yet. Click "Add Trek" to create your first one.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {treks.map(trek => (
            <AdminCard
              key={trek._id}
              image={trek.coverImage}
              title={trek.name}
              subtitle={trek.startPoint && trek.endPoint ? (trek.startPoint + ' → ' + trek.endPoint) : null}
              description={trek.description}
              topLeftBadges={[
                {
                  label: (trek.difficulty || 'moderate').toUpperCase(),
                  className:
                    trek.difficulty === 'easy'
                      ? 'bg-emerald-950/80 text-emerald-200 border border-emerald-400/40'
                      : trek.difficulty === 'moderate'
                      ? 'bg-amber-950/80 text-amber-200 border border-amber-400/40'
                      : 'bg-red-950/80 text-red-200 border border-red-400/40',
                },
              ]}
              topRightBadge={trek.altitude?.max ? (trek.altitude.max + ' m') : null}
              bannerBottomLeft={trek.duration ? (trek.duration.nights + 'N / ' + trek.duration.days + 'D') : null}
              bannerBottomRight={trek.slug ? ('/' + trek.slug) : null}
              tags={trek.bestSeason || []}
              tagsLabel="Best Season"
              onEdit={() => openEdit(trek)}
              onDelete={() => setDeleteTarget(trek)}
            />
          ))}
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
