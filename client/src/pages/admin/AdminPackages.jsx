import { useState, useEffect } from 'react';
import api from '../../api';
import useModalBehavior from '../../hooks/useModalBehavior';
import DeleteConfirmModal from '../../components/admin/DeleteConfirmModal';
import AdminCard from '../../components/admin/AdminCard';
import AdminStepModal from '../../components/admin/AdminStepModal';

const STEPS = [
  { id: 0, label: 'Basic Info',  icon: 'info' },
  { id: 1, label: 'Image',       icon: 'image' },
  { id: 2, label: 'Duration',    icon: 'schedule' },
  { id: 3, label: 'Inclusions',  icon: 'checklist' },
  { id: 4, label: 'Extras',      icon: 'star' },
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
    if (!form.name.trim())        errs.name        = 'Package name is required';
    if (!form.slug.trim())        errs.slug        = 'URL slug is required';
    if (!form.description.trim()) errs.description = 'Description is required';
  }
  if (step === 1) {
    if (!form.coverImage.trim() && form.images.length === 0) errs.coverImage = 'At least one image is required';
  }
  if (step === 2) {
    if (!form.duration.nights)      errs.nights    = 'Number of nights is required';
    if (!form.duration.days)        errs.days      = 'Number of days is required';
  }
  return errs;
}

const emptyForm = {
  name: '', slug: '', category: 'popular-kashmir', subCategory: '', description: '', highlights: '',
  duration: { nights: 5, days: 6 }, pricing: { perPerson: '', perCouple: '', perFamily: '' },
  inclusions: '', exclusions: '', coverImage: '', images: [], difficulty: 'moderate', bestSeason: '',
  groupSize: { min: 2, max: 15 }, destinations: [], isFeatured: false
};

