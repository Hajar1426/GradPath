import { useCallback, useMemo, useRef, useState } from 'react';
import { ToastContext } from './contexts';
import Toast from '../components/common/Toast';

const DURATION = 4000;

export function ToastProvider({ children }) {
    const [toasts, setToasts] = useState([]);
    const nextId = useRef(1);

    const dismiss = useCallback((id) => {
        setToasts((list) => list.filter((toast) => toast.id !== id));
    }, []);

    const showToast = useCallback(
        (message, variant = 'success') => {
            const id = nextId.current++;
            setToasts((list) => [...list, { id, message, variant }]);
            setTimeout(() => dismiss(id), DURATION);
        },
        [dismiss],
    );

    const value = useMemo(() => ({ showToast }), [showToast]);

    return (
        <ToastContext.Provider value={value}>
            {children}
            <div className="toast-region" aria-live="polite">
                {toasts.map((toast) => (
                    <Toast
                        key={toast.id}
                        variant={toast.variant}
                        message={toast.message}
                        onClose={() => dismiss(toast.id)}
                    />
                ))}
            </div>
        </ToastContext.Provider>
    );
}