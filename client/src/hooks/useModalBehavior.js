import { useEffect } from 'react';

/**
 * Shared modal UX behavior: locks body scroll while open and closes on Escape
 * unless `disabled` is true (e.g. while a submit or delete request is in flight).
 */
export default function useModalBehavior(isOpen, onClose, disabled = false) {
  useEffect(() => {
    if (!isOpen) return undefined;

    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const onKeyDown = (e) => {
      if (e.key === 'Escape' && !disabled) {
        onClose();
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [isOpen, onClose, disabled]);
}
