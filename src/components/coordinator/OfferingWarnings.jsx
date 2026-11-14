import Alert from '../common/Alert';

export default function OfferingWarnings({ warnings }) {
    if (warnings.length === 0) return null;
    return (
        <div className="warning-box" role="status">
            <Alert variant="warning" title="Please check">
                {warnings.length === 1 ? warnings[0] : null}
            </Alert>
            {warnings.length > 1 && (
                <ul className="warning-list">
                    {warnings.map((w) => (
                        <li key={w}>{w}</li>
                    ))}
                </ul>
            )}
        </div>
    );
}
