import { useState } from 'react';
import Modal from '../common/Modal';
import Button from '../common/Button';
import Textarea from '../common/Textarea';
import Alert from '../common/Alert';
import { AUTHORIZATION_STATUS } from '../../data/statusValues';

// decision is AUTHORIZATION_STATUS.APPROVED or REJECTED. Render with a key so the note resets.
export default function AuthorizationDecisionDialog({ request, decision, studentName, onConfirm, onClose }) {
    const [note, setNote] = useState('');
    const [error, setError] = useState('');
    const approving = decision === AUTHORIZATION_STATUS.APPROVED;

    function handleConfirm() {
        if (!approving && note.trim().length < 5) {
            setError('Explain why the request is rejected. The student will see this note.');
            return;
        }
        onConfirm(note.trim());
    }

    return (
        <Modal
            open={Boolean(request)}
            title={approving ? 'Approve authorization?' : 'Reject authorization?'}
            onClose={onClose}
            footer={
                <>
                    <Button variant="ghost" onClick={onClose}>Cancel</Button>
                    <Button variant={approving ? 'primary' : 'danger'} onClick={handleConfirm}>
                        {approving ? 'Approve' : 'Reject'}
                    </Button>
                </>
            }
        >
            <p style={{ marginTop: 0 }}>
                {studentName} asked for authorization for <strong>{request?.courseCode}</strong> in term {request?.term}.
            </p>
            <Alert variant="info">
                This records the decision only. It does not register the student in the course and does not change any seats.
                {approving ? ' The student continues in the university portal to register.' : ''}
            </Alert>
            <Textarea
                label={approving ? 'Note to the student (optional)' : 'Reason for rejecting'}
                required={!approving}
                value={note}
                onChange={(e) => {
                    setNote(e.target.value);
                    setError('');
                }}
                error={error}
                data-autofocus
            />
        </Modal>
    );
}
