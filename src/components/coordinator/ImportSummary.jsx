import StatusBadge from '../common/StatusBadge';
import { IMPORT_ROW_STATUS } from '../../data/statusValues';

const LABELS = {
    [IMPORT_ROW_STATUS.NEW]: 'New',
    [IMPORT_ROW_STATUS.UPDATED]: 'Updated',
    [IMPORT_ROW_STATUS.DUPLICATE]: 'Duplicate',
    [IMPORT_ROW_STATUS.INVALID]: 'Invalid',
};

export default function ImportSummary({ summary }) {
    return (
        <ul className="import-summary" aria-label="Import summary">
            {Object.values(IMPORT_ROW_STATUS).map((status) => (
                <li key={status} className="import-summary__item">
                    <span className="import-summary__value">{summary?.[status] ?? 0}</span>
                    <StatusBadge status={status} label={LABELS[status]} />
                </li>
            ))}
        </ul>
    );
}
