import { useState, useEffect } from 'react';
import api from '../../api';
import useModalBehavior from '../../hooks/useModalBehavior';
import DeleteConfirmModal from '../../components/admin/DeleteConfirmModal';
import AdminCard from '../../components/admin/AdminCard';
import AdminStepModal from '../../components/admin/AdminStepModal';

const STEPS = [
  { id: 0, label: 'Basic Info',  icon: 'info' },
  { id: 1, label: 'Image',       icon: 'image' },
  { id: 2, label: 'Details',     icon: 'thermostat' },
];

const emptyForm = { name: '', description: '', image: '', temperature: '', weatherIcon: 'wb_sunny', highlights: '' };

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
    if (!form.name.trim())        errs.name = 'Destination name is required';
    if (!form.description.trim()) errs.description = 'Description is required';
  }
  if (step === 1) {
    if (!form.image.trim()) errs.image = 'An image is required';
  }
  return errs;
}

export default function AdminDestinations() {
  const [destinations, setDestinations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [step, setStep] = useState(0);
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  useModalBehavior(showForm, () => setShowForm(false), saving);
  const [dragOver, setDragOver] = useState(false);

  const load = () => {
    setLoading(true);
    api.adminGetDestinations().then(setDestinations).catch(() => {}).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const openCreate = () => { setEditing(null); setForm(emptyForm); setStep(0); setErrors({}); setShowForm(true); };

  const openEdit = (dest) => {
    setEditing(dest._id);
    setForm({ name: dest.name || '', description: dest.description || '', image: dest.image || '', temperature: dest.temperature || '', weatherIcon: dest.weatherIcon || 'wb_sunny', highlights: (dest.highlights || []).join(', ') });
    setStep(0); setErrors({}); setShowForm(true);
  };

  const handleNext = () => {
    for (let sIdx = 0; sIdx < STEPS.length; sIdx++) {
      const errs = validateStep(sIdx, form);
      if (Object.keys(errs).length > 0) { setErrors(errs); setStep(sIdx); return; }
    }
    setErrors({}); setStep(s => s + 1);
  };

  const handleBack = () => { setErrors({}); setStep(s => s - 1); };

  const handleSubmit = async () => {
    if (saving) return;
    for (let sIdx = 0; sIdx < STEPS.length; sIdx++) {
      const errs = validateStep(sIdx, form);
      if (Object.keys(errs).length > 0) { setErrors(errs); setStep(sIdx); return; }
    }
    setSaving(true);
    const payload = { ...form, highlights: form.highlights.split(',').map(h => h.trim()).filter(Boolean) };
    try {
      if (editing) await api.adminUpdateDestination(editing, payload);
      else         await api.adminCreateDestination(payload);
      setShowForm(false); setEditing(null); setForm(emptyForm); load();
    } catch (err) {
      setErrors({ submit: err.message || 'Failed to save destination. Please try again.' });
    } finally { setSaving(false); }
  };

  const [deleteTarget, setDeleteTarget] = useState(null);

  const handleDelete = async () => {
    await api.adminDeleteDestination(deleteTarget._id);
    setDeleteTarget(null);
    load();
  };

  const handleImageFile = (file) => {
    if (!file || !file.type.startsWith('image/')) return;
    if (file.size > 3 * 1024 * 1024) { alert('Image must be less than 3 MB'); return; }
    const reader = new FileReader();
    reader.onload = (e) => setForm(f => ({ ...f, image: e.target.result }));
    reader.readAsDataURL(file);
  };

  const isLastStep = step === STEPS.length - 1;

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 md:mb-8">
        <div>
          <h1 className="text-2xl md:text-3xl text-slate-100 font-bold">Destinations</h1>
          <p className="text-slate-300 mt-1 text-sm">Manage Kashmir travel destinations</p>
        </div>
        <button onClick={openCreate} className="bg-[#C2410C] hover:bg-[#9A3412] text-white px-5 py-2.5 rounded-xl font-bold text-sm flex items-center gap-2 transition-all shadow-sm self-start sm:self-auto shrink-0">
          <span className="material-icons text-sm">add</span> Add Destination
        </button>
      </div>

      {/* Form Modal */}
      <AdminStepModal
        isOpen={showForm}
        onClose={() => setShowForm(false)}
        title={editing ? 'Edit Destination' : 'New Destination'}
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
        submitLabel={editing ? 'Update Destination' : 'Create Destination'}
      >

              {/* Step 0 – Basic Info */}
              {step === 0 && (
                <div className="space-y-4">
                  <div>
                    <label className="text-[13px] font-bold text-slate-200 uppercase block mb-1">Destination Name <span className="text-red-400">*</span></label>
                    <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                      className={inputCls(errors.name)} placeholder="e.g., Gulmarg" />
                    <ErrMsg msg={errors.name} />
                  </div>
                  <div>
                    <label className="text-[13px] font-bold text-slate-200 uppercase block mb-1">Description <span className="text-red-400">*</span></label>
                    <textarea rows={4} value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                      className={inputCls(errors.description)} placeholder="Describe this destination..." />
                    <ErrMsg msg={errors.description} />
                  </div>
                </div>
              )}

              {/* Step 1 – Image */}
              {step === 1 && (
                <div className="space-y-4">
                  <div
                    onDrop={(e) => { e.preventDefault(); setDragOver(false); handleImageFile(e.dataTransfer.files[0]); }}
                    onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                    onDragLeave={() => setDragOver(false)}
                    className={`border-2 border-dashed rounded-xl p-5 sm:p-8 text-center transition-colors ${
                      dragOver ? 'border-[#FF8C00] bg-[#FF8C00]/5' : 'border-slate-700 bg-slate-950/60 hover:border-slate-400'
                    }`}
                  >
                    {form.image ? (
                      <div className="relative">
                        <img src={form.image} alt="Preview" className="w-full h-48 object-cover rounded-lg" />
                        <button type="button" onClick={() => setForm(f => ({ ...f, image: '' }))}
                          className="absolute top-2 right-2 bg-red-600 hover:bg-red-700 text-white p-1.5 rounded-lg transition-colors flex items-center gap-1 text-sm font-semibold">
                          <span className="material-icons text-[16px]">delete</span> Remove
                        </button>
                      </div>
                    ) : (
                      <>
                        <span className="material-icons text-5xl text-slate-300 mb-3 block">cloud_upload</span>
                        <p className="text-slate-300 font-semibold mb-1">Drag & drop an image here</p>
                        <p className="text-slate-300 text-xs mb-4">PNG, JPG, WebP (max 3 MB)</p>
                        <label className="inline-block bg-[#C2410C] hover:bg-[#9A3412] text-white px-5 py-2 rounded-lg font-semibold cursor-pointer text-sm">
                          Browse Files
                          <input type="file" accept="image/*" onChange={e => handleImageFile(e.target.files[0])} className="hidden" />
                        </label>
                      </>
                    )}
                  </div>
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                    <span className="text-xs text-slate-300 whitespace-nowrap">Or paste URL:</span>
                    <input value={form.image} onChange={e => setForm(f => ({ ...f, image: e.target.value }))}
                      className={inputCls(errors.image)} placeholder="https://example.com/image.jpg" />
                  </div>
                  <ErrMsg msg={errors.image} />
                </div>
              )}

              {/* Step 2 – Details */}
              {step === 2 && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-[13px] font-bold text-slate-200 uppercase block mb-1">Temperature</label>
                      <input value={form.temperature} onChange={e => setForm(f => ({ ...f, temperature: e.target.value }))}
                        className={inputCls()} placeholder="e.g., 12°C" />
                    </div>
                    <div>
                      <label className="text-[13px] font-bold text-slate-200 uppercase block mb-1">Weather Icon</label>
                      <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                        <select value={form.weatherIcon} onChange={e => setForm(f => ({ ...f, weatherIcon: e.target.value }))}
                          className={inputCls()}>
                          {[
                            { value: 'wb_sunny', label: 'Sunny' },
                            { value: 'partly_cloudy_day', label: 'Partly Cloudy' },
                            { value: 'cloud', label: 'Cloudy' },
                            { value: 'grain', label: 'Rain' },
                            { value: 'thunderstorm', label: 'Thunderstorm' },
                            { value: 'ac_unit', label: 'Snow' },
                            { value: 'foggy', label: 'Foggy' },
                            { value: 'air', label: 'Windy' },
                            { value: 'nights_stay', label: 'Clear Night' },
                            { value: 'wb_cloudy', label: 'Overcast' },
                            { value: 'water_drop', label: 'Drizzle' },
                            { value: 'wb_twilight', label: 'Twilight' },
                          ].map(opt => (
                            <option key={opt.value} value={opt.value}>{opt.label}</option>
                          ))}
                        </select>
                        {form.weatherIcon && <span className="material-icons text-amber-400 text-2xl flex-shrink-0">{form.weatherIcon}</span>}
                      </div>
                    </div>
                  </div>
                  <div>
                    <label className="text-[13px] font-bold text-slate-200 uppercase block mb-1">Highlights <span className="text-slate-300 normal-case font-normal">(comma-separated)</span></label>
                    <input value={form.highlights} onChange={e => setForm(f => ({ ...f, highlights: e.target.value }))}
                      className={inputCls()} placeholder="Dal Lake, Mughal Gardens, Gondola Ride" />
                  </div>
                </div>
              )}
            
      </AdminStepModal>


      {/* Table */}
      {loading ? (
        <div className="text-center py-20 text-slate-300">Loading...</div>
      ) : destinations.length === 0 ? (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl text-center py-14 text-slate-300 shadow-sm">No destinations found</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
            {destinations.map(dest => (
              <AdminCard
                key={dest._id}
                image={dest.image}
                title={dest.name || dest.slug}
                description={dest.description}
                topLeftBadges={[
                  {
                    label: dest.isActive ? '● Active' : '● Inactive',
                    className: dest.isActive
                      ? 'bg-emerald-950/80 text-emerald-200 border border-emerald-400/40'
                      : 'bg-red-950/80 text-red-200 border border-red-400/40',
                  },
                ]}
                topRightBadge={dest.temperature || null}
                bannerBottomRight={dest.slug ? '/' + dest.slug : null}
                tags={dest.highlights || []}
                tagsLabel="Highlights"
                onEdit={() => openEdit(dest)}
                onDelete={() => setDeleteTarget(dest)}
              />
            ))}
          </div>
      )}
      <DeleteConfirmModal
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        itemName={deleteTarget?.name || 'this destination'}
      />
    </div>
  );
}
