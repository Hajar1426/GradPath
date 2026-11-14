import { useState } from 'react';
import Modal from '../common/Modal';
import Button from '../common/Button';
import Select from '../common/Select';
import Textarea from '../common/Textarea';
import { AVAILABILITY } from '../../data/statusValues';
import { AVAILABILITY_LABEL } from '../../utils/computeAvailability';

const OPTIONS = Object.values(AVAILABILITY).map((value) => ({ value, label: AVAILABILITY_LABEL[value] }));

// Render with key={advisor.id} so the form starts fresh for each advisor.
export default function AvailabilityOverrideDialog({ advisor, autoValue, onSave, onClose }) {
    const [value, setValue] = useState(advisor?.coordinatorOverride?.value ?? autoValue ?? AVAILABILITY.AVAILABLE);
    const [reason, setReason] = useState(advisor?.coordinatorOverride?.reason ?? '');
    const [error, setError] = useState('');

    function handleSave() {
        if (reason.trim().length < 5) {
            setError('Write a short reason (at least 5 characters). It is kept in the override history.');
            return;
        }
        onSave({ value, reason: reason.trim() });
    }

    return (
        <Modal
            open={Boolean(advisor)}
            title={`Override availability for ${advisor?.name ?? ''}`}
            onClose={onClose}
            footer={
                <>
                    <Button variant="ghost" onClick={onClose}>Cancel</Button>
                    <Button onClick={handleSave}>Save override</Button>
                </>
            }
        >
            <p style={{ marginTop: 0 }}>
                Automatic availability is <strong>{AVAILABILITY_LABEL[autoValue]}</strong>. An override replaces it until you
                change or remove it. Students see the result on the advisor directory.
            </p>
            <Select label="Availability" options={OPTIONS} value={value} onChange={(e) => setValue(e.target.value)} data-autofocus />
            <Textarea
                label="Reason"
                required
                value={reason}
                onChange={(e) => {
                    setReason(e.target.value);
                    setError('');
                }}
                error={error}
                hint="For example: On sabbatical leave for Term 261."
            />
        </Modal>
    );
}
