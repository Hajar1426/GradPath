import { useId, useRef, useState } from 'react';

const ACCEPT = '.xlsx,.xls,.csv';

export default function FileDropzone({ onFile, disabled }) {
    const inputRef = useRef(null);
    const id = useId();
    const [dragging, setDragging] = useState(false);

    function handleFiles(files) {
        const file = files?.[0];
        if (file) onFile(file);
    }

    return (
        <div
            className={'dropzone' + (dragging ? ' dropzone--active' : '')}
            onDragOver={(e) => {
                e.preventDefault();
                setDragging(true);
            }}
            onDragLeave={() => setDragging(false)}
            onDrop={(e) => {
                e.preventDefault();
                setDragging(false);
                if (!disabled) handleFiles(e.dataTransfer.files);
            }}
        >
            <p className="dropzone__title">Drag an Excel file here</p>
            <p className="cell__sub">.xlsx, .xls or .csv, first sheet only</p>
            <label htmlFor={id} className="btn btn--ghost dropzone__button">
                Choose file
            </label>
            <input
                ref={inputRef}
                id={id}
                className="sr-only"
                type="file"
                accept={ACCEPT}
                disabled={disabled}
                onChange={(e) => {
                    handleFiles(e.target.files);
                    e.target.value = '';
                }}
            />
        </div>
    );
}
