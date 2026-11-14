import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PageHeader from '../../components/layout/PageHeader';
import Button from '../../components/common/Button';
import Alert from '../../components/common/Alert';
import Tabs from '../../components/common/Tabs';
import LoadingState from '../../components/common/LoadingState';
import EditOnly from '../../components/common/EditOnly';
import ConfirmationDialog from '../../components/common/ConfirmationDialog';
import FileDropzone from '../../components/coordinator/FileDropzone';
import ImportSummary from '../../components/coordinator/ImportSummary';
import ImportPreviewTable from '../../components/coordinator/ImportPreviewTable';
import ImportHistoryTable from '../../components/coordinator/ImportHistoryTable';
import { useAuth } from '../../hooks/useAuth';
import { useData } from '../../hooks/useData';
import { useToast } from '../../hooks/useToast';
import { IMPORT_ROW_STATUS } from '../../data/statusValues';
import { parseXlsx } from '../../utils/parseXlsx';
import {
    IMPORT_KINDS,
    mapColumns,
    buildStudentPreview,
    buildOfferingPreview,
    applyStudentImport,
    applyOfferingImport,
    summarize,
} from '../../utils/importRules';
import { newId, nameOfUser } from '../../utils/coordinatorHelpers';

const PREVIEW_FIELDS = {
    students: [
        { key: 'studentId', header: 'Student ID' },
        { key: 'name', header: 'Name' },
        { key: 'email', header: 'Email' },
        { key: 'degree', header: 'Degree' },
        { key: 'nationality', header: 'Nationality' },
        { key: 'studyLoad', header: 'Study load' },
    ],
    offerings: [
        { key: 'courseCode', header: 'Course' },
        { key: 'title', header: 'Title' },
        { key: 'term', header: 'Term' },
        { key: 'section', header: 'Section' },
        { key: 'instructor', header: 'Instructor' },
        { key: 'days', header: 'Days' },
        { key: 'time', header: 'Time' },
        { key: 'seats', header: 'Seats' },
    ],
};

const MAX_SIZE = 5 * 1024 * 1024;

