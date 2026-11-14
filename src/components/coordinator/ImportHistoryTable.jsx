import { Link } from 'react-router-dom';
import DataTable from '../common/DataTable';
import { formatDateTime } from '../../utils/formatDate';
import { IMPORT_KINDS } from '../../utils/importRules';

export default function ImportHistoryTable({ history, nameOf }) {
    const columns = [
        {
            key: 'fileName',
            header: 'File',
            sortable: true,
            render: (h) => (
                <>
                    <Link to={`/coordinator/import/result?id=${h.id}`}>{h.fileName}</Link>
                    <span className="cell__sub">{IMPORT_KINDS[h.kind]?.label ?? h.kind}</span>
                </>
            ),
        },
        { key: 'at', header: 'Imported', sortable: true, render: (h) => formatDateTime(h.at) },
        { key: 'by', header: 'By', render: (h) => nameOf(h.by) },
        {
            key: 'summary',
            header: 'New / updated / duplicate / invalid',
            render: (h) => `${h.summary.new} / ${h.summary.updated} / ${h.summary.duplicate} / ${h.summary.invalid}`,
        },
    ];
    const rows = [...history].sort((a, b) => String(b.at).localeCompare(String(a.at)));
    return (
        <DataTable
            caption="Import history"
            columns={columns}
            rows={rows}
            pageSize={5}
            emptyTitle="No imports yet"
            emptyMessage="Files you import will be listed here."
        />
    );
}
