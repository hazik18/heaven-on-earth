import { useState, useRef, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';

export default function CustomSelect({ value, onChange, options, placeholder = 'Select...', icon, label, variant = 'default' }) {
  const [open, setOpen] = useState(false);
  const [pos, setPos] = useState({ top: 0, left: 0, width: 0 });
  const triggerRef = useRef(null);
  const dropdownRef = useRef(null);

  const selected = options.find(o => String(o.value) === String(value));

  const updatePosition = useCallback(() => {
    if (!triggerRef.current) return;
    const rect = triggerRef.current.getBoundingClientRect();
    setPos({
      top: rect.bottom + 6,
      left: rect.left,
      width: Math.max(rect.width, 200),
    });
  }, []);

  useEffect(() => {
    const handleClose = (e) => {
      if (
        triggerRef.current && !triggerRef.current.contains(e.target) &&
        dropdownRef.current && !dropdownRef.current.contains(e.target)
      ) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClose);
    return () => document.removeEventListener('mousedown', handleClose);
  }, []);

  useEffect(() => {
    if (open) {
      updatePosition();
      window.addEventListener('scroll', updatePosition, true);
      window.addEventListener('resize', updatePosition);
      return () => {
        window.removeEventListener('scroll', updatePosition, true);
        window.removeEventListener('resize', updatePosition);
      };
    }
  }, [open, updatePosition]);

  const styles = {
    default: {
      trigger: 'bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white hover:border-slate-500 transition-all',
      dropdown: 'bg-slate-900 border border-slate-700/80 shadow-[0_16px_48px_rgba(0,0,0,0.5)]',
      item: 'hover:bg-white/5 text-slate-300 hover:text-white',
      active: 'bg-primary/10 text-primary',
    },
    hero: {
      trigger: 'bg-transparent text-sm font-bold text-slate-900 p-0 border-none',
      dropdown: 'bg-white backdrop-blur-2xl border-2 border-slate-300 shadow-2xl',
      item: 'hover:bg-orange-50 text-slate-900 hover:text-[#FF8C00]',
      active: 'bg-orange-100 text-[#FF8C00]',
    },
    admin: {
      trigger: 'w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2.5 text-sm text-white hover:border-slate-500 transition-all',
      dropdown: 'bg-slate-900 border border-slate-700/80 shadow-[0_16px_48px_rgba(0,0,0,0.5)]',
      item: 'hover:bg-white/5 text-slate-300 hover:text-white',
      active: 'bg-primary/10 text-primary',
    },
    inline: {
      trigger: 'bg-slate-800/80 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white hover:border-slate-500 transition-all',
      dropdown: 'bg-slate-900 border border-slate-700/80 shadow-[0_12px_36px_rgba(0,0,0,0.5)]',
      item: 'hover:bg-white/5 text-slate-300 hover:text-white text-xs py-2',
      active: 'bg-primary/10 text-primary text-xs',
    },
  };

  const s = styles[variant] || styles.default;

  const dropdown = open ? createPortal(
    <div
      ref={dropdownRef}
      className={`fixed z-[9999] rounded-xl overflow-hidden ${s.dropdown}`}
      style={{
        top: pos.top,
        left: pos.left,
        width: pos.width,
        animation: 'dropdownIn 0.15s ease-out',
      }}
    >
      <div className="max-h-[260px] overflow-y-auto custom-scrollbar py-1">
        {options.map((opt) => (
          <button
            key={String(opt.value)}
            type="button"
            onClick={() => { onChange(opt.value); setOpen(false); }}
            className={`w-full text-left px-4 py-2.5 flex items-center gap-3 transition-colors text-sm ${
              String(value) === String(opt.value) ? s.active : s.item
            }`}
          >
            {opt.icon && (
              <span className="material-icons text-[16px] opacity-50">{opt.icon}</span>
            )}
            <span className="flex-1 truncate font-medium">{opt.label}</span>
            {String(value) === String(opt.value) && (
              <span className="material-icons text-primary text-[16px]">check</span>
            )}
          </button>
        ))}
      </div>
    </div>,
    document.body
  ) : null;

  return (
    <div className="relative">
      {label && <label className="text-xs font-bold text-slate-400 uppercase block mb-1">{label}</label>}
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setOpen(!open)}
        className={`flex items-center justify-between gap-2 cursor-pointer ${s.trigger} ${variant !== 'hero' ? 'w-full' : ''}`}
      >
        <span className="flex items-center gap-2 truncate">
          {icon && <span className="material-icons text-accent-gold text-[18px]">{icon}</span>}
          <span className={`${variant === 'hero' ? (selected ? 'text-slate-900 font-bold' : 'text-slate-600') : (selected ? 'text-white' : 'text-slate-300')}`}>
            {selected ? selected.label : placeholder}
          </span>
        </span>
        <span className={`material-icons text-[18px] ${variant === 'hero' ? 'text-slate-500' : 'text-slate-300'} transition-transform duration-200 ${open ? 'rotate-180' : ''}`}>
          expand_more
        </span>
      </button>
      {dropdown}
    </div>
  );
}
