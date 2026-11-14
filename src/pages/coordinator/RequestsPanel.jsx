import { useState } from 'react';
import Select from '../../components/common/Select';
import Button from '../../components/common/Button';
import SearchBar from '../../components/common/SearchBar';
import DataTable from '../../components/common/DataTable';
import StatusBadge from '../../components/common/StatusBadge';
import Alert from '../../components/common/Alert';
import AuthorizationDecisionDialog from '../../components/coordinator/AuthorizationDecisionDialog';
import { useAuth } from '../../hooks/useAuth';
import { useData } from '../../hooks/useData';
import { useToast } from '../../hooks/useToast';
import { useReadOnly } from '../../hooks/useReadOnly';
import { AUTHORIZATION_STATUS } from '../../data/statusValues';
import { formatDateTime } from '../../utils/formatDate';
import { matchesSearch } from '../../utils/matchesSearch';
import { nameOfUser } from '../../utils/coordinatorHelpers';

// Authorization requests tab of the Courses & Schedule page.
export default function RequestsPanel() {
    const { currentUser } = useAuth();
    const { data, updateCollection, addNotification, addAuditEvent } = useData();
    const { showToast } = useToast();
    const readOnly = useReadOnly();
    const [tab, setTab] = useState('pending');
    const [query, setQuery] = useState('');
    const [deciding, setDeciding] = useState(null); // { request, decision }

    const all = (data.courseAuthorizations ?? []).map((r) => ({ ...r, studentName: nameOfUser(data, r.studentId) }));
    const pending = all.filter((r) => r.status === AUTHORIZATION_STATUS.PENDING);
    const decided = all.filter((r) => r.status !== AUTHORIZATION_STATUS.PENDING);
    const rows = (tab === 'pending' ? pending : decided).filter((r) => matchesSearch(query, r.studentName, r.courseCode, r.term));

    function decide(note) {
        const { request, decision } = deciding;
        const approved = decision === AUTHORIZATION_STATUS.APPROVED;
        updateCollection('courseAuthorizations', (list) =>
            list.map((r) =>
                r.id === request.id ? { ...r, status: decision, note, decidedAt: new Date().toISOString(), decidedBy: currentUser.id } : r,
            ),
        );
        addNotification({
            userId: request.studentId,
            title: approved ? `Authorization approved: ${request.courseCode}` : `Authorization rejected: ${request.courseCode}`,
            body: approved
                ? `Your authorization for ${request.courseCode} (term ${request.term}) was approved.${note ? ' Note: ' + note : ''} You are not registered yet: continue in the university portal to register.`
                : `Your authorization for ${request.courseCode} (term ${request.term}) was not approved. Reason: ${note}`,
            link: '/student/authorizations',
        });
        addAuditEvent({
            userId: request.studentId,
            actorId: currentUser.id,
            action: approved ? 'authorization_approved' : 'authorization_rejected',
            detail: `${request.courseCode} term ${request.term}`,
        });
        showToast(approved ? `Approved. ${request.studentName} was notified.` : `Rejected. ${request.studentName} was notified.`);
        setDeciding(null);
    }

    const columns = [
        {
            key: 'studentName',
            header: 'Student',
            sortable: true,
            render: (r) => (
                <>
                    {r.studentName}
                    <span className="cell__sub">Requested {formatDateTime(r.requestedAt)}</span>
                </>
            ),
        },
        {
            key: 'courseCode',
            header: 'Course',
            sortable: true,
            render: (r) => (
                <>
                    {r.courseCode}
                    <span className="cell__sub">Term {r.term}</span>
                </>
            ),
        },
        { key: 'reason', header: 'Reason', render: (r) => <span className="cell__clamp">{r.reason}</span> },
        { key: 'status', header: 'Status', sortable: true, render: (r) => <StatusBadge status={r.status} /> },
    ];
    if (tab === 'decided') {
        columns.push({
            key: 'decidedAt',
            header: 'Decision',
            sortable: true,
            render: (r) => (
                <>
                    {formatDateTime(r.decidedAt)}
                    <span className="cell__sub">{r.note || 'No note'}</span>
                </>
            ),
        });
    }
    if (tab === 'pending' && !readOnly) {
        columns.push({
            key: 'actions',
            header: 'Actions',
            render: (r) => (
                <div className="table__actions">
                    <Button onClick={() => setDeciding({ request: r, decision: AUTHORIZATION_STATUS.APPROVED })} aria-label={`Approve ${r.courseCode} for ${r.studentName}`}>
                        Approve
                    </Button>
                    <Button variant="ghost" onClick={() => setDeciding({ request: r, decision: AUTHORIZATION_STATUS.REJECTED })} aria-label={`Reject ${r.courseCode} for ${r.studentName}`}>
                        Reject
                    </Button>
                </div>
            ),
        });
    }

    return (
        <>
            <Alert variant="info">
                A decision only records approval or rejection. It never registers the student or changes a seat. After an
                approval, the student continues in the university portal to register.
            </Alert>
            <div className="filters" style={{ marginTop: 0 }}>
                <SearchBar value={query} onChange={setQuery} placeholder="Search student, course or term" label="Search requests" />
                <Select
                    label="Show"
                    value={tab}
                    onChange={(e) => setTab(e.target.value)}
                    options={[
                        { value: 'pending', label: `Pending (${pending.length})` },
                        { value: 'decided', label: `Decided (${decided.length})` },
                    ]}
                />
            </div>
            <DataTable
                key={tab}
                caption={tab === 'pending' ? 'Pending requests' : 'Decided requests'}
                columns={columns}
                rows={rows}
                emptyTitle={tab === 'pending' ? 'No pending requests' : 'No decisions yet'}
                emptyMessage={tab === 'pending' ? 'New requests from students will appear here.' : 'Approved and rejected requests will appear here.'}
            />
            {deciding && !readOnly && (
                <AuthorizationDecisionDialog
                    key={deciding.request.id + deciding.decision}
                    request={deciding.request}
                    decision={deciding.decision}
                    studentName={deciding.request.studentName}
                    onConfirm={decide}
                    onClose={() => setDeciding(null)}
                />
            )}
        </>
    );
}
