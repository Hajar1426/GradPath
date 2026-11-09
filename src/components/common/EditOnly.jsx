import { useReadOnly } from '../../hooks/useReadOnly';

// Usage: <EditOnly><Button>Publish</Button></EditOnly>
export default function EditOnly({ children, fallback = null }) {
    const readOnly = useReadOnly();
    return readOnly ? fallback : children;
}