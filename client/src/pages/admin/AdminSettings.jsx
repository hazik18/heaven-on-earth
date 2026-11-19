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
        <h1 className="text-2xl md:text-3xl text-white font-bold">Settings</h1>
        <p className="text-slate-200 mt-1 text-sm">Manage WhatsApp enquiry and public contact settings</p>
      </div>

      <form onSubmit={handleSave} className="grid grid-cols-1 xl:grid-cols-3 gap-6 items-start">
        <div className="xl:col-span-2 space-y-6">
          {/* WhatsApp Number & Template */}
          <div className="bg-slate-900 rounded-2xl p-4 sm:p-5 md:p-7 border border-slate-800 shadow-lg">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-green-500/15 border border-green-500/30 flex items-center justify-center shrink-0">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="#25D366"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
              </div>
              <div>
                <h2 className="text-lg text-white font-bold">WhatsApp Configuration</h2>
                <p className="text-sm text-slate-200">Set your WhatsApp business number and message template</p>
              </div>
            </div>

            <div className="space-y-5">
              <div>
                <label className="block text-sm font-semibold text-white mb-1.5">
                  WhatsApp Phone Number
                </label>
                <p className="text-xs text-slate-300 mb-2">Enter with country code, no spaces or dashes (e.g. 919876543210)</p>
                <input
                  type="text"
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  placeholder="919876543210"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-white placeholder-slate-400 focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 outline-none transition-all"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-white mb-1.5">
                  Message Template
                </label>
                <p className="text-xs text-slate-300 mb-2">
                  Use <code className="bg-slate-800 border border-slate-700 px-1.5 py-0.5 rounded text-emerald-300">{'{itemName}'}</code> as a placeholder — replaced automatically with the item name.
                </p>
                <textarea
                  value={template}
                  onChange={e => setTemplate(e.target.value)}
                  rows={7}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-white placeholder-slate-400 focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 outline-none transition-all resize-none font-mono text-sm leading-relaxed"
                  required
                />
              </div>
            </div>
          </div>

          {/* Contact Info */}
          <div className="bg-slate-900 rounded-2xl p-4 sm:p-5 md:p-7 border border-slate-800 shadow-lg">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-blue-500/15 border border-blue-500/30 flex items-center justify-center shrink-0">
                <span className="material-icons text-blue-400">contact_phone</span>
              </div>
              <div>
                <h2 className="text-lg text-white font-bold">Contact Information</h2>
                <p className="text-sm text-slate-200">Phone number and email shown in the website footer</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-semibold text-white mb-2">
                  Display Phone Number
                </label>
                <input
                  type="text"
                  value={contactPhone}
                  onChange={e => setContactPhone(e.target.value)}
                  placeholder="+91 194 2501234"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-white placeholder-slate-400 focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 outline-none transition-all"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-white mb-2">
                  Display Email Address
                </label>
                <input
                  type="email"
                  value={contactEmail}
                  onChange={e => setContactEmail(e.target.value)}
                  placeholder="info@kashmiroffbeat.com"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-white placeholder-slate-400 focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 outline-none transition-all"
                  required
                />
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Live Preview & Save */}
        <div className="space-y-6 xl:sticky xl:top-6">
          <div className="bg-slate-900 rounded-2xl p-4 sm:p-5 md:p-6 border border-slate-800 shadow-lg">
            <h3 className="text-base font-bold text-white mb-1 flex items-center gap-2">
              <span className="material-icons text-emerald-400 text-[20px]">preview</span>
              Live Message Preview
            </h3>
            <p className="text-xs text-slate-300 mb-4">How the pre-filled WhatsApp enquiry appears to visitors</p>
            <div className="bg-[#0b141a] border border-slate-800 rounded-xl p-4">
              <div className="bg-[#005c4b] rounded-xl px-4 py-3 shadow-sm">
                <p className="text-sm text-white whitespace-pre-wrap leading-relaxed break-words">{previewMessage || 'Your message preview will appear here...'}</p>
                <p className="text-xs text-emerald-200 text-right mt-1.5">Now ✓✓</p>
              </div>
            </div>
          </div>

          <div className="bg-slate-900 rounded-2xl p-5 border border-slate-800 shadow-lg space-y-3">
            <button
              type="submit"
              disabled={saving}
              className="w-full px-6 py-3 bg-[#C2410C] hover:bg-[#9A3412] disabled:opacity-60 disabled:cursor-not-allowed text-white font-bold rounded-xl transition-all duration-200 flex items-center justify-center gap-2 shadow-sm"
            >
              <span className="material-icons text-lg">save</span>
              {saving ? 'Saving...' : 'Save Settings'}
            </button>
            {saved && (
              <div className="flex items-center justify-center gap-1.5 text-emerald-400 font-semibold text-sm">
                <span className="material-icons text-base">check_circle</span>
                Settings saved successfully!
              </div>
            )}
            {error && (
              <div className="flex items-center justify-center gap-1.5 text-red-400 font-semibold text-sm">
                <span className="material-icons text-base">error</span>
                {error}
              </div>
            )}
          </div>
        </div>
      </form>
    </div>
  );
}
