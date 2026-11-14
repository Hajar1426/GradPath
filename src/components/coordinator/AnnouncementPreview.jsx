import { formatDate } from '../../utils/formatDate';
import { audienceText } from '../../utils/coordinatorHelpers';
import { CategoryTag } from './CategoryChips';

export default function AnnouncementPreview({ announcement }) {
    return (
        <article className="announcement-card">
            <CategoryTag category={announcement.category} />
            <p className="cell__sub">
                {announcement.publishedAt ? formatDate(announcement.publishedAt) : 'Not published yet'} · For: {audienceText(announcement.audience)}
            </p>
            <h3 className="announcement-card__title">{announcement.title || 'Untitled announcement'}</h3>
            <p className="announcement-card__body">{announcement.body || 'The announcement text will appear here.'}</p>
        </article>
    );
}
