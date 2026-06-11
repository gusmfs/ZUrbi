import { useEffect, useId } from 'react';
import Button from './Button';

export default function Modal({
  isOpen,
  onClose,
  title,
  children,
  footer,
  className = '',
}) {
  const titleId = useId();

  useEffect(() => {
    if (!isOpen) return undefined;

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') onClose();
    };

    document.addEventListener('keydown', handleKeyDown);
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="modal-backdrop"
      role="presentation"
      onClick={onClose}
    >
      <div
        className={`modal ${className}`.trim()}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        onClick={(event) => event.stopPropagation()}
      >
        <div className="modal__header">
          <h2 id={titleId} className="modal__title">
            {title}
          </h2>
          <button
            type="button"
            className="modal__close"
            onClick={onClose}
            aria-label="Fechar"
          >
            ✕
          </button>
        </div>
        <div className="modal__body">{children}</div>
        {footer && <div className="modal__footer">{footer}</div>}
      </div>
    </div>
  );
}

export function ModalActions({ onCancel, onConfirm, confirmLabel = 'Confirmar', cancelLabel = 'Cancelar', loading = false }) {
  return (
    <>
      <Button variant="secondary" onClick={onCancel} disabled={loading}>
        {cancelLabel}
      </Button>
      <Button variant="primary" onClick={onConfirm} disabled={loading}>
        {loading ? 'Aguarde...' : confirmLabel}
      </Button>
    </>
  );
}
