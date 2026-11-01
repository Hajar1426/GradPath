import { useEffect, useId, useRef } from 'react';

// Usage: <Modal open={isOpen} title="Edit" onClose={() => setOpen(false)} footer={<Buttons />}>...</Modal>
// Put data-autofocus on the element that should get focus first.
export default function Modal({ open, title, onClose, children, footer }) {
    const dialogRef = useRef(null);
    const titleId = useId();

    useEffect(() => {
        const dialog = dialogRef.current;
        if (!dialog) return;
        if (open && !dialog.open) {
            dialog.showModal();
            dialog.querySelector('[data-autofocus]')?.focus();
        }
        if (!open && dialog.open) {
            dialog.close();
        }
    }, [open]);

    function handleNativeClose() {
        // Fires when the user presses Escape. Ignore it when we closed the dialog ourselves.
        if (open) onClose();
    }

    function handleBackdropClick(event) {
        if (event.target === dialogRef.current) onClose();
    }

    return (
        <dialog
            ref={dialogRef}
            className="modal"
            aria-labelledby={titleId}
            onClose={handleNativeClose}
            onClick={handleBackdropClick}
        >
            {open && (
                <div className="modal__content">
                    <header className="modal__header">
                        <h2 className="modal__title" id={titleId}>{title}</h2>
                        <button type="button" className="modal__close" onClick={onClose} aria-label="Close">
                            ×
                        </button>
                    </header>
                    <div className="modal__body">{children}</div>
                    {footer && <footer className="modal__footer">{footer}</footer>}
                </div>
            )}
        </dialog>
    );
}