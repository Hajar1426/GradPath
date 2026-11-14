import DataTable from '../common/DataTable';
import StatusBadge from '../common/StatusBadge';

// fields: [{ key, header }] shown from row.values
export default function ImportPreviewTable({ rows, fields }) {
    const columns = [
        { key: 'rowNumber', header: 'Row', sortable: true },
        { key: 'status', header: 'Result', sortable: true, render: (r) => <StatusBadge status={r.status} /> },
        ...fields.map((f) => ({
            key: f.key,
            header: f.header,
            sortable: true,
            sortValue: (r) => r.values[f.key] ?? '',
            render: (r) => r.values[f.key] || <span className="cell__sub">empty</span>,
        })),
        {
            key: 'problems',
            header: 'Notes',
            render: (r) => (r.problems.length ? <span className="import-problem">{r.problems.join('. ')}</span> : '—'),
        },
    ];
    return (
        <DataTable
            caption="Rows in the file"
            columns={columns}
            rows={rows}
            rowKey="rowNumber"
            pageSize={10}
            emptyTitle="No rows with this result"
        />
    );
}
