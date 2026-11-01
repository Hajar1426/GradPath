import { useMemo, useState } from 'react';
import Pagination from './Pagination';
import EmptyState from './EmptyState';
import LoadingState from './LoadingState';
import ErrorState from './ErrorState';

// columns: [{ key: 'name', header: 'Name', sortable: true,
//             render: (row) => <b>{row.name}</b>,    (optional)
//             sortValue: (row) => row.name }]        (optional)
export default function DataTable({
                                      columns,
                                      rows,
                                      rowKey = 'id',
                                      caption,
                                      pageSize = 8,
                                      loading = false,
                                      error,
                                      onRetry,
                                      emptyTitle = 'Nothing to show',
                                      emptyMessage,
                                  }) {
    const [page, setPage] = useState(1);
    const [sort, setSort] = useState({ key: null, dir: 'asc' });

    const sorted = useMemo(() => {
        if (!sort.key) return rows;
        const column = columns.find((c) => c.key === sort.key);
        const getValue = column?.sortValue ?? ((row) => row[sort.key]);
        return [...rows].sort((a, b) => {
            const x = getValue(a);
            const y = getValue(b);
            const result = x > y ? 1 : x < y ? -1 : 0;
            return sort.dir === 'asc' ? result : -result;
        });
    }, [rows, columns, sort]);

    if (loading) return <LoadingState />;
    if (error) return <ErrorState message={error} onRetry={onRetry} />;
    if (rows.length === 0) return <EmptyState title={emptyTitle} message={emptyMessage} />;

    const pageCount = Math.ceil(sorted.length / pageSize);
    const current = Math.min(page, pageCount);
    const start = (current - 1) * pageSize;
    const visible = sorted.slice(start, start + pageSize);

    function toggleSort(key) {
        setSort((prev) => ({ key, dir: prev.key === key && prev.dir === 'asc' ? 'desc' : 'asc' }));
        setPage(1);
    }

    function ariaSort(column) {
        if (!column.sortable) return undefined;
        if (sort.key !== column.key) return 'none';
        return sort.dir === 'asc' ? 'ascending' : 'descending';
    }

    return (
        <div>
            <div className="table-wrap">
                <table className="table">
                    {caption && <caption className="sr-only">{caption}</caption>}
                    <thead>
                    <tr>
                        {columns.map((column) => (
                            <th key={column.key} scope="col" aria-sort={ariaSort(column)}>
                                {column.sortable ? (
                                    <button type="button" className="table__sort" onClick={() => toggleSort(column.key)}>
                                        {column.header}
                                        <span aria-hidden="true">
                        {sort.key === column.key ? (sort.dir === 'asc' ? '▲' : '▼') : '↕'}
                      </span>
                                    </button>
                                ) : (
                                    column.header
                                )}
                            </th>
                        ))}
                    </tr>
                    </thead>
                    <tbody>
                    {visible.map((row) => (
                        <tr key={row[rowKey]}>
                            {columns.map((column) => (
                                <td key={column.key}>{column.render ? column.render(row) : row[column.key]}</td>
                            ))}
                        </tr>
                    ))}
                    </tbody>
                </table>
            </div>
            <div className="table__footer">
        <span>
          Showing {start + 1} to {start + visible.length} of {sorted.length}
        </span>
                <Pagination page={current} pageCount={pageCount} onPageChange={setPage} />
            </div>
        </div>
    );
}