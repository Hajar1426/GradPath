import Modal from './Modal';
import Button from './Button';

// Usage: <ConfirmationDialog open={open} title="Deactivate account?" message="..."
//          confirmLabel="Deactivate" variant="danger" onConfirm={...} onCancel={...} />
export default function ConfirmationDialog({
                                               open,
                                               title,
                                               message,
                                               confirmLabel = 'Confirm',
                                               cancelLabel = 'Cancel',
                                               variant = 'primary',
                                               onConfirm,
                                               onCancel,
                                           }) {
    return (
        <Modal
            open={open}
            title={title}
            onClose={onCancel}
            footer={
                <>
                    <Button variant="ghost" onClick={onCancel} data-autofocus>
                        {cancelLabel}
                    </Button>
                    <Button variant={variant} onClick={onConfirm}>
                        {confirmLabel}
                    </Button>
                </>
            }
        >
            <p style={{ margin: 0 }}>{message}</p>
        </Modal>
    );
}