import { useState, useEffect } from 'react';
import api from '../../api';
import useModalBehavior from '../../hooks/useModalBehavior';
import DeleteConfirmModal from '../../components/admin/DeleteConfirmModal';

const STEPS = [
  { id: 0, label: 'Basic Info', icon: 'info' },
  { id: 1, label: 'Image',      icon: 'image' },
  { id: 2, label: 'Details',    icon: 'sailing' },
  { id: 3, label: 'Services',   icon: 'room_service' },
  { id: 4, label: 'Extras',     icon: 'star' },
];

const inputCls = (err) =>
  `w-full bg-white border rounded-lg px-4 py-2.5 text-[15px] text-slate-900 transition-colors outline-none ${
    err ? 'border-red-400 focus:border-red-500' : 'border-slate-300 focus:border-[#C2410C] focus:ring-2 focus:ring-orange-500/20'
  }`;

const ErrMsg = ({ msg }) =>
  msg ? (
    <p className="mt-1 text-xs text-red-600 flex items-center gap-1">
      <span className="material-icons text-[14px]">error_outline</span>{msg}
    </p>
  ) : null;

function validateStep(step, form) {
  const errs = {};
  if (step === 0) {
    if (!form.name.trim())     errs.name     = 'Houseboat name is required';
    if (!form.slug.trim())     errs.slug     = 'URL slug is required';
    if (!form.location.trim()) errs.location = 'Location is required';
    if (!form.overview.trim()) errs.overview = 'Overview is required';
  }
  if (step === 1) {
    if (!form.coverImage.trim() && form.images.length === 0) errs.coverImage = 'At least one image is required';
  }
  if (step === 3) {
  }
  return errs;
}

const emptyForm = {
  name: '', slug: '', category: 'deluxe', description: '', overview: '', lake: 'dal-lake',
  location: '', pricing: { perNight: '', perWeek: '' }, rooms: { bedrooms: 2, bathrooms: 1, livingRooms: 1 },
  capacity: { guests: 4 }, mealsIncluded: { breakfast: true, lunch: false, dinner: true },
  amenities: '', features: '', coverImage: '', images: [], availability: 'available', shikaraRide: true, isFeatured: false
};

export default function AdminHouseboats() {
  const [houseboats, setHouseboats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  useModalBehavior(showForm, () => setShowForm(false), saving);
  const [step, setStep] = useState(0);
  const [errors, setErrors] = useState({});
  const [dragOver, setDragOver] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);

  useEffect(() => { load(); }, []);

  const load = () => {
    setLoading(true);
    api.adminGetHouseboats()
      .then(setHouseboats)
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  const openCreate = () => { setEditing(null); setForm(emptyForm); setStep(0); setErrors({}); setShowForm(true); };

  const openEdit = (houseboat) => {
    setEditing(houseboat._id);
    setForm({
      name: houseboat.name || '',
      slug: houseboat.slug || '',
      category: houseboat.category || 'deluxe',
      description: houseboat.description || '',
      overview: houseboat.overview || '',
      lake: houseboat.lake || 'dal-lake',
      location: houseboat.location || '',
      pricing: houseboat.pricing || { perNight: '', perWeek: '' },
      rooms: houseboat.rooms || { bedrooms: 2, bathrooms: 1, livingRooms: 1 },
      capacity: houseboat.capacity || { guests: 4 },
      mealsIncluded: houseboat.mealsIncluded || { breakfast: true, lunch: false, dinner: true },
      amenities: (houseboat.amenities || []).join(', '),
      features: (houseboat.features || []).join(', '),
      coverImage: houseboat.coverImage || '',
      images: houseboat.images || [],
      availability: houseboat.availability || 'available',
      shikaraRide: houseboat.shikaraRide !== undefined ? houseboat.shikaraRide : true,
      isFeatured: houseboat.isFeatured || false
    });
    setStep(0); setErrors({});
    setShowForm(true);
  };

  const handleNext = () => {
    for (let sIdx = 0; sIdx < STEPS.length; sIdx++) {
      const errs = validateStep(sIdx, form);
      if (Object.keys(errs).length > 0) { setErrors(errs); setStep(sIdx); return; }
    }
    setErrors({}); setStep(s => s + 1);
  };

  const handleBack = () => { setErrors({}); setStep(s => s - 1); };

  const handleImageFiles = (files) => {
    const imgs = Array.from(files).filter(f => f.type.startsWith('image/')).slice(0, 4 - form.images.length);
    const oversized = imgs.filter(f => f.size > 3 * 1024 * 1024);
    if (oversized.length > 0) { alert(`${oversized.length} image(s) exceed 3 MB and were skipped`); }
    const valid = imgs.filter(f => f.size <= 3 * 1024 * 1024);
    valid.forEach((file) => {
      const reader = new FileReader();
      reader.onload = (e) => setForm(prev => {
        const newImages = [...prev.images, e.target.result];
        return { ...prev, images: newImages, coverImage: newImages[0] };
      });
      reader.readAsDataURL(file);
    });
  };

  const isLastStep = step === STEPS.length - 1;

  const handleSubmit = async () => {
    if (saving) return;
    for (let sIdx = 0; sIdx < STEPS.length; sIdx++) {
      const errs = validateStep(sIdx, form);
      if (Object.keys(errs).length > 0) { setErrors(errs); setStep(sIdx); return; }
    }
    setSaving(true);
    const updatedCoverImage = form.images.length > 0 ? form.images[0] : form.coverImage;
    const payload = {
      ...form,
      coverImage: updatedCoverImage,
      amenities: form.amenities.split(',').map(s => s.trim()).filter(Boolean),
      features: form.features.split(',').map(s => s.trim()).filter(Boolean),
      pricing: {
        perNight: Number(form.pricing.perNight),
        perWeek: form.pricing.perWeek ? Number(form.pricing.perWeek) : undefined
      }
    };
    try {
      if (editing) {
        await api.adminUpdateHouseboat(editing, payload);
      } else {
        await api.adminCreateHouseboat(payload);
      }
      setShowForm(false);
      setEditing(null);
      setForm(emptyForm);
      load();
    } catch (err) {
      setErrors({ submit: err.message || 'Failed to save houseboat. Please try again.' });
    } finally { setSaving(false); }
  };

  const handleDelete = async () => {
    await api.adminDeleteHouseboat(deleteTarget._id);
    setDeleteTarget(null);
    load();
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 md:mb-8">
        <div>
          <h1 className="text-2xl md:text-3xl text-slate-900 font-bold">Houseboats</h1>
          <p className="text-slate-600 mt-1 text-sm">Manage houseboat listings</p>
        </div>
        <button onClick={openCreate} className="bg-[#C2410C] hover:bg-[#9A3412] text-white px-5 py-2.5 rounded-xl font-bold text-sm flex items-center gap-2 transition-all shadow-sm self-start sm:self-auto shrink-0">
          <span className="material-icons text-sm">add</span> Add Houseboat
        </button>
      </div>

      {showForm && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-start sm:items-center justify-center p-4 overflow-y-auto"
          onClick={() => { if (!saving) setShowForm(false); }}
          role="dialog"
          aria-modal="true"
        >
          <div className="bg-white border border-slate-200 rounded-2xl shadow-xl w-full max-w-6xl my-8" onClick={e => e.stopPropagation()}>

            {/* Header */}
            <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-slate-200">
              <h2 className="text-xl text-slate-900 font-bold">{editing ? 'Edit Houseboat' : 'New Houseboat'}</h2>
              <button type="button" aria-label="Close modal" onClick={() => setShowForm(false)} className="p-1.5 hover:bg-slate-100 rounded-lg transition-colors text-slate-500">
                <span className="material-icons">close</span>
              </button>
            </div>

            {/* Step Indicator */}
            <div className="px-6 py-4 border-b border-slate-200 overflow-x-auto">
              <div className="flex items-center gap-0 min-w-[440px]">
                {STEPS.map((s, i) => (
                  <div key={s.id} className="flex items-center flex-1 last:flex-none">
                    <button type="button" onClick={() => {
                        if (i > step) {
                          for (let sIdx = step; sIdx < i; sIdx++) {
                            const errs = validateStep(sIdx, form);
                            if (Object.keys(errs).length > 0) { setErrors(errs); setStep(sIdx); return; }
                          }
                        }
                        setErrors({}); setStep(i);
                      }} className="flex flex-col items-center gap-1">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                        i < step ? 'bg-green-500 text-white' : i === step ? 'bg-[#C2410C] text-white ring-4 ring-[#FF8C00]/20' : 'bg-slate-200 text-slate-700'
                      }`}>{i < step ? <span className="material-icons text-[16px]">check</span> : i + 1}</div>
                      <span className={`text-xs font-semibold whitespace-nowrap ${
                        i === step ? 'text-[#C2410C]' : i < step ? 'text-emerald-700' : 'text-slate-500'
                      }`}>{s.label}</span>
                    </button>
                    {i < STEPS.length - 1 && <div className={`flex-1 h-0.5 mx-2 mb-5 transition-colors ${i < step ? 'bg-green-500' : 'bg-slate-100'}`} />}
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
                      <label className="text-[13px] font-bold text-slate-700 uppercase block mb-1">Name <span className="text-red-600">*</span></label>
                      <input value={form.name} onChange={e => setForm(f => ({...f, name: e.target.value}))} className={inputCls(errors.name)} placeholder="e.g., Dal Lake Deluxe" />
                      <ErrMsg msg={errors.name} />
                    </div>
                    <div>
                      <label className="text-[13px] font-bold text-slate-700 uppercase block mb-1">URL Slug <span className="text-red-600">*</span></label>
                      <input value={form.slug} onChange={e => setForm(f => ({...f, slug: e.target.value}))} className={inputCls(errors.slug)} placeholder="dal-lake-deluxe" />
                      <ErrMsg msg={errors.slug} />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="text-[13px] font-bold text-slate-700 uppercase block mb-1">Category</label>
                      <select value={form.category} onChange={e => setForm(f => ({...f, category: e.target.value}))} className={inputCls()}>
                        <option value="luxury">Luxury</option>
                        <option value="super-deluxe">Super Deluxe</option>
                        <option value="deluxe">Deluxe</option>
                        <option value="standard">Standard</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-[13px] font-bold text-slate-700 uppercase block mb-1">Lake</label>
                      <select value={form.lake} onChange={e => setForm(f => ({...f, lake: e.target.value}))} className={inputCls()}>
                        <option value="dal-lake">Dal Lake</option>
                        <option value="nagin-lake">Nagin Lake</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-[13px] font-bold text-slate-700 uppercase block mb-1">Availability</label>
                      <select value={form.availability} onChange={e => setForm(f => ({...f, availability: e.target.value}))} className={inputCls()}>
                        <option value="available">Available</option>
                        <option value="limited">Limited</option>
                        <option value="booked">Booked</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="text-[13px] font-bold text-slate-700 uppercase block mb-1">Location <span className="text-red-600">*</span></label>
                    <input value={form.location} onChange={e => setForm(f => ({...f, location: e.target.value}))} className={inputCls(errors.location)} placeholder="e.g., Dal Lake, Srinagar" />
                    <ErrMsg msg={errors.location} />
                  </div>
                  <div>
                    <label className="text-[13px] font-bold text-slate-700 uppercase block mb-1">Overview <span className="text-red-600">*</span></label>
                    <textarea rows={2} value={form.overview} onChange={e => setForm(f => ({...f, overview: e.target.value}))} className={inputCls(errors.overview)} placeholder="One-line summary" />
                    <ErrMsg msg={errors.overview} />
                  </div>
                  <div>
                    <label className="text-[13px] font-bold text-slate-700 uppercase block mb-1">Description</label>
                    <textarea rows={3} value={form.description} onChange={e => setForm(f => ({...f, description: e.target.value}))} className={inputCls()} placeholder="Detailed description..." />
                  </div>
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
                  <ErrMsg msg={errors.coverImage} />
                </div>
              )}

              {/* Step 2 – Details */}
              {step === 2 && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div>
                      <label className="text-[13px] font-bold text-slate-700 uppercase block mb-1">Bedrooms</label>
                      <input type="number" min="1" value={form.rooms.bedrooms} onChange={e => setForm(f => ({...f, rooms: {...f.rooms, bedrooms: Number(e.target.value)}}))} className={inputCls()} />
                    </div>
                    <div>
                      <label className="text-[13px] font-bold text-slate-700 uppercase block mb-1">Bathrooms</label>
                      <input type="number" min="1" value={form.rooms.bathrooms} onChange={e => setForm(f => ({...f, rooms: {...f.rooms, bathrooms: Number(e.target.value)}}))} className={inputCls()} />
                    </div>
                    <div>
                      <label className="text-[13px] font-bold text-slate-700 uppercase block mb-1">Living Rooms</label>
                      <input type="number" min="1" value={form.rooms.livingRooms} onChange={e => setForm(f => ({...f, rooms: {...f.rooms, livingRooms: Number(e.target.value)}}))} className={inputCls()} />
                    </div>
                    <div>
                      <label className="text-[13px] font-bold text-slate-700 uppercase block mb-1">Guests</label>
                      <input type="number" min="1" value={form.capacity.guests} onChange={e => setForm(f => ({...f, capacity: {guests: Number(e.target.value)}}))} className={inputCls()} />
                    </div>
                  </div>
                  <div>
                    <label className="text-[13px] font-bold text-slate-700 uppercase block mb-1">Amenities <span className="text-slate-400 normal-case font-normal">(comma-separated)</span></label>
                    <input value={form.amenities} onChange={e => setForm(f => ({...f, amenities: e.target.value}))} placeholder="WiFi, Heater, TV" className={inputCls()} />
                  </div>
                  <div>
                    <label className="text-[13px] font-bold text-slate-700 uppercase block mb-1">Features <span className="text-slate-400 normal-case font-normal">(comma-separated)</span></label>
                    <input value={form.features} onChange={e => setForm(f => ({...f, features: e.target.value}))} placeholder="Lake View, Traditional Decor" className={inputCls()} />
                  </div>
                </div>
              )}

              {/* Step 3 – Meals & Services */}
              {step === 3 && (
                <div className="space-y-4">
                  <div className="p-3 bg-slate-100/40 rounded-lg">
                    <label className="text-[13px] font-bold text-slate-700 uppercase block mb-2">Meals & Services</label>
                    <div className="flex gap-5 flex-wrap">
                      {['breakfast','lunch','dinner'].map(meal => (
                        <label key={meal} className="flex items-center gap-2 text-sm text-slate-600 cursor-pointer capitalize">
                          <input type="checkbox" checked={form.mealsIncluded[meal]} onChange={e => setForm(f => ({...f, mealsIncluded: {...f.mealsIncluded, [meal]: e.target.checked}}))} className="w-4 h-4 accent-[#FF8C00]" />
                          {meal}
                        </label>
                      ))}
                      <label className="flex items-center gap-2 text-sm text-slate-600 cursor-pointer">
                        <input type="checkbox" checked={form.shikaraRide} onChange={e => setForm(f => ({...f, shikaraRide: e.target.checked}))} className="w-4 h-4 accent-[#FF8C00]" />
                        Shikara Ride
                      </label>
                    </div>
                  </div>
                </div>
              )}

              {/* Step 4 – Extras */}
              {step === 4 && (
                <div className="space-y-4">
                  <div className="flex items-center gap-2 p-3 bg-slate-100/40 rounded-lg">
                    <input type="checkbox" checked={form.isFeatured} onChange={e => setForm(f => ({...f, isFeatured: e.target.checked}))} className="w-4 h-4 accent-[#FF8C00]" />
                    <label className="text-sm text-slate-600 cursor-pointer">Mark as Featured Houseboat</label>
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="px-6 py-4 border-t border-slate-200 bg-slate-50 rounded-b-2xl">
              {errors.submit && (
                <div className="mb-3 flex items-center gap-2 bg-red-50 border border-red-200 text-red-600 px-4 py-2.5 rounded-lg text-sm">
                  <span className="material-icons text-[18px]">error_outline</span> {errors.submit}
                </div>
              )}
              <div className="flex items-center justify-between gap-3">
                <button type="button" onClick={step === 0 ? () => setShowForm(false) : handleBack}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-slate-300 text-slate-600 hover:bg-slate-100 transition-colors text-sm font-semibold">
                  <span className="material-icons text-[18px]">{step === 0 ? 'close' : 'arrow_back'}</span>
                  {step === 0 ? 'Cancel' : 'Back'}
                </button>
                <div className="text-xs text-slate-500">Step {step + 1} of {STEPS.length}</div>
                {isLastStep ? (
                  <button type="button" onClick={handleSubmit} disabled={saving}
                    className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 disabled:opacity-50 text-white font-bold text-sm transition-colors">
                    {saving ? <><span className="material-icons animate-spin text-[18px]">refresh</span> Saving...</> :
                      <><span className="material-icons text-[18px]">{editing ? 'save' : 'add_circle'}</span> {editing ? 'Update Houseboat' : 'Create Houseboat'}</>}
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

      {loading ? (
        <div className="text-center py-20 text-slate-600">Loading...</div>
      ) : (
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-slate-500 border-b border-slate-200 bg-slate-50">
                <th className="px-4 py-4 font-bold text-slate-500 text-sm">Houseboat</th>
                <th className="px-4 py-4 font-bold text-slate-500 text-sm">Category</th>
                <th className="px-4 py-4 font-bold text-slate-500 text-sm">Lake</th>
                <th className="px-4 py-4 font-bold text-slate-500 text-sm">Availability</th>
                <th className="px-4 py-4 font-bold text-slate-500 text-sm text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {houseboats.map(houseboat => (
                <tr key={houseboat._id} className="border-b border-slate-200 hover:bg-slate-100/70">
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-3">
                      <img src={houseboat.coverImage} alt="" className="w-12 h-12 rounded-lg object-cover" />
                      <p className="text-slate-500 font-bold">{houseboat.name}</p>
                    </div>
                  </td>
                  <td className="px-4 py-4 text-slate-600 capitalize">{houseboat.category.replace('-', ' ')}</td>
                  <td className="px-4 py-4 text-slate-600 capitalize">{houseboat.lake.replace('-', ' ')}</td>
                  <td className="px-4 py-4">
                    <span className={`px-2 py-1 rounded text-xs font-bold ${
                      houseboat.availability === 'available' ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' :
                      houseboat.availability === 'limited' ? 'bg-amber-100 text-amber-800 border border-amber-300' :
                      'bg-red-100 text-red-800 border border-red-300'
                    }`}>
                      {houseboat.availability}
                    </span>
                  </td>
                  <td className="px-4 py-4 text-right">
                    <button onClick={() => openEdit(houseboat)} className="text-[#C2410C] hover:text-[#9A3412] mr-3">
                      <span className="material-icons text-[18px]">edit</span>
                    </button>
                    <button onClick={() => setDeleteTarget(houseboat)} className="text-red-600 hover:text-red-600">
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
        itemName={deleteTarget?.name || 'this houseboat'}
      />
    </div>
  );
}
