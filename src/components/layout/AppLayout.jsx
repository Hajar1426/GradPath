import { useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import ReadOnlyBanner from '../common/ReadOnlyBanner';
import { useData } from '../../hooks/useData';
import { useReadOnly } from '../../hooks/useReadOnly';

export default function AppLayout() {
    const readOnly = useReadOnly();
    const { setReadOnly } = useData();

    useEffect(() => {
        setReadOnly(readOnly);
        return () => setReadOnly(false);
    }, [readOnly, setReadOnly]);

    return (
        <div className="app-shell">
            <Sidebar />
            <div className="app-main">
                {readOnly && <ReadOnlyBanner />}
                <Outlet />
            </div>
        </div>
    );
}