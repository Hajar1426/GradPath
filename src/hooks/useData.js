import { useContext } from 'react';
import { DataContext } from '../context/contexts';

export function useData() {
    const ctx = useContext(DataContext);
    if (!ctx) throw new Error('useData must be used inside DataProvider');
    return ctx;
}