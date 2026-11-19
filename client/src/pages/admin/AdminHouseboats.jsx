import { useState, useEffect } from 'react';
import api from '../../api';
import useModalBehavior from '../../hooks/useModalBehavior';
import DeleteConfirmModal from '../../components/admin/DeleteConfirmModal';
import AdminCard from '../../components/admin/AdminCard';
import AdminStepModal from '../../components/admin/AdminStepModal';

const STEPS = [
  { id: 0, label: 'Basic Info', icon: 'info' },
  { id: 1, label: 'Image',      icon: 'image' },
  { id: 2, label: 'Details',    icon: 'sailing' },
  { id: 3, label: 'Services',   icon: 'room_service' },
  { id: 4, label: 'Extras',     icon: 'star' },
];

const inputCls = (err) =>
  `w-full bg-slate-950 border rounded-lg px-4 py-2.5 text-[15px] text-slate-100 transition-colors outline-none ${
    err ? 'border-red-400 focus:border-red-500' : 'border-slate-700 focus:border-[#C2410C] focus:ring-2 focus:ring-orange-500/20'
  }`;

const ErrMsg = ({ msg }) =>
  msg ? (
    <p className="mt-1 text-xs text-red-400 flex items-center gap-1">
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
          <h1 className="text-2xl md:text-3xl text-slate-100 font-bold">Houseboats</h1>
          <p className="text-slate-300 mt-1 text-sm">Manage houseboat listings</p>
        </div>
        <button onClick={openCreate} className="bg-[#C2410C] hover:bg-[#9A3412] text-white px-5 py-2.5 rounded-xl font-bold text-sm flex items-center gap-2 transition-all shadow-sm self-start sm:self-auto shrink-0">
          <span className="material-icons text-sm">add</span> Add Houseboat
        </button>
      </div>

      <AdminStepModal
        isOpen={showForm}
        onClose={() => setShowForm(false)}
        title={editing ? 'Edit Houseboat' : 'New Houseboat'}
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
        submitLabel={editing ? 'Update Houseboat' : 'Create Houseboat'}
      >

              {/* Step 0 – Basic Info */}
              {step === 0 && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-[13px] font-bold text-slate-200 uppercase block mb-1">Name <span className="text-red-400">*</span></label>
                      <input value={form.name} onChange={e => setForm(f => ({...f, name: e.target.value}))} className={inputCls(errors.name)} placeholder="e.g., Dal Lake Deluxe" />
                      <ErrMsg msg={errors.name} />
                    </div>
                    <div>
                      <label className="text-[13px] font-bold text-slate-200 uppercase block mb-1">URL Slug <span className="text-red-400">*</span></label>
                      <input value={form.slug} onChange={e => setForm(f => ({...f, slug: e.target.value}))} className={inputCls(errors.slug)} placeholder="dal-lake-deluxe" />
                      <ErrMsg msg={errors.slug} />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="text-[13px] font-bold text-slate-200 uppercase block mb-1">Category</label>
                      <select value={form.category} onChange={e => setForm(f => ({...f, category: e.target.value}))} className={inputCls()}>
                        <option value="luxury">Luxury</option>
                        <option value="super-deluxe">Super Deluxe</option>
                        <option value="deluxe">Deluxe</option>
                        <option value="standard">Standard</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-[13px] font-bold text-slate-200 uppercase block mb-1">Lake</label>
                      <select value={form.lake} onChange={e => setForm(f => ({...f, lake: e.target.value}))} className={inputCls()}>
                        <option value="dal-lake">Dal Lake</option>
                        <option value="nagin-lake">Nagin Lake</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-[13px] font-bold text-slate-200 uppercase block mb-1">Availability</label>
                      <select value={form.availability} onChange={e => setForm(f => ({...f, availability: e.target.value}))} className={inputCls()}>
                        <option value="available">Available</option>
                        <option value="limited">Limited</option>
                        <option value="booked">Booked</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="text-[13px] font-bold text-slate-200 uppercase block mb-1">Location <span className="text-red-400">*</span></label>
                    <input value={form.location} onChange={e => setForm(f => ({...f, location: e.target.value}))} className={inputCls(errors.location)} placeholder="e.g., Dal Lake, Srinagar" />
                    <ErrMsg msg={errors.location} />
                  </div>
                  <div>
                    <label className="text-[13px] font-bold text-slate-200 uppercase block mb-1">Overview <span className="text-red-400">*</span></label>
                    <textarea rows={2} value={form.overview} onChange={e => setForm(f => ({...f, overview: e.target.value}))} className={inputCls(errors.overview)} placeholder="One-line summary" />
                    <ErrMsg msg={errors.overview} />
                  </div>
                  <div>
                    <label className="text-[13px] font-bold text-slate-200 uppercase block mb-1">Description</label>
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
                  <ErrMsg msg={errors.coverImage} />
                </div>
              )}

              {/* Step 2 – Details */}
              {step === 2 && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div>
                      <label className="text-[13px] font-bold text-slate-200 uppercase block mb-1">Bedrooms</label>
                      <input type="number" min="1" value={form.rooms.bedrooms} onChange={e => setForm(f => ({...f, rooms: {...f.rooms, bedrooms: Number(e.target.value)}}))} className={inputCls()} />
                    </div>
                    <div>
                      <label className="text-[13px] font-bold text-slate-200 uppercase block mb-1">Bathrooms</label>
                      <input type="number" min="1" value={form.rooms.bathrooms} onChange={e => setForm(f => ({...f, rooms: {...f.rooms, bathrooms: Number(e.target.value)}}))} className={inputCls()} />
                    </div>
                    <div>
                      <label className="text-[13px] font-bold text-slate-200 uppercase block mb-1">Living Rooms</label>
                      <input type="number" min="1" value={form.rooms.livingRooms} onChange={e => setForm(f => ({...f, rooms: {...f.rooms, livingRooms: Number(e.target.value)}}))} className={inputCls()} />
                    </div>
                    <div>
                      <label className="text-[13px] font-bold text-slate-200 uppercase block mb-1">Guests</label>
                      <input type="number" min="1" value={form.capacity.guests} onChange={e => setForm(f => ({...f, capacity: {guests: Number(e.target.value)}}))} className={inputCls()} />
                    </div>
                  </div>
                  <div>
                    <label className="text-[13px] font-bold text-slate-200 uppercase block mb-1">Amenities <span className="text-slate-300 normal-case font-normal">(comma-separated)</span></label>
                    <input value={form.amenities} onChange={e => setForm(f => ({...f, amenities: e.target.value}))} placeholder="WiFi, Heater, TV" className={inputCls()} />
                  </div>
                  <div>
                    <label className="text-[13px] font-bold text-slate-200 uppercase block mb-1">Features <span className="text-slate-300 normal-case font-normal">(comma-separated)</span></label>
                    <input value={form.features} onChange={e => setForm(f => ({...f, features: e.target.value}))} placeholder="Lake View, Traditional Decor" className={inputCls()} />
                  </div>
                </div>
              )}

              {/* Step 3 – Meals & Services */}
              {step === 3 && (
                <div className="space-y-4">
                  <div className="p-3 bg-slate-800/40 rounded-lg">
                    <label className="text-[13px] font-bold text-slate-200 uppercase block mb-2">Meals & Services</label>
                    <div className="flex gap-5 flex-wrap">
                      {['breakfast','lunch','dinner'].map(meal => (
                        <label key={meal} className="flex items-center gap-2 text-sm text-slate-300 cursor-pointer capitalize">
                          <input type="checkbox" checked={form.mealsIncluded[meal]} onChange={e => setForm(f => ({...f, mealsIncluded: {...f.mealsIncluded, [meal]: e.target.checked}}))} className="w-4 h-4 accent-[#FF8C00]" />
                          {meal}
                        </label>
                      ))}
                      <label className="flex items-center gap-2 text-sm text-slate-300 cursor-pointer">
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
                  <div className="flex items-center gap-2 p-3 bg-slate-800/40 rounded-lg">
                    <input type="checkbox" checked={form.isFeatured} onChange={e => setForm(f => ({...f, isFeatured: e.target.checked}))} className="w-4 h-4 accent-[#FF8C00]" />
                    <label className="text-sm text-slate-300 cursor-pointer">Mark as Featured Houseboat</label>
                  </div>
                </div>
              )}
            
      </AdminStepModal>

      {loading ? (
        <div className="text-center py-20 text-slate-300">Loading...</div>
      ) : houseboats.length === 0 ? (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl text-center py-14 text-slate-300 shadow-sm">No houseboats found</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
            {houseboats.map(houseboat => (
              <AdminCard
                key={houseboat._id}
                image={houseboat.coverImage}
                title={houseboat.name}
                subtitle={houseboat.category ? houseboat.category.replace(/-/g, ' ').replace(/\b\w/g, ch => ch.toUpperCase()) : null}
                description={houseboat.description}
                topLeftBadges={[
                  {
                    label: (houseboat.availability || 'available').toUpperCase(),
                    className:
                      houseboat.availability === 'available'
                        ? 'bg-emerald-950/85 text-emerald-200 border border-emerald-400/40'
                        : houseboat.availability === 'limited'
                        ? 'bg-amber-950/85 text-amber-200 border border-amber-400/40'
                        : 'bg-red-950/85 text-red-200 border border-red-400/40',
                  },
                ]}
                topRightBadge={houseboat.lake ? houseboat.lake.replace(/-/g, ' ').replace(/\b\w/g, ch => ch.toUpperCase()) : null}
                tags={houseboat.amenities || []}
                tagsLabel="Amenities"
                onEdit={() => openEdit(houseboat)}
                onDelete={() => setDeleteTarget(houseboat)}
              />
            ))}
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