export default function AdminPackages() {
  const [packages, setPackages] = useState([]);
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

  useEffect(() => { load(); }, []);

  const load = () => {
    setLoading(true);
    Promise.all([api.adminGetPackages(), api.adminGetDestinations()])
      .then(([p, d]) => { setPackages(p); setDestinations(d); })
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  const openCreate = () => { setEditing(null); setForm(emptyForm); setStep(0); setErrors({}); setShowForm(true); };

  const openEdit = (pkg) => {
    setEditing(pkg._id);
    setForm({
      name: pkg.name || '',
      slug: pkg.slug || '',
      category: pkg.category || 'popular-kashmir',
      subCategory: pkg.subCategory || '',
      description: pkg.description || '',
      highlights: (pkg.highlights || []).join('\n'),
      duration: pkg.duration || { nights: 5, days: 6 },
      pricing: pkg.pricing || { perPerson: '', perCouple: '', perFamily: '' },
      inclusions: (pkg.inclusions || []).join('\n'),
      exclusions: (pkg.exclusions || []).join('\n'),
      coverImage: pkg.coverImage || '',
      images: pkg.images || [],
      difficulty: pkg.difficulty || 'moderate',
      bestSeason: (pkg.bestSeason || []).join(', '),
      groupSize: pkg.groupSize || { min: 2, max: 15 },
      destinations: (pkg.destinations || []).map(d => d._id || d),
      isFeatured: pkg.isFeatured || false
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
      highlights: form.highlights.split('\n').filter(Boolean),
      inclusions: form.inclusions.split('\n').filter(Boolean),
      exclusions: form.exclusions.split('\n').filter(Boolean),
      bestSeason: form.bestSeason.split(',').map(s => s.trim()).filter(Boolean),
      pricing: {
        perPerson: Number(form.pricing.perPerson),
        perCouple: form.pricing.perCouple ? Number(form.pricing.perCouple) : undefined,
        perFamily: form.pricing.perFamily ? Number(form.pricing.perFamily) : undefined
      }
    };
    try {
      if (editing) {
        await api.adminUpdatePackage(editing, payload);
      } else {
        await api.adminCreatePackage(payload);
      }
      setShowForm(false);
      setEditing(null);
      setForm(emptyForm);
      load();
    } catch (err) {
      setErrors({ submit: err.message || 'Failed to save package. Please try again.' });
    } finally { setSaving(false); }
  };

  const handleDelete = async () => {
    await api.adminDeletePackage(deleteTarget._id);
    setDeleteTarget(null);
    load();
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 md:mb-8">
        <div>
          <h1 className="text-2xl md:text-3xl text-slate-100 font-bold">Tour Packages</h1>
          <p className="text-slate-300 mt-1 text-sm">Manage tour packages</p>
        </div>
        <button onClick={openCreate} className="bg-[#C2410C] hover:bg-[#9A3412] text-white px-5 py-2.5 rounded-xl font-bold text-sm flex items-center gap-2 shadow-sm self-start sm:self-auto shrink-0">
          <span className="material-icons text-sm">add</span> Add Package
        </button>
      </div>

      <AdminStepModal
        isOpen={showForm}
        onClose={() => setShowForm(false)}
        title={editing ? 'Edit Package' : 'New Package'}
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
        submitLabel={editing ? 'Update Package' : 'Create Package'}
      >

              {/* Step 0 – Basic Info */}
              {step === 0 && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-[13px] font-bold text-slate-200 uppercase block mb-1">Package Name <span className="text-red-400">*</span></label>
                      <input value={form.name} onChange={e => setForm(f => ({...f, name: e.target.value}))} className={inputCls(errors.name)} placeholder="e.g., Kashmir Premium Tour" />
                      <ErrMsg msg={errors.name} />
                    </div>
                    <div>
                      <label className="text-[13px] font-bold text-slate-200 uppercase block mb-1">URL Slug <span className="text-red-400">*</span></label>
                      <input value={form.slug} onChange={e => setForm(f => ({...f, slug: e.target.value}))} className={inputCls(errors.slug)} placeholder="kashmir-premium-tour" />
                      <ErrMsg msg={errors.slug} />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-[13px] font-bold text-slate-200 uppercase block mb-1">Category</label>
                      <select value={form.category} onChange={e => setForm(f => ({...f, category: e.target.value}))} className={inputCls()}>
                        <option value="popular-kashmir">Popular Kashmir</option>
                        <option value="offbeat">Offbeat</option>
                        <option value="ladakh">Ladakh</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-[13px] font-bold text-slate-200 uppercase block mb-1">Sub Category</label>
                      <input value={form.subCategory} onChange={e => setForm(f => ({...f, subCategory: e.target.value}))} className={inputCls()} placeholder="e.g., Honeymoon" />
                    </div>
                  </div>
                  <div>
                    <label className="text-[13px] font-bold text-slate-200 uppercase block mb-1">Description <span className="text-red-400">*</span></label>
                    <textarea rows={4} value={form.description} onChange={e => setForm(f => ({...f, description: e.target.value}))} className={inputCls(errors.description)} placeholder="Detailed description of the package..." />
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

              {/* Step 2 – Duration & Pricing */}
              {step === 2 && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div>
                      <label className="text-[13px] font-bold text-slate-200 uppercase block mb-1">Nights <span className="text-red-400">*</span></label>
                      <input type="number" value={form.duration.nights} onChange={e => setForm(f => ({...f, duration: {...f.duration, nights: Number(e.target.value)}}))} className={inputCls(errors.nights)} />
                      <ErrMsg msg={errors.nights} />
                    </div>
                    <div>
                      <label className="text-[13px] font-bold text-slate-200 uppercase block mb-1">Days <span className="text-red-400">*</span></label>
                      <input type="number" value={form.duration.days} onChange={e => setForm(f => ({...f, duration: {...f.duration, days: Number(e.target.value)}}))} className={inputCls(errors.days)} />
                      <ErrMsg msg={errors.days} />
                    </div>
                    <div>
                      <label className="text-[13px] font-bold text-slate-200 uppercase block mb-1">Min Group</label>
                      <input type="number" value={form.groupSize.min} onChange={e => setForm(f => ({...f, groupSize: {...f.groupSize, min: Number(e.target.value)}}))} className={inputCls()} />
                    </div>
                    <div>
                      <label className="text-[13px] font-bold text-slate-200 uppercase block mb-1">Max Group</label>
                      <input type="number" value={form.groupSize.max} onChange={e => setForm(f => ({...f, groupSize: {...f.groupSize, max: Number(e.target.value)}}))} className={inputCls()} />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="text-[13px] font-bold text-slate-200 uppercase block mb-1">Difficulty</label>
                      <select value={form.difficulty} onChange={e => setForm(f => ({...f, difficulty: e.target.value}))} className={inputCls()}>
                        <option value="easy">Easy</option>
                        <option value="moderate">Moderate</option>
                        <option value="challenging">Challenging</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="text-[13px] font-bold text-slate-200 uppercase block mb-1">Best Season <span className="text-slate-300 normal-case font-normal">(comma-separated)</span></label>
                    <input value={form.bestSeason} onChange={e => setForm(f => ({...f, bestSeason: e.target.value}))} placeholder="Summer, Autumn, Winter" className={inputCls()} />
                  </div>
                </div>
              )}

              {/* Step 3 – Inclusions */}
              {step === 3 && (
                <div className="space-y-4">
                  <div>
                    <label className="text-[13px] font-bold text-slate-200 uppercase block mb-1">
                      <span className="material-icons text-emerald-400 text-[14px] align-middle mr-1">add_circle</span>
                      Inclusions <span className="text-slate-300 normal-case font-normal">(one per line)</span>
                    </label>
                    <textarea rows={4} value={form.inclusions} onChange={e => setForm(f => ({...f, inclusions: e.target.value}))} placeholder="Hotel Accommodation&#10;All Meals&#10;Airport Transfers" className={inputCls()} />
                  </div>
                  <div>
                    <label className="text-[13px] font-bold text-slate-200 uppercase block mb-1">
                      <span className="material-icons text-amber-400 text-[14px] align-middle mr-1">star</span>
                      Highlights <span className="text-slate-300 normal-case font-normal">(one per line)</span>
                    </label>
                    <textarea rows={4} value={form.highlights} onChange={e => setForm(f => ({...f, highlights: e.target.value}))} placeholder="Dal Lake Shikara&#10;Gulmarg Gondola&#10;Mughal Gardens" className={inputCls()} />
                  </div>
                </div>
              )}

              {/* Step 4 – Extras */}
              {step === 4 && (
                <div className="space-y-4">
                  <div className="flex items-center gap-2 p-3 bg-slate-800/40 rounded-lg">
                    <input type="checkbox" checked={form.isFeatured} onChange={e => setForm(f => ({...f, isFeatured: e.target.checked}))} className="w-4 h-4 accent-[#FF8C00]" />
                    <label className="text-sm text-slate-300 cursor-pointer">Mark as Featured Package</label>
                  </div>
                </div>
              )}
            
      </AdminStepModal>


      {loading ? (
        <div className="text-center py-20 text-slate-300">Loading...</div>
      ) : packages.length === 0 ? (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl text-center py-14 text-slate-300 shadow-sm">No packages found</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
            {packages.map(pkg => (
              <AdminCard
                key={pkg._id}
                image={pkg.coverImage}
                title={pkg.name}
                subtitle={pkg.category ? pkg.category.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase()) : null}
                description={pkg.description}
                topLeftBadges={
                  pkg.isFeatured
                    ? [{ label: '★ FEATURED', className: 'bg-orange-600/90 text-white border border-orange-500/30/40' }]
                    : []
                }
                topRightBadge={pkg.duration ? (pkg.duration.nights + 'N / ' + pkg.duration.days + 'D') : null}
                bannerBottomLeft={pkg.price ? ('₹' + Number(pkg.price).toLocaleString('en-IN')) : null}
                bannerBottomRight={pkg.slug ? ('/' + pkg.slug) : null}
                tags={pkg.bestSeason || []}
                tagsLabel="Best Season"
                onEdit={() => openEdit(pkg)}
                onDelete={() => setDeleteTarget(pkg)}
              />
            ))}
          </div>
      )}
      <DeleteConfirmModal
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        itemName={deleteTarget?.name || 'this package'}
      />
    </div>
  );
}
