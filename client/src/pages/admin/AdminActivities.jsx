import { useState, useEffect } from 'react';
import api from '../../api';
import useModalBehavior from '../../hooks/useModalBehavior';
import DeleteConfirmModal from '../../components/admin/DeleteConfirmModal';
import AdminCard from '../../components/admin/AdminCard';
import AdminStepModal from '../../components/admin/AdminStepModal';

const STEPS = [
  { id: 0, label: 'Basic Info', icon: 'info' },
  { id: 1, label: 'Image',      icon: 'image' },
  { id: 2, label: 'Details',    icon: 'sports' },
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
    if (!form.name.trim())     errs.name     = 'Activity name is required';
    if (!form.slug.trim())     errs.slug     = 'URL slug is required';
    if (!form.location.trim()) errs.location = 'Location is required';
    if (!form.overview.trim()) errs.overview = 'Overview is required';
  }
  if (step === 1) {
    if (!form.coverImage.trim() && form.images.length === 0) errs.coverImage = 'At least one image is required';
  }
  if (step === 2) {
    if (!form.duration.trim())   errs.duration  = 'Duration is required';
  }
  return errs;
}

const emptyForm = {
  name: '', slug: '', category: 'skiing', description: '', overview: '', highlights: '',
  location: '', duration: '', pricing: { perPerson: '', perGroup: '' }, inclusions: '',
  requirements: '', safetyGuidelines: '', coverImage: '', images: [], bestSeason: '',
  ageLimit: { min: 12 }, groupSize: { min: 1, max: 10 }, difficulty: 'moderate', isFeatured: false
};

