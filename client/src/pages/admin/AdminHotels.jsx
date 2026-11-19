import { useState, useEffect } from 'react';
import api from '../../api';
import useModalBehavior from '../../hooks/useModalBehavior';
import DeleteConfirmModal from '../../components/admin/DeleteConfirmModal';
import AdminCard from '../../components/admin/AdminCard';
import AdminStepModal from '../../components/admin/AdminStepModal';

const STEPS = [
  { id: 0, label: 'Basic Info', icon: 'info' },
  { id: 1, label: 'Image',      icon: 'image' },
  { id: 2, label: 'Details',    icon: 'hotel' },
  { id: 3, label: 'Extras',     icon: 'star' },
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
    if (!form.name.trim())        errs.name = 'Hotel name is required';
    if (!form.description.trim()) errs.description = 'Description is required';
  }
  if (step === 1) {
    if (!form.image.trim() && form.images.length === 0) errs.image = 'At least one image is required';
  }
  if (step === 2) {
  }
  return errs;
}

const emptyForm = {
  name: '', description: '', destination: '', image: '', images: [], category: 'resort',
  startingPrice: '', rating: '4.5', amenities: '', address: '',
  badgeText: '', badgeIcon: 'star', locationText: '', locationIcon: 'map',
  isFeatured: false
};