export default function RecordImportPage() {
    const { currentUser } = useAuth();
    const { data, updateCollection, addAuditEvent } = useData();
    const { showToast } = useToast();
    const navigate = useNavigate();
    const [kind, setKind] = useState('students');
    const [step, setStep] = useState('choose'); // choose | reading | preview
    const [fileName, setFileName] = useState('');
    const [error, setError] = useState('');
    const [preview, setPreview] = useState([]);
    const [tab, setTab] = useState('all');
    const [confirming, setConfirming] = useState(false);

    const summary = useMemo(() => summarize(preview), [preview]);
    const usable = summary.new + summary.updated;
    const visible = tab === 'all' ? preview : preview.filter((p) => p.status === tab);

    function reset() {
        setStep('choose');
        setPreview([]);
        setFileName('');
        setError('');
        setTab('all');
    }

    async function handleFile(file) {
        setError('');
        if (!/\.(xlsx|xls|csv)$/i.test(file.name)) {
            setError(`"${file.name}" is not an Excel file. Choose a .xlsx, .xls or .csv file.`);
            return;
        }
        if (file.size > MAX_SIZE) {
            setError('The file is larger than 5 MB. Split it into smaller files.');
            return;
        }
        setStep('reading');
        setFileName(file.name);
        try {
            const { rows, headers } = await parseXlsx(file);
            const { fieldMap, missing } = mapColumns(kind, headers);
            if (missing.length) {
                const names = missing.map((field) => {
                    const name = IMPORT_KINDS[kind].columns[field][0];
                    return name.charAt(0).toUpperCase() + name.slice(1);
                });
                throw new Error(`The file is missing these columns: ${names.join(', ')}. Check the header row or use the sample file.`);
            }
            if (rows.length === 0) throw new Error('The file has a header row but no data rows.');
            const built =
                kind === 'students'
                    ? buildStudentPreview(rows, fieldMap, data.studentRoster ?? [])
                    : buildOfferingPreview(rows, fieldMap, data.offerings ?? []);
            setPreview(built);
            setStep('preview');
        } catch (err) {
            setError(err.message || 'The file could not be read.');
            setStep('choose');
        }
    }

    function confirmImport() {
        let notInSheet = 0;
        if (kind === 'students') {
            const result = applyStudentImport(data.studentRoster ?? [], preview);
            notInSheet = result.notInSheet;
            updateCollection('studentRoster', () => result.list);
        } else {
            const result = applyOfferingImport(data.offerings ?? [], preview);
            updateCollection('offerings', () => result.list);
        }
        const id = newId('imp');
        const issues = preview
            .filter((p) => p.status === IMPORT_ROW_STATUS.INVALID || p.status === IMPORT_ROW_STATUS.DUPLICATE)
            .map((p) => ({ rowNumber: p.rowNumber, status: p.status, problems: p.problems }));
        updateCollection('imports', (list) => [
            { id, fileName, kind, at: new Date().toISOString(), by: currentUser.id, summary, notInSheet, issues },
            ...list,
        ]);
        addAuditEvent({
            userId: null,
            actorId: currentUser.id,
            action: kind === 'students' ? 'student_list_imported' : 'offerings_imported',
            detail: `${fileName}: ${summary.new} new, ${summary.updated} updated`,
        });
        setConfirming(false);
        showToast(`Import finished: ${usable} rows saved.`);
        navigate(`/coordinator/import/result?id=${id}`);
    }

    const kindInfo = IMPORT_KINDS[kind];

    return (
        <main className="page">
            <PageHeader title="Import records" subtitle="Upload the approved student list or the course offerings from an Excel file." />

            <EditOnly
                fallback={
                    <Alert variant="info" title="View only">
                        You can see the import history below. Only the coordinator can import files.
                    </Alert>
                }
            >
                {step !== 'preview' && (
                    <section className="import-step" aria-labelledby="step1">
                        <h2 className="section-title" id="step1" style={{ marginTop: 16 }}>1. What are you importing?</h2>
                        <div className="kind-choice" role="radiogroup" aria-labelledby="step1">
                            {Object.entries(IMPORT_KINDS).map(([value, info]) => (
                                <label key={value} className={'kind-option' + (kind === value ? ' kind-option--active' : '')}>
                                    <input
                                        type="radio"
                                        name="import-kind"
                                        value={value}
                                        checked={kind === value}
                                        onChange={() => {
                                            setKind(value);
                                            setError('');
                                        }}
                                        disabled={step === 'reading'}
                                    />
                                    <span>
                                        <strong>{info.label}</strong>
                                        <span className="cell__sub">{info.description}</span>
                                    </span>
                                </label>
                            ))}
                        </div>
                        <p className="hint" style={{ marginTop: 8 }}>
                            Not sure about the format? <a href={kindInfo.sample} download>Download the sample file</a>.
                        </p>

                        <h2 className="section-title" style={{ marginTop: 24 }}>2. Choose the file</h2>
                        {error && (
                            <div style={{ marginTop: 12 }}>
                                <Alert variant="error" title="We could not use this file">{error}</Alert>
                            </div>
                        )}
                        {step === 'reading' ? <LoadingState label={`Reading ${fileName}…`} /> : <FileDropzone onFile={handleFile} />}
                    </section>
                )}

                {step === 'preview' && (
                    <section aria-labelledby="preview-title">
                        <div className="page__toolbar" style={{ marginTop: 16 }}>
                            <div>
                                <h2 className="section-title" id="preview-title" style={{ marginTop: 0 }}>3. Check the rows</h2>
                                <p className="hint" style={{ marginTop: 4 }}>
                                    {kindInfo.label} · {fileName} · {preview.length} rows
                                </p>
                            </div>
                            <div className="table__actions">
                                <Button variant="ghost" onClick={reset}>Choose another file</Button>
                                <Button onClick={() => setConfirming(true)} disabled={usable === 0}>
                                    Confirm import
                                </Button>
                            </div>
                        </div>
                        <ImportSummary summary={summary} />
                        {usable === 0 ? (
                            <Alert variant="error" title="Nothing to import">Every row is invalid or a duplicate. Fix the file and try again.</Alert>
                        ) : (
                            <Alert variant="info">
                                Only new and updated rows are saved. Invalid and duplicate rows are skipped.
                                {kind === 'students'
                                    ? ' Students who already signed up keep their account, and students missing from this file stay on the list with a flag.'
                                    : ' New offerings are saved as drafts so you can check them before publishing.'}
                            </Alert>
                        )}
                        <Tabs
                            label="Filter rows by result"
                            active={tab}
                            onChange={setTab}
                            tabs={[
                                { id: 'all', label: `All (${preview.length})` },
                                { id: IMPORT_ROW_STATUS.NEW, label: `New (${summary.new})` },
                                { id: IMPORT_ROW_STATUS.UPDATED, label: `Updated (${summary.updated})` },
                                { id: IMPORT_ROW_STATUS.DUPLICATE, label: `Duplicate (${summary.duplicate})` },
                                { id: IMPORT_ROW_STATUS.INVALID, label: `Invalid (${summary.invalid})` },
                            ]}
                        />
                        <div role="tabpanel" id={`panel-${tab}`} aria-labelledby={`tab-${tab}`}>
                            <ImportPreviewTable key={tab} rows={visible} fields={PREVIEW_FIELDS[kind]} />
                        </div>
                    </section>
                )}

                <ConfirmationDialog
                    open={confirming}
                    title="Import these rows?"
                    message={
                        kind === 'students'
                            ? `${summary.new} new and ${summary.updated} updated students will be saved to the approved list. New students can sign up straight away.`
                            : `${summary.new} new and ${summary.updated} updated offerings will be saved. New ones start as drafts.`
                    }
                    confirmLabel="Import"
                    onConfirm={confirmImport}
                    onCancel={() => setConfirming(false)}
                />
            </EditOnly>

            <h2 className="section-title">Import history</h2>
            <ImportHistoryTable history={data.imports ?? []} nameOf={(id) => nameOfUser(data, id)} />
        </main>
    );
}
