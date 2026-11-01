const TONE_BY_STATUS = {
    active: 'success', available: 'success', approved: 'success', published: 'success',
    evaluated: 'success', resolved: 'success', satisfactory: 'success',
    pending: 'warning', limited: 'warning', in_progress: 'warning', needs_improvement: 'warning',
    changes_requested: 'warning', medium: 'warning', duplicate: 'warning', open: 'warning',
    disabled: 'danger', unavailable: 'danger', rejected: 'danger', unsatisfactory: 'danger',
    high: 'danger', invalid: 'danger',
    submitted: 'info', new: 'info', updated: 'info',
    draft: 'neutral', archived: 'neutral', low: 'neutral',
};

function prettify(status) {
    const text = String(status).replace(/_/g, ' ');
    return text.charAt(0).toUpperCase() + text.slice(1);
}

export default function StatusBadge({ status, label, tone }) {
    const chosenTone = tone ?? TONE_BY_STATUS[status] ?? 'neutral';
    return <span className={`badge badge--${chosenTone}`}>{label ?? prettify(status)}</span>;
}