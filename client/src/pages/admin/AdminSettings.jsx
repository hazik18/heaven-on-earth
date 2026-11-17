import { useState, useEffect } from 'react';
import {
  getWhatsAppConfig,
  getContactConfig,
  fetchSettingsFromServer,
  saveSettingsToServer,
} from '../../utils/whatsapp';

export default function AdminSettings() {
  const [phone, setPhone] = useState('');
  const [template, setTemplate] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;
    // Pull the latest from the server so we don't edit stale localStorage values.
    fetchSettingsFromServer().finally(() => {
      if (cancelled) return;
      const config = getWhatsAppConfig();
      const contact = getContactConfig();
      setPhone(config.phone);
      setTemplate(config.template);
      setContactPhone(contact.contactPhone);
      setContactEmail(contact.contactEmail);
    });
    return () => { cancelled = true; };
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    setError('');
    setSaving(true);
    try {
      await saveSettingsToServer({
        whatsapp: { phone: phone.trim(), template: template.trim() },
        contact: { contactPhone: contactPhone.trim(), contactEmail: contactEmail.trim() },
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      setError(err.message || 'Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  const previewMessage = template.replace(/\{itemName\}/g, 'Dal Lake Houseboat Stay');

  return (
    <div>
      <div className="mb-6 md:mb-8">
        <h1 className="text-2xl md:text-3xl text-slate-900 font-bold">Settings</h1>
        <p className="text-slate-600 mt-1 text-sm">Manage WhatsApp enquiry settings</p>
      </div>

      <form onSubmit={handleSave} className="max-w-2xl space-y-8">
        {/* WhatsApp Number */}
        <div className="bg-slate-100/50 rounded-2xl p-4 md:p-8 border border-slate-300/50">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-green-500/10 flex items-center justify-center shrink-0">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="#25D366"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
            </div>
            <div>
              <h2 className="text-xl text-slate-900 font-bold">WhatsApp Configuration</h2>
              <p className="text-sm text-slate-500">Set your WhatsApp business number and message template</p>
            </div>
          </div>

          <div className="space-y-5">
            <div>
              <label className="block text-sm font-semibold text-slate-600 mb-2">
                WhatsApp Phone Number
              </label>
              <p className="text-xs text-slate-500 mb-2">Enter with country code, no spaces or dashes (e.g. 919876543210)</p>
              <input
                type="text"
                value={phone}
                onChange={e => setPhone(e.target.value)}
                placeholder="919876543210"
                className="w-full bg-white border border-slate-300 rounded-xl px-4 py-3 text-slate-800 placeholder-slate-500 focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-600 mb-2">
                Message Template
              </label>
              <p className="text-xs text-slate-500 mb-2">
                Use <code className="bg-slate-100 px-1.5 py-0.5 rounded text-emerald-700">{'{itemName}'}</code> as a placeholder — it will be replaced with the item name (hotel, trek, package, etc.)
              </p>
              <textarea
                value={template}
                onChange={e => setTemplate(e.target.value)}
                rows={8}
                className="w-full bg-white border border-slate-300 rounded-xl px-4 py-3 text-slate-800 placeholder-slate-500 focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all resize-none font-mono text-sm leading-relaxed"
                required
              />
            </div>
          </div>
        </div>

        {/* Contact Info */}
        <div className="bg-slate-100/50 rounded-2xl p-4 md:p-8 border border-slate-300/50">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center shrink-0">
              <span className="material-icons text-blue-700">contact_phone</span>
            </div>
            <div>
              <h2 className="text-xl text-slate-900 font-bold">Contact Information</h2>
              <p className="text-sm text-slate-500">Phone number and email shown in the website footer</p>
            </div>
          </div>

          <div className="space-y-5">
            <div>
              <label className="block text-sm font-semibold text-slate-600 mb-2">
                Display Phone Number
              </label>
              <input
                type="text"
                value={contactPhone}
                onChange={e => setContactPhone(e.target.value)}
                placeholder="+91 194 2501234"
                className="w-full bg-white border border-slate-300 rounded-xl px-4 py-3 text-slate-800 placeholder-slate-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-600 mb-2">
                Display Email Address
              </label>
              <input
                type="email"
                value={contactEmail}
                onChange={e => setContactEmail(e.target.value)}
                placeholder="info@kashmiroffbeat.com"
                className="w-full bg-white border border-slate-300 rounded-xl px-4 py-3 text-slate-800 placeholder-slate-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                required
              />
            </div>
          </div>
        </div>

        {/* Preview */}
        <div className="bg-slate-100/50 rounded-2xl p-4 md:p-8 border border-slate-300/50">
          <h3 className="text-sm font-semibold text-slate-600 mb-4 flex items-center gap-2">
            <span className="material-icons text-base">preview</span>
            Message Preview
          </h3>
          <div className="bg-[#e5ddd5] rounded-xl p-4">
            <div className="bg-[#dcf8c6] rounded-lg px-4 py-3 max-w-md ml-auto shadow-sm">
              <p className="text-sm text-slate-800 whitespace-pre-wrap leading-relaxed">{previewMessage}</p>
              <p className="text-xs text-slate-600 text-right mt-1">Now ✓✓</p>
            </div>
          </div>
        </div>

        {/* Save Button */}
        <div className="flex items-center gap-4 flex-wrap">
          <button
            type="submit"
            disabled={saving}
            className="px-8 py-3 bg-emerald-700 hover:bg-emerald-800 disabled:opacity-60 disabled:cursor-not-allowed text-white font-bold rounded-xl transition-all duration-200 flex items-center gap-2"
          >
            <span className="material-icons text-lg">save</span>
            {saving ? 'Saving...' : 'Save Settings'}
          </button>
          {saved && (
            <span className="flex items-center gap-1.5 text-emerald-700 font-medium text-sm animate-pulse">
              <span className="material-icons text-base">check_circle</span>
              Settings saved successfully!
            </span>
          )}
          {error && (
            <span className="flex items-center gap-1.5 text-red-600 font-medium text-sm">
              <span className="material-icons text-base">error</span>
              {error}
            </span>
          )}
        </div>
      </form>
    </div>
  );
}
