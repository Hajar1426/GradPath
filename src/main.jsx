import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.jsx';
import { DataProvider } from './context/DataContext.jsx';
import { AuthProvider } from './context/AuthContext.jsx';
import { ToastProvider } from './context/ToastContext.jsx';
createRoot(document.getElementById('root')).render(
    <StrictMode>
        <DataProvider>
            <AuthProvider>
                <ToastProvider>
                    <App />
                </ToastProvider>
            </AuthProvider>
        </DataProvider>
    </StrictMode>,
);