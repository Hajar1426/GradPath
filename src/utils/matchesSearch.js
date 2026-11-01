// matchesSearch('user 2 ', 'User 2', 'user2@kfupm.edu.sa')  ->  true
// Every word typed must appear somewhere in the fields. Case and extra spaces are ignored.
export function matchesSearch(query, ...fields) {
    const words = query.trim().toLowerCase().split(/\s+/).filter(Boolean);
    if (words.length === 0) return true;
    const text = fields.join(' ').toLowerCase();
    return words.every((word) => text.includes(word));
}