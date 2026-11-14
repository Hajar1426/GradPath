import StatusBadge from '../common/StatusBadge';
import { AVAILABILITY_LABEL } from '../../utils/computeAvailability';

export default function AvailabilityBadge({ value }) {
    return <StatusBadge status={value} label={AVAILABILITY_LABEL[value] ?? value} />;
}
