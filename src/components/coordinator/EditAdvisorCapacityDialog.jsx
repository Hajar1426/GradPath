import { useState } from 'react';
import Modal from '../common/Modal';
import Button from '../common/Button';
import Input from '../common/Input';
import { capacityOf } from '../../utils/computeAvailability';

// advisor is a row from the CCM Faculty page: it has count (current advisees).
// Render it only when there is an advisor, with key={advisor.id}, so the field starts fresh.
export default function EditAdvisorCapacityDialog({ advisor, onSave, onClose }) {
    const current = capacityOf(advisor);
    const [capacity, setCapacity] = useState(String(current));
    const [error, setError] = useState('');
    const min = Math.max(1, advisor.count);

    function handleSave() {
        const value = Number(capacity);
        if (!Number.isInteger(value) || value < 1) {
            setError('Enter a whole number of slots, 1 or more.');
            return;
        }
        if (value < advisor.count) {
            setError(
                `${advisor.name} already has ${advisor.count} advisees, so capacity can't be less than ${min}. To stop new students, use Override → Unavailable instead.`,
            );
            return;
        }
        if (value === current) {
            onClose();
            return;
        }
        onSave({ capacity: value });
    }

    return (
        <Modal
            open
            title={`Edit slots for ${advisor.name}`}
            onClose={onClose}
            footer={
                <>
                    <Button variant="ghost" onClick={onClose}>Cancel</Button>
                    <Button onClick={handleSave}>Save changes</Button>
                </>
            }
        >
            <p style={{ marginTop: 0 }}>
                Currently assigned: <strong>{advisor.count}</strong> advisees.When 75% of the slots are used,
                students see Limited availability. When every slot is used, they see Unavailable.
            </p>
            <Input
                label="Maximum advisee slots"
                type="number"
                min={min}
                step="1"
                inputMode="numeric"
                value={capacity}
                onChange={(e) => {
                    setCapacity(e.target.value);
                    setError('');
                }}
                error={error}
                hint={`At least ${min}. Only the coordinator can change this.`}
                required
                data-autofocus
            />
        </Modal>
    );
}
