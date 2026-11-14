import { isWebLink, openResource } from '../../utils/resourceFiles';

// View (and Download for files) buttons for one resource row.
export default function ResourceActions({ resource }) {
    return (
        <>
            <button type="button" className="pill-button" onClick={() => openResource(resource)} aria-label={`View ${resource.title} (opens in a new tab)`}>
                View
            </button>
            {!isWebLink(resource) && (
                <a className="pill-button pill-button--plain" href={resource.url} download={resource.fileName || true} aria-label={`Download ${resource.title}`}>
                    Download
                </a>
            )}
        </>
    );
}
