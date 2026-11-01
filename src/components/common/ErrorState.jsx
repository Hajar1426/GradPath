import Button from './Button';

export default function ErrorState({ title = 'Something went wrong', message, onRetry }) {
    return (
        <div className="state" role="alert">
            <p className="state__title">{title}</p>
            {message && <p className="state__text">{message}</p>}
            {onRetry && <Button variant="ghost" onClick={onRetry}>Try again</Button>}
        </div>
    );
}