import { useState, useEffect } from 'react';
import useModalBehavior from '../../hooks/useModalBehavior';

export default function DeleteConfirmModal({ isOpen, onClose, onConfirm, itemName = 'this item' }) {
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    setError('');
  }, [isOpen, itemName]);

  useModalBehavior(isOpen, onClose, deleting);

  if (!isOpen) return null;

  const handleConfirm = async () => {
    if (deleting) return;
    setDeleting(true);
    setError('');
    try {
      await onConfirm();
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to delete. Please try again.');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[60] flex items-start sm:items-center justify-center p-4 overflow-y-auto"
      onClick={() => { if (!deleting) onClose(); }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="delete-modal-title"
    >
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md my-auto p-0 animate-in" onClick={e => e.stopPropagation()}>
        {/* Icon */}
        <div className="flex flex-col items-center pt-8 pb-2 px-6">
          <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center mb-4">
            <span className="material-icons text-red-600 text-[32px]">delete_outline</span>
          </div>
          <h3 id="delete-modal-title" className="text-lg font-bold text-slate-900 text-center">Delete {itemName}?</h3>
          <p className="text-sm text-slate-500 text-center mt-2 leading-relaxed">
            This action cannot be undone. The item will be permanently removed from your database.
          </p>
        </div>

        {/* Error */}
        {error && (
          <div className="mx-6 mt-3 flex items-center gap-2 bg-red-50 border border-red-200 text-red-600 px-4 py-2.5 rounded-lg text-sm">
            <span className="material-icons text-[16px]">error_outline</span> {error}
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-3 p-6 pt-5">
          <button
            type="button"
            onClick={onClose}
            disabled={deleting}
            className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-semibold text-sm hover:bg-slate-50 transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={deleting}
            className="flex-1 px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-semibold text-sm transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {deleting ? (
              <><span className="material-icons animate-spin text-[16px]">refresh</span> Deleting...</>
            ) : (
              <><span className="material-icons text-[16px]">delete</span> Delete</>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
