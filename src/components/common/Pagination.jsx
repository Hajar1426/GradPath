function buildPages(page, count) {
    if (count <= 7) return Array.from({ length: count }, (_, i) => i + 1);
    const wanted = new Set([1, count, page - 1, page, page + 1]);
    const numbers = [...wanted].filter((n) => n >= 1 && n <= count).sort((a, b) => a - b);
    const items = [];
    numbers.forEach((n, index) => {
        if (index > 0 && n - numbers[index - 1] > 1) items.push(`gap-${index}`);
        items.push(n);
    });
    return items;
}

export default function Pagination({ page, pageCount, onPageChange }) {
    if (pageCount <= 1) return null;

    return (
        <nav className="pagination" aria-label="Pagination">
            <button
                type="button"
                className="pagination__btn"
                onClick={() => onPageChange(page - 1)}
                disabled={page === 1}
                aria-label="Previous page"
            >
                ‹
            </button>
            {buildPages(page, pageCount).map((item) =>
                typeof item === 'string' ? (
                    <span key={item} className="pagination__gap" aria-hidden="true">…</span>
                ) : (
                    <button
                        key={item}
                        type="button"
                        className="pagination__btn"
                        onClick={() => onPageChange(item)}
                        aria-current={item === page ? 'page' : undefined}
                        aria-label={`Page ${item}`}
                    >
                        {item}
                    </button>
                ),
            )}
            <button
                type="button"
                className="pagination__btn"
                onClick={() => onPageChange(page + 1)}
                disabled={page === pageCount}
                aria-label="Next page"
            >
                ›
            </button>
        </nav>
    );
}