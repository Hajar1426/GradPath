import PageHeader from '../../components/layout/PageHeader';

export default function PlaceholderPage({ title }) {
    return (
        <main className="page">
            <PageHeader
                title={title}
                subtitle="This page is not built yet. The member who owns it will replace this placeholder."
            />
        </main>
    );
}