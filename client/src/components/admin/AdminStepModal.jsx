/**
 * Shared Compact Top Bar multi-step modal shell (`max-w-2xl`) for Admin CRUD forms.
 */
export default function AdminStepModal({
  isOpen,
  onClose,
  title,
  subtitle,
  steps,
  step,
  onStepClick,
  onBack,
  onNext,
  onSubmit,
  saving = false,
  submitError,
  submitLabel = 'Save',
  children,
}) {
  if (!isOpen) return null;
  const isLastStep = step === steps.length - 1;

  return (
    <div
      className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-start sm:items-center justify-center p-2 sm:p-4 overflow-y-auto"
      onClick={() => { if (!saving) onClose(); }}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl my-2 sm:my-8 flex flex-col max-h-[calc(100dvh-1rem)] sm:max-h-[90vh] shadow-2xl overflow-hidden text-slate-100"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between gap-2 px-4 py-3 sm:px-6 sm:py-4 border-b border-slate-800 shrink-0">
          <div className="min-w-0">
            <h2 className="text-base sm:text-lg font-bold text-white leading-tight truncate">{title}</h2>
            {subtitle && (
              <p className="text-xs text-white truncate mt-0.5">{subtitle}</p>
            )}
          </div>
          <button
            type="button"
            aria-label="Close modal"
            onClick={() => { if (!saving) onClose(); }}
            className="p-2 hover:bg-slate-800 rounded-xl transition-colors text-slate-300 hover:text-white shrink-0"
          >
            <span className="material-icons text-[20px]">close</span>
          </button>
        </div>

        {/* Compact Top Bar Stepper */}
        <div className="px-4 py-2.5 sm:px-6 sm:py-3 border-b border-slate-800 bg-slate-950/60 overflow-x-auto shrink-0">
          <div className="flex items-center gap-2">
            {steps.map((s, i) => {
              const active = i === step;
              const done = i < step;
              return (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => onStepClick(i)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap flex items-center gap-1.5 transition-colors ${
                    active
                      ? 'bg-[#C2410C] text-white shadow-sm'
                      : done
                      ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 hover:bg-emerald-500/25'
                      : 'bg-slate-900 border border-slate-700 text-slate-300 hover:text-white hover:border-slate-600'
                  }`}
                >
                  <span>{done ? '✓' : `${i + 1}.`}</span>
                  <span>{s.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Body */}
        <div className="p-4 sm:p-6 flex-1 overflow-y-auto space-y-4 sm:space-y-5">
          {children}
        </div>

        {/* Footer */}
        <div className="px-4 py-3 sm:px-6 sm:py-4 border-t border-slate-800 bg-slate-950/60 shrink-0">
          {submitError && (
            <div className="mb-3 px-4 py-2.5 bg-red-500/10 border border-red-500/30 rounded-xl text-xs text-red-400 flex items-center gap-2">
              <span className="material-icons text-[16px]">error_outline</span>
              {submitError}
            </div>
          )}
          <div className="flex flex-wrap sm:flex-nowrap items-center justify-between gap-2 sm:gap-3">
            <button
              type="button"
              onClick={step === 0 ? onClose : onBack}
              disabled={saving}
              className="flex items-center gap-1.5 px-3 sm:px-4 py-2 rounded-xl border border-slate-700 bg-slate-800 text-slate-200 hover:bg-slate-700 disabled:opacity-50 transition-colors text-sm font-semibold"
            >
              <span className="material-icons text-[17px]">{step === 0 ? 'close' : 'arrow_back'}</span>
              {step === 0 ? 'Cancel' : 'Back'}
            </button>

            <span className="text-xs font-medium text-white order-first w-full text-center sm:order-none sm:w-auto">
              Step {step + 1} of {steps.length}
            </span>

            {isLastStep ? (
              <button
                type="button"
                onClick={onSubmit}
                disabled={saving}
                className="flex items-center gap-1.5 px-3.5 sm:px-5 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 disabled:opacity-50 text-white font-bold text-sm transition-colors shadow-sm"
              >
                {saving ? (
                  <>
                    <span className="material-icons animate-spin text-[17px]">refresh</span>
                    Saving...
                  </>
                ) : (
                  <>
                    <span className="material-icons text-[17px]">check</span>
                    {submitLabel}
                  </>
                )}
              </button>
            ) : (
              <button
                type="button"
                onClick={onNext}
                className="flex items-center gap-1.5 px-3.5 sm:px-5 py-2 rounded-xl bg-[#C2410C] hover:bg-[#9A3412] text-white font-bold text-sm transition-colors shadow-sm"
              >
                Next
                <span className="material-icons text-[17px]">arrow_forward</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