export default function AdminHotels() {
  const [hotels, setHotels] = useState([]);
  const [destinations, setDestinations] = useState([]);
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

  const load = () => {
    setLoading(true);
    Promise.all([api.adminGetHotels(), api.adminGetDestinations()])
      .then(([h, d]) => { setHotels(h); setDestinations(d); })
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const openCreate = () => { setEditing(null); setForm(emptyForm); setStep(0); setErrors({}); setShowForm(true); };

  const openEdit = (hotel) => {
    setEditing(hotel._id);
    setForm({
      name: hotel.name || '',
      description: hotel.description || '',
      destination: hotel.destination?._id || hotel.destination || '',
      image: hotel.image || '',
      images: hotel.images || [],
      category: hotel.category || 'resort',
      startingPrice: hotel.startingPrice?.toString() || '',
      rating: hotel.rating?.toString() || '4.5',
      amenities: (hotel.amenities || []).join(', '),
      address: hotel.address || '',
      badgeText: hotel.badge?.text || '',
      badgeIcon: hotel.badge?.icon || 'star',
      locationText: hotel.locationTag?.text || '',
      locationIcon: hotel.locationTag?.icon || 'map',
      isFeatured: hotel.isFeatured || false,
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
        return { ...prev, images: newImages, image: newImages[0] };
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
    const updatedImage = form.images.length > 0 ? form.images[0] : form.image;
    const payload = {
      name: form.name,
      description: form.description,
      destination: form.destination,
      image: updatedImage,
      images: form.images,
      category: form.category,
      startingPrice: Number(form.startingPrice),
      rating: Number(form.rating),
      amenities: form.amenities.split(',').map(a => a.trim()).filter(Boolean),
      address: form.address,
      badge: { text: form.badgeText, icon: form.badgeIcon },
      locationTag: { text: form.locationText, icon: form.locationIcon },
      isFeatured: form.isFeatured,
    };
    try {
      if (editing) {
        await api.adminUpdateHotel(editing, payload);
      } else {
        await api.adminCreateHotel(payload);
      }
      setShowForm(false);
      setEditing(null);
      setForm(emptyForm);
      load();
    } catch (err) {
      setErrors({ submit: err.message || 'Failed to save hotel. Please try again.' });
    } finally { setSaving(false); }
  };

  const handleDelete = async () => {
    await api.adminDeleteHotel(deleteTarget._id);
    setDeleteTarget(null);
    load();
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 md:mb-8">
        <div>
          <h1 className="text-2xl md:text-3xl text-slate-100 font-bold">Hotels</h1>
          <p className="text-slate-300 mt-1 text-sm">Manage hotels, resorts, and houseboats</p>
        </div>
        <button onClick={openCreate} className="bg-[#C2410C] hover:bg-[#9A3412] text-white px-5 py-2.5 rounded-xl font-bold text-sm flex items-center gap-2 transition-all shadow-sm self-start sm:self-auto shrink-0">
          <span className="material-icons text-sm">add</span> Add Hotel
        </button>
      </div>

      {/* Form Modal */}
      <AdminStepModal
        isOpen={showForm}
        onClose={() => setShowForm(false)}
        title={editing ? 'Edit Hotel' : 'New Hotel'}
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
        submitLabel={editing ? 'Update Hotel' : 'Create Hotel'}
      >

              {/* Step 0 – Basic Info */}
              {step === 0 && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-[13px] font-bold text-slate-200 uppercase block mb-1">Hotel Name <span className="text-red-400">*</span></label>
                      <input value={form.name} onChange={e => setForm(f => ({...f, name: e.target.value}))} className={inputCls(errors.name)} placeholder="e.g., The Grand Palace" />
                      <ErrMsg msg={errors.name} />
                    </div>
                    <div>
                      <label className="text-[13px] font-bold text-slate-200 uppercase block mb-1">Destination</label>
                      <select
                        value={form.destination}
                        onChange={(e) => setForm(f => ({ ...f, destination: e.target.value }))}
                        className={inputCls(false)}
                      >
                        <option value="">Select destination</option>
                        {destinations.map(d => (
                          <option key={d._id} value={d._id}>{d.name}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="text-[13px] font-bold text-slate-200 uppercase block mb-1">Description <span className="text-red-400">*</span></label>
                    <textarea rows={4} value={form.description} onChange={e => setForm(f => ({...f, description: e.target.value}))} className={inputCls(errors.description)} placeholder="Describe this hotel..." />
                    <ErrMsg msg={errors.description} />
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
                            <button type="button" onClick={() => setForm(f => { const newImages = f.images.filter((_, idx) => idx !== i); return { ...f, images: newImages, image: newImages[0] || '' }; })}
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
                  <ErrMsg msg={errors.image} />
                </div>
              )}

              {/* Step 2 – Details */}
              {step === 2 && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="text-[13px] font-bold text-slate-200 uppercase block mb-1">Category</label>
                      <select value={form.category} onChange={e => setForm(f => ({...f, category: e.target.value}))} className={inputCls()}>
                        <option value="luxury">Luxury</option>
                        <option value="resort">Resort</option>
                        <option value="houseboat">Houseboat</option>
                        <option value="boutique">Boutique</option>
                        <option value="budget">Budget</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-[13px] font-bold text-slate-200 uppercase block mb-1">Rating</label>
                      <input type="number" step="0.1" min="0" max="5" value={form.rating} onChange={e => setForm(f => ({...f, rating: e.target.value}))} className={inputCls()} />
                    </div>
                    <div className="flex items-end pb-1">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input type="checkbox" checked={form.isFeatured} onChange={e => setForm(f => ({...f, isFeatured: e.target.checked}))} className="w-4 h-4 accent-[#FF8C00]" />
                        <span className="text-sm text-slate-300">Featured</span>
                      </label>
                    </div>
                  </div>
                  <div>
                    <label className="text-[13px] font-bold text-slate-200 uppercase block mb-1">Address</label>
                    <input value={form.address} onChange={e => setForm(f => ({...f, address: e.target.value}))} className={inputCls()} />
                  </div>
                  <div>
                    <label className="text-[13px] font-bold text-slate-200 uppercase block mb-1">Amenities <span className="text-slate-300 normal-case font-normal">(comma-separated)</span></label>
                    <input value={form.amenities} onChange={e => setForm(f => ({...f, amenities: e.target.value}))} placeholder="Spa, Pool, WiFi" className={inputCls()} />
                  </div>
                </div>
              )}

              {/* Step 3 – Extras */}
              {step === 3 && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-[13px] font-bold text-slate-200 uppercase block mb-1">Badge Text</label>
                      <input value={form.badgeText} onChange={e => setForm(f => ({...f, badgeText: e.target.value}))} placeholder="5.0 LUXURY" className={inputCls()} />
                    </div>
                    <div>
                      <label className="text-[13px] font-bold text-slate-200 uppercase block mb-1">Badge Icon</label>
                      <input value={form.badgeIcon} onChange={e => setForm(f => ({...f, badgeIcon: e.target.value}))} placeholder="star" className={inputCls()} />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-[13px] font-bold text-slate-200 uppercase block mb-1">Location Tag Text</label>
                      <input value={form.locationText} onChange={e => setForm(f => ({...f, locationText: e.target.value}))} placeholder="Near Gondola" className={inputCls()} />
                    </div>
                    <div>
                      <label className="text-[13px] font-bold text-slate-200 uppercase block mb-1">Location Icon</label>
                      <input value={form.locationIcon} onChange={e => setForm(f => ({...f, locationIcon: e.target.value}))} placeholder="map" className={inputCls()} />
                    </div>
                  </div>
                </div>
              )}
            
      </AdminStepModal>

      {/* Table */}
      {loading ? (
        <div className="text-center py-20 text-slate-300">Loading...</div>
      ) : hotels.length === 0 ? (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl text-center py-14 text-slate-300 shadow-sm">No hotels found</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
            {hotels.map(hotel => (
              <AdminCard
                key={hotel._id}
                image={hotel.image}
                title={hotel.name}
                subtitle={hotel.destination?.name || (hotel.category ? hotel.category.toUpperCase() : null)}
                description={hotel.description}
                topLeftBadges={
                  hotel.isFeatured
                    ? [{ label: '★ FEATURED', className: 'bg-orange-600/90 text-white border border-orange-300/40' }]
                    : []
                }
                topRightBadge={hotel.rating ? ('★ ' + hotel.rating) : null}
                bannerBottomLeft={(hotel.roomTypes?.length || 0) + ' room types'}
                bannerBottomRight={hotel.category ? hotel.category.toUpperCase() : null}
                tags={hotel.amenities || []}
                tagsLabel="Amenities"
                onEdit={() => openEdit(hotel)}
                onDelete={() => setDeleteTarget(hotel)}
              />
            ))}
          </div>
      )}
      <DeleteConfirmModal
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        itemName={deleteTarget?.name || 'this hotel'}
      />
    </div>
  );
}
