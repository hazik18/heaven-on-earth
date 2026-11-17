import { useState, useEffect } from 'react';
import api from '../../api';
import useModalBehavior from '../../hooks/useModalBehavior';
import DeleteConfirmModal from '../../components/admin/DeleteConfirmModal';

const STEPS = [
  { id: 0, label: 'Basic Info',  icon: 'info' },
  { id: 1, label: 'Image',       icon: 'image' },
  { id: 2, label: 'Details',     icon: 'thermostat' },
];

const emptyForm = { name: '', description: '', image: '', temperature: '', weatherIcon: 'wb_sunny', highlights: '' };

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
          <h1 className="text-2xl md:text-3xl text-slate-900 font-bold">Destinations</h1>
          <p className="text-slate-600 mt-1 text-sm">Manage Kashmir travel destinations</p>
        </div>
        <button onClick={openCreate} className="bg-[#C2410C] hover:bg-[#9A3412] text-white px-5 py-2.5 rounded-xl font-bold text-sm flex items-center gap-2 transition-all shadow-sm self-start sm:self-auto shrink-0">
          <span className="material-icons text-sm">add</span> Add Destination
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
          <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-6xl my-8 shadow-xl" onClick={e => e.stopPropagation()}>

            {/* Header */}
            <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-slate-200">
              <h2 className="text-xl font-bold text-slate-800">{editing ? 'Edit Destination' : 'New Destination'}</h2>
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
                      }`}>
                        {i < step ? <span className="material-icons text-[16px]">check</span> : i + 1}
                      </div>
                      <span className={`text-xs font-semibold whitespace-nowrap ${
                        i === step ? 'text-[#C2410C]' : i < step ? 'text-emerald-700' : 'text-slate-400'
                      }`}>{s.label}</span>
                    </button>
                    {i < STEPS.length - 1 && <div className={`flex-1 h-0.5 mx-2 mb-5 transition-colors ${i < step ? 'bg-green-500' : 'bg-slate-200'}`} />}
                  </div>
                ))}
              </div>
            </div>

            {/* Step Content */}
            <div className="px-6 md:px-8 py-6 max-h-[68vh] overflow-y-auto">

              {/* Step 0 – Basic Info */}
              {step === 0 && (
                <div className="space-y-4">
                  <div>
                    <label className="text-[13px] font-bold text-slate-700 uppercase block mb-1">Destination Name <span className="text-red-600">*</span></label>
                    <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                      className={inputCls(errors.name)} placeholder="e.g., Gulmarg" />
                    <ErrMsg msg={errors.name} />
                  </div>
                  <div>
                    <label className="text-[13px] font-bold text-slate-700 uppercase block mb-1">Description <span className="text-red-600">*</span></label>
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
                    className={`border-2 border-dashed rounded-xl p-8 text-center transition-colors ${
                      dragOver ? 'border-[#FF8C00] bg-[#FF8C00]/5' : 'border-slate-300 bg-slate-50 hover:border-slate-400'
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
                        <span className="material-icons text-5xl text-slate-400 mb-3 block">cloud_upload</span>
                        <p className="text-slate-600 font-semibold mb-1">Drag & drop an image here</p>
                        <p className="text-slate-400 text-xs mb-4">PNG, JPG, WebP (max 3 MB)</p>
                        <label className="inline-block bg-[#C2410C] hover:bg-[#9A3412] text-white px-5 py-2 rounded-lg font-semibold cursor-pointer text-sm">
                          Browse Files
                          <input type="file" accept="image/*" onChange={e => handleImageFile(e.target.files[0])} className="hidden" />
                        </label>
                      </>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-400 whitespace-nowrap">Or paste URL:</span>
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
                      <label className="text-[13px] font-bold text-slate-700 uppercase block mb-1">Temperature</label>
                      <input value={form.temperature} onChange={e => setForm(f => ({ ...f, temperature: e.target.value }))}
                        className={inputCls()} placeholder="e.g., 12°C" />
                    </div>
                    <div>
                      <label className="text-[13px] font-bold text-slate-700 uppercase block mb-1">Weather Icon</label>
                      <div className="flex items-center gap-2">
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
                        {form.weatherIcon && <span className="material-icons text-amber-600 text-2xl flex-shrink-0">{form.weatherIcon}</span>}
                      </div>
                    </div>
                  </div>
                  <div>
                    <label className="text-[13px] font-bold text-slate-700 uppercase block mb-1">Highlights <span className="text-slate-400 normal-case font-normal">(comma-separated)</span></label>
                    <input value={form.highlights} onChange={e => setForm(f => ({ ...f, highlights: e.target.value }))}
                      className={inputCls()} placeholder="Dal Lake, Mughal Gardens, Gondola Ride" />
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
                    className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 disabled:opacity-50 text-white font-bold text-sm transition-colors shadow-sm">
                    {saving ? <><span className="material-icons animate-spin text-[18px]">refresh</span> Saving...</> :
                      <><span className="material-icons text-[18px]">{editing ? 'save' : 'add_circle'}</span> {editing ? 'Update Destination' : 'Create Destination'}</>}
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

      {/* Table */}
      {loading ? (
        <div className="text-center py-20 text-slate-600">Loading...</div>
      ) : (
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-slate-500 border-b border-slate-200 bg-slate-50">
                  <th className="px-6 py-4 font-bold">Name</th>
                  <th className="px-6 py-4 font-bold">Temperature</th>
                  <th className="px-6 py-4 font-bold">Highlights</th>
                  <th className="px-6 py-4 font-bold">Status</th>
                  <th className="px-6 py-4 font-bold text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {destinations.map(dest => (
                  <tr key={dest._id} className="border-b border-slate-200 hover:bg-slate-100/70">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3 font-bold">
                        {dest.image && <img src={dest.image} alt="" className="w-10 h-10 rounded-lg object-cover" />}
                        <div>
                   
                          <p className="text-[13px] text-slate-600">{dest.slug}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-slate-600">{dest.temperature || '-'}</td>
                    <td className="px-6 py-4 text-slate-500 text-xs">{(dest.highlights || []).join(', ') || '-'}</td>
                    <td className="px-6 py-4">
                      <span className={`text-xs font-bold ${dest.isActive ? 'text-emerald-700' : 'text-red-600'}`}>
                        {dest.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button onClick={() => openEdit(dest)} className="p-2 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-slate-700 transition-colors">
                        <span className="material-icons text-sm">edit</span>
                      </button>
                      <button onClick={() => setDeleteTarget(dest)} className="p-2 hover:bg-red-50 rounded-lg text-slate-400 hover:text-red-600 transition-colors ml-1">
                        <span className="material-icons text-sm">delete</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {destinations.length === 0 && (
            <div className="text-center py-12 text-slate-500">No destinations found</div>
          )}
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