export default function AdminActivities() {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  useModalBehavior(showForm, () => setShowForm(false), saving);
  const [step, setStep] = useState(0);
  const [errors, setErrors] = useState({});
  const [dragOver, setDragOver] = useState(false);

  useEffect(() => { load(); }, []);

  const load = () => {
    setLoading(true);
    api.adminGetActivities()
      .then(setActivities)
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  const openCreate = () => { setEditing(null); setForm(emptyForm); setStep(0); setErrors({}); setShowForm(true); };

  const openEdit = (activity) => {
    setEditing(activity._id);
    setForm({
      name: activity.name || '',
      slug: activity.slug || '',
      category: activity.category || 'skiing',
      description: activity.description || '',
      overview: activity.overview || '',
      highlights: (activity.highlights || []).join('\n'),
      location: activity.location || '',
      duration: activity.duration || '',
      pricing: { perPerson: activity.pricing?.perPerson || '', perGroup: activity.pricing?.perGroup || '' },
      inclusions: (activity.inclusions || []).join('\n'),
      requirements: (activity.requirements || []).join('\n'),
      safetyGuidelines: (activity.safetyGuidelines || []).join('\n'),
      coverImage: activity.coverImage || '',
      images: activity.images || [],
      bestSeason: (activity.bestSeason || []).join(', '),
      ageLimit: activity.ageLimit || { min: 12 },
      groupSize: activity.groupSize || { min: 1, max: 10 },
      difficulty: activity.difficulty || 'moderate',
      isFeatured: activity.isFeatured || false
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
      requirements: form.requirements.split('\n').filter(Boolean),
      safetyGuidelines: form.safetyGuidelines.split('\n').filter(Boolean),
      bestSeason: form.bestSeason.split(',').map(s => s.trim()).filter(Boolean),
      pricing: {
        perPerson: Number(form.pricing.perPerson),
        perGroup: form.pricing.perGroup ? Number(form.pricing.perGroup) : undefined
      }
    };
    try {
      if (editing) {
        await api.adminUpdateActivity(editing, payload);
      } else {
        await api.adminCreateActivity(payload);
      }
      setShowForm(false);
      setEditing(null);
      setForm(emptyForm);
      load();
    } catch (err) {
      setErrors({ submit: err.message || 'Failed to save activity. Please try again.' });
    } finally { setSaving(false); }
  };

  const [deleteTarget, setDeleteTarget] = useState(null);

  const handleDelete = async () => {
    await api.adminDeleteActivity(deleteTarget._id);
    setDeleteTarget(null);
    load();
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 md:mb-8">
        <div>
          <h1 className="text-2xl md:text-3xl text-slate-100 font-bold">Adventure Sport</h1>
          <p className="text-slate-300 mt-1 text-sm">Manage adventure sport activities</p>
        </div>
        <button onClick={openCreate} className="bg-[#C2410C] hover:bg-[#9A3412] text-white px-5 py-2.5 rounded-xl font-bold text-sm flex items-center gap-2 shadow-sm self-start sm:self-auto shrink-0">
          <span className="material-icons text-sm">add</span> Add Activity
        </button>
      </div>

      <AdminStepModal
        isOpen={showForm}
        onClose={() => setShowForm(false)}
        title={editing ? 'Edit Activity' : 'New Activity'}
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
        submitLabel={editing ? 'Update Activity' : 'Create Activity'}
      >

              {/* Step 0 – Basic Info */}
              {step === 0 && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-[13px] font-bold text-slate-200 uppercase block mb-1">Activity Name <span className="text-red-400">*</span></label>
                      <input value={form.name} onChange={e => setForm(f => ({...f, name: e.target.value}))} className={inputCls(errors.name)} placeholder="e.g., Gulmarg Skiing" />
                      <ErrMsg msg={errors.name} />
                    </div>
                    <div>
                      <label className="text-[13px] font-bold text-slate-200 uppercase block mb-1">URL Slug <span className="text-red-400">*</span></label>
                      <input value={form.slug} onChange={e => setForm(f => ({...f, slug: e.target.value}))} className={inputCls(errors.slug)} placeholder="gulmarg-skiing" />
                      <ErrMsg msg={errors.slug} />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="text-[13px] font-bold text-slate-200 uppercase block mb-1">Category</label>
                      <select value={form.category} onChange={e => setForm(f => ({...f, category: e.target.value}))} className={inputCls()}>
                        <option value="himalayan-circuit">Kashmir Himalayan Circuit</option>
                        <option value="trekking">Trekking</option>
                        <option value="skiing">Skiing</option>
                        <option value="paragliding">Paragliding</option>
                        <option value="climbing">Rock Climbing</option>
                        <option value="heli-skiing">Heli Skiing</option>
                        <option value="cycling">Cycling & Mountain Biking</option>
                        <option value="rafting">River Rafting</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-[13px] font-bold text-slate-200 uppercase block mb-1">Location <span className="text-red-400">*</span></label>
                      <input value={form.location} onChange={e => setForm(f => ({...f, location: e.target.value}))} className={inputCls(errors.location)} placeholder="e.g., Gulmarg" />
                      <ErrMsg msg={errors.location} />
                    </div>
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
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="text-[13px] font-bold text-slate-200 uppercase block mb-1">Duration <span className="text-red-400">*</span></label>
                      <input value={form.duration} onChange={e => setForm(f => ({...f, duration: e.target.value}))} className={inputCls(errors.duration)} placeholder="2 hours" />
                      <ErrMsg msg={errors.duration} />
                    </div>
                    <div>
                      <label className="text-[13px] font-bold text-slate-200 uppercase block mb-1">Min Age</label>
                      <input type="number" value={form.ageLimit.min} onChange={e => setForm(f => ({...f, ageLimit: {min: Number(e.target.value)}}))} className={inputCls()} />
                    </div>
                  </div>
                  <div>
                    <label className="text-[13px] font-bold text-slate-200 uppercase block mb-1">Safety Guidelines <span className="text-slate-300 normal-case font-normal">(one per line)</span></label>
                    <textarea rows={4} value={form.safetyGuidelines} onChange={e => setForm(f => ({...f, safetyGuidelines: e.target.value}))} placeholder="Wear helmet&#10;Follow instructor&#10;No solo attempt" className={inputCls()} />
                  </div>
                </div>
              )}

              {/* Step 3 – Extras */}
              {step === 3 && (
                <div className="space-y-4">
                  <div className="flex items-center gap-2 p-3 bg-slate-800/40 rounded-lg">
                    <input type="checkbox" checked={form.isFeatured} onChange={e => setForm(f => ({...f, isFeatured: e.target.checked}))} className="w-4 h-4 accent-[#FF8C00]" />
                    <label className="text-sm text-slate-300 cursor-pointer">Mark as Featured Activity</label>
                  </div>
                </div>
              )}
            
      </AdminStepModal>

      {loading ? (
        <div className="text-center py-20 text-slate-300">Loading...</div>
      ) : activities.length === 0 ? (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl text-center py-14 text-slate-300 shadow-sm">No activities found</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
            {activities.map(activity => (
              <AdminCard
                key={activity._id}
                image={activity.coverImage}
                title={activity.name}
                subtitle={activity.category ? activity.category.replace(/-/g, ' ').replace(/\b\w/g, ch => ch.toUpperCase()) : null}
                description={activity.description}
                topRightBadge={activity.duration || null}
                bannerBottomLeft={activity.location || null}
                tags={activity.bestSeason || []}
                tagsLabel="Best Season"
                onEdit={() => openEdit(activity)}
                onDelete={() => setDeleteTarget(activity)}
              />
            ))}
          </div>
      )}
      <DeleteConfirmModal
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        itemName={deleteTarget?.name || 'this activity'}
      />
    </div>
  );
}
