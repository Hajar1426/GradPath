import { Link, useSearchParams } from 'react-router-dom';
import PageHeader from '../../components/layout/PageHeader';
import Alert from '../../components/common/Alert';
import EmptyState from '../../components/common/EmptyState';
import StatusBadge from '../../components/common/StatusBadge';
import EditOnly from '../../components/common/EditOnly';
import ImportSummary from '../../components/coordinator/ImportSummary';
import { useData } from '../../hooks/useData';
import { IMPORT_KINDS } from '../../utils/importRules';
import { formatDateTime } from '../../utils/formatDate';
import { nameOfUser } from '../../utils/coordinatorHelpers';

export default function ImportResultPage() {
    const { data } = useData();
    const [params] = useSearchParams();
    const history = [...(data.imports ?? [])].sort((a, b) => String(b.at).localeCompare(String(a.at)));
    const id = params.get('id');
    const entry = id ? history.find((h) => h.id === id) : history[0];

    if (!entry) {
        return (
            <main className="page">
                <PageHeader title="Import result" />
                <EmptyState
                    title="Import not found"
                    message="This import is not in the history."
                    action={<Link className="btn btn--ghost" to="/coordinator/import">Back to import</Link>}
                />
            </main>
        );
    }

    const saved = entry.summary.new + entry.summary.updated;
    const isStudents = entry.kind === 'students';

    return (
        <main className="page">
            <Link className="back-link" to="/coordinator/import">← Back to import</Link>
            <PageHeader
                title="Import result"
                subtitle={`${IMPORT_KINDS[entry.kind]?.label ?? entry.kind} · ${entry.fileName} · ${formatDateTime(entry.at)} by ${nameOfUser(data, entry.by)}`}
            />
            <div style={{ marginTop: 20 }}>
                <Alert variant={saved > 0 ? 'success' : 'warning'} title={`${saved} rows saved`}>
                    {entry.summary.invalid + entry.summary.duplicate > 0
                        ? `${entry.summary.invalid} invalid and ${entry.summary.duplicate} duplicate rows were skipped.`
                        : 'Every row in the file was saved.'}
                </Alert>
            </div>
            <ImportSummary summary={entry.summary} />

            {isStudents && entry.notInSheet > 0 && (
                <Alert variant="warning" title={`${entry.notInSheet} students were not in this file`}>
                    They stay on the approved list and are flagged as "Not in latest sheet" on the student list. Nobody was deleted.
                </Alert>
            )}

            {entry.issues?.length > 0 && (
                <>
                    <h2 className="section-title">Skipped rows</h2>
                    <ul className="activity-list">
                        {entry.issues.map((issue) => (
                            <li key={issue.rowNumber}>
                                <strong>Row {issue.rowNumber}</strong> <StatusBadge status={issue.status} />
                                <span className="cell__sub">{issue.problems.join('. ')}</span>
                            </li>
                        ))}
                    </ul>
                </>
            )}

            <div className="quick-actions">
                {isStudents ? (
                    <Link className="btn" to="/coordinator/students">Open student list</Link>
                ) : (
                    <Link className="btn" to="/coordinator/offerings">Open offerings</Link>
                )}
                <EditOnly>
                    <Link className="btn btn--ghost" to="/coordinator/import">Import another file</Link>
                </EditOnly>
            </div>
        </main>
    );
}
