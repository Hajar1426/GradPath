export default function PageHeader({ title, subtitle }) {
    return (
        <div>
            <h1 className="page__title">{title}</h1>
            {subtitle && <p className="page__subtitle">{subtitle}</p>}
        </div>
    );
}