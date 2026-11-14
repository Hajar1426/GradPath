// Helpers for course resources. A resource url is a website, a file in public/, or an uploaded data: URL.
export const MAX_UPLOAD_BYTES = 1024 * 1024; // 1 MB, because uploads are kept in browser storage
export const UPLOAD_ACCEPT = '.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt';

export function fileTypeOf(resource) {
    const name = resource.fileName || (resource.url?.startsWith('http') ? '' : resource.url) || '';
    const match = name.match(/\.([a-z0-9]+)$/i);
    return match ? `.${match[1].toUpperCase()}` : 'Link';
}

export function isWebLink(resource) {
    return /^https?:\/\//.test(resource.url ?? '');
}

// Browsers block opening data: URLs directly, so turn them into a temporary blob URL first.
export function openResource(resource) {
    if (resource.url.startsWith('data:')) {
        fetch(resource.url)
            .then((r) => r.blob())
            .then((blob) => window.open(URL.createObjectURL(blob), '_blank', 'noopener'));
        return;
    }
    window.open(resource.url, '_blank', 'noopener');
}

export function readFileAsDataUrl(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = () => reject(new Error('The file could not be read.'));
        reader.readAsDataURL(file);
    });
}

export const SORT_OPTIONS = [
    { value: 'newest', label: 'Newest' },
    { value: 'oldest', label: 'Oldest' },
    { value: 'name', label: 'Name (A to Z)' },
];

export function sortResources(list, sort) {
    const copy = [...list];
    if (sort === 'name') return copy.sort((a, b) => a.title.localeCompare(b.title));
    copy.sort((a, b) => String(a.updatedAt).localeCompare(String(b.updatedAt)));
    return sort === 'oldest' ? copy : copy.reverse();
}
