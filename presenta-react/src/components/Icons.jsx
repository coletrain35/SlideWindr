import PropTypes from 'prop-types';

/**
 * Base Icon component with accessibility support
 * Icons are decorative when used inside buttons with text labels (aria-hidden=true)
 * Icons can have labels when used standalone (role="img" with aria-label)
 */
const Icon = ({ children, label }) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden={!label}
        role={label ? "img" : undefined}
        aria-label={label}
    >
        {children}
    </svg>
);

Icon.propTypes = {
    children: PropTypes.node.isRequired,
    label: PropTypes.string
};

export const TypeIcon = ({ label }) => (
    <Icon label={label}>
        <path d="M4 7V4h16v3"/>
        <path d="M9 20h6"/>
        <path d="M12 4v16"/>
    </Icon>
);
TypeIcon.propTypes = { label: PropTypes.string };

export const SquareIcon = ({ label }) => (
    <Icon label={label}>
        <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
    </Icon>
);
SquareIcon.propTypes = { label: PropTypes.string };

export const ImageIcon = ({ label }) => (
    <Icon label={label}>
        <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
        <circle cx="8.5" cy="8.5" r="1.5"/>
        <path d="m21 15-5-5L5 21"/>
    </Icon>
);
ImageIcon.propTypes = { label: PropTypes.string };

export const CodeIcon = ({ label }) => (
    <Icon label={label}>
        <path d="m16 18 6-6-6-6"/>
        <path d="m8 6-6 6 6 6"/>
    </Icon>
);
CodeIcon.propTypes = { label: PropTypes.string };

export const ChevronUpIcon = ({ label }) => (
    <Icon label={label}>
        <path d="m18 15-6-6-6 6"/>
    </Icon>
);
ChevronUpIcon.propTypes = { label: PropTypes.string };

export const ChevronDownIcon = ({ label }) => (
    <Icon label={label}>
        <path d="m6 9 6 6 6-6"/>
    </Icon>
);
ChevronDownIcon.propTypes = { label: PropTypes.string };

export const CopyIcon = ({ label }) => (
    <Icon label={label}>
        <rect width="14" height="14" x="8" y="8" rx="2" ry="2"/>
        <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/>
    </Icon>
);
CopyIcon.propTypes = { label: PropTypes.string };

export const TrashIcon = ({ label }) => (
    <Icon label={label}>
        <path d="M3 6h18"/>
        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
    </Icon>
);
TrashIcon.propTypes = { label: PropTypes.string };

export const MousePointerClickIcon = ({ label }) => (
    <Icon label={label}>
        <path d="m9 9 5 12 1.8-5.2L21 14Z"/>
        <path d="M14.5 2.5 18 6l-4.5 4.5"/>
    </Icon>
);
MousePointerClickIcon.propTypes = { label: PropTypes.string };

export const StopCircleIcon = ({ label }) => (
    <Icon label={label}>
        <circle cx="12" cy="12" r="10"/>
        <rect width="6" height="6" x="9" y="9"/>
    </Icon>
);
StopCircleIcon.propTypes = { label: PropTypes.string };

export const LayersIcon = ({ label }) => (
    <Icon label={label}>
        <path d="m12.83 2.18a2 2 0 0 0-1.66 0L2.6 6.08a1 1 0 0 0 0 1.83l8.58 3.91a2 2 0 0 0 1.66 0l8.58-3.9a1 1 0 0 0 0-1.83Z"/>
        <path d="m22 17.65-8.58 3.9a2 2 0 0 1-1.66 0L3.2 17.65"/>
        <path d="m22 12.65-8.58 3.9a2 2 0 0 1-1.66 0L3.2 12.65"/>
    </Icon>
);
LayersIcon.propTypes = { label: PropTypes.string };

export const MoveHorizontalIcon = ({ label }) => (
    <Icon label={label}>
        <path d="M8 18L2 12l6-6"/>
        <path d="M16 6l6 6-6 6"/>
        <path d="M2 12h20"/>
    </Icon>
);
MoveHorizontalIcon.propTypes = { label: PropTypes.string };

export const MinusIcon = ({ label }) => (
    <Icon label={label}>
        <path d="M5 12h14"/>
    </Icon>
);
MinusIcon.propTypes = { label: PropTypes.string };

export const HashIcon = ({ label }) => (
    <Icon label={label}>
        <path d="M4 9h16"/>
        <path d="M4 15h16"/>
        <path d="M10 3L8 21"/>
        <path d="M16 3l-2 18"/>
    </Icon>
);
HashIcon.propTypes = { label: PropTypes.string };

export const AlignCenterVerticalIcon = ({ label }) => (
    <Icon label={label}>
        <path d="M3 12h18"/>
        <path d="M11 20v-4h2v4"/>
        <path d="M11 8V4h2v4"/>
    </Icon>
);
AlignCenterVerticalIcon.propTypes = { label: PropTypes.string };

export const RepeatIcon = ({ label }) => (
    <Icon label={label}>
        <path d="M17 2.1l4 4-4 4"/>
        <path d="M3 12.6V8c0-1.1.9-2 2-2h14"/>
        <path d="M7 21.9l-4-4 4-4"/>
        <path d="M21 11.4V16c0 1.1-.9 2-2 2H5"/>
    </Icon>
);
RepeatIcon.propTypes = { label: PropTypes.string };

export const MouseIcon = ({ label }) => (
    <Icon label={label}>
        <rect x="5" y="2" width="14" height="20" rx="7"/>
        <path d="M12 6v4"/>
    </Icon>
);
MouseIcon.propTypes = { label: PropTypes.string };

export const TimerIcon = ({ label }) => (
    <Icon label={label}>
        <path d="M10 2h4"/>
        <path d="M12 14v-4"/>
        <path d="M4 13a8 8 0 0 1 16 0H4Z"/>
        <circle cx="12" cy="12" r="10"/>
    </Icon>
);
TimerIcon.propTypes = { label: PropTypes.string };

export const MoonIcon = ({ label, className }) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden={!label}
        role={label ? "img" : undefined}
        aria-label={label}
        className={className}
    >
        <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/>
    </svg>
);
MoonIcon.propTypes = { label: PropTypes.string, className: PropTypes.string };

export const SunIcon = ({ label, className }) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden={!label}
        role={label ? "img" : undefined}
        aria-label={label}
        className={className}
    >
        <circle cx="12" cy="12" r="4"/>
        <path d="M12 2v2"/>
        <path d="M12 20v2"/>
        <path d="m4.93 4.93 1.41 1.41"/>
        <path d="m17.66 17.66 1.41 1.41"/>
        <path d="M2 12h2"/>
        <path d="M20 12h2"/>
        <path d="m6.34 17.66-1.41 1.41"/>
        <path d="m19.07 4.93-1.41 1.41"/>
    </svg>
);
SunIcon.propTypes = { label: PropTypes.string, className: PropTypes.string };

export const DownloadIcon = ({ label, className }) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden={!label}
        role={label ? "img" : undefined}
        aria-label={label}
        className={className}
    >
        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
        <polyline points="7 10 12 15 17 10"/>
        <line x1="12" y1="15" x2="12" y2="3"/>
    </svg>
);
DownloadIcon.propTypes = { label: PropTypes.string, className: PropTypes.string };

export const SettingsIcon = ({ label, className }) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden={!label}
        role={label ? "img" : undefined}
        aria-label={label}
        className={className}
    >
        <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/>
        <circle cx="12" cy="12" r="3"/>
    </svg>
);
SettingsIcon.propTypes = { label: PropTypes.string, className: PropTypes.string };

export const HelpCircleIcon = ({ label, className }) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden={!label}
        role={label ? "img" : undefined}
        aria-label={label}
        className={className}
    >
        <circle cx="12" cy="12" r="10"/>
        <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/>
        <path d="M12 17h.01"/>
    </svg>
);
HelpCircleIcon.propTypes = { label: PropTypes.string, className: PropTypes.string };

export const PlusIcon = ({ label, className }) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden={!label}
        role={label ? "img" : undefined}
        aria-label={label}
        className={className}
    >
        <path d="M5 12h14"/>
        <path d="M12 5v14"/>
    </svg>
);
PlusIcon.propTypes = { label: PropTypes.string, className: PropTypes.string };

export const UndoIcon = ({ label, className }) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden={!label}
        role={label ? "img" : undefined}
        aria-label={label}
        className={className}
    >
        <path d="M3 7v6h6"/>
        <path d="M21 17a9 9 0 0 0-9-9 9 9 0 0 0-6 2.3L3 13"/>
    </svg>
);
UndoIcon.propTypes = { label: PropTypes.string, className: PropTypes.string };

export const RedoIcon = ({ label, className }) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden={!label}
        role={label ? "img" : undefined}
        aria-label={label}
        className={className}
    >
        <path d="M21 7v6h-6"/>
        <path d="M3 17a9 9 0 0 1 9-9 9 9 0 0 1 6 2.3l3 2.7"/>
    </svg>
);
RedoIcon.propTypes = { label: PropTypes.string, className: PropTypes.string };


export const UploadIcon = ({ label, className }) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden={!label}
        role={label ? "img" : undefined}
        aria-label={label}
        className={className}
    >
        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
        <polyline points="17 8 12 3 7 8"/>
        <line x1="12" y1="3" x2="12" y2="15"/>
    </svg>
);
UploadIcon.propTypes = { label: PropTypes.string, className: PropTypes.string };

export const XIcon = ({ label, className }) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden={!label}
        role={label ? "img" : undefined}
        aria-label={label}
        className={className}
    >
        <line x1="18" y1="6" x2="6" y2="18"/>
        <line x1="6" y1="6" x2="18" y2="18"/>
    </svg>
);
XIcon.propTypes = { label: PropTypes.string, className: PropTypes.string };

// Alignment Icons
export const AlignLeftIcon = ({ label, className }) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden={!label}
        role={label ? "img" : undefined}
        aria-label={label}
        className={className}
    >
        <line x1="3" y1="6" x2="21" y2="6"/>
        <line x1="3" y1="12" x2="15" y2="12"/>
        <line x1="3" y1="18" x2="18" y2="18"/>
    </svg>
);
AlignLeftIcon.propTypes = { label: PropTypes.string, className: PropTypes.string };

export const AlignCenterHorizontalIcon = ({ label, className }) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden={!label}
        role={label ? "img" : undefined}
        aria-label={label}
        className={className}
    >
        <line x1="3" y1="6" x2="21" y2="6"/>
        <line x1="6" y1="12" x2="18" y2="12"/>
        <line x1="4" y1="18" x2="20" y2="18"/>
    </svg>
);
AlignCenterHorizontalIcon.propTypes = { label: PropTypes.string, className: PropTypes.string };

export const AlignRightIcon = ({ label, className }) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden={!label}
        role={label ? "img" : undefined}
        aria-label={label}
        className={className}
    >
        <line x1="3" y1="6" x2="21" y2="6"/>
        <line x1="9" y1="12" x2="21" y2="12"/>
        <line x1="6" y1="18" x2="21" y2="18"/>
    </svg>
);
AlignRightIcon.propTypes = { label: PropTypes.string, className: PropTypes.string };

export const AlignTopIcon = ({ label, className }) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden={!label}
        role={label ? "img" : undefined}
        aria-label={label}
        className={className}
    >
        <line x1="6" y1="3" x2="6" y2="21"/>
        <line x1="12" y1="3" x2="12" y2="15"/>
        <line x1="18" y1="3" x2="18" y2="18"/>
    </svg>
);
AlignTopIcon.propTypes = { label: PropTypes.string, className: PropTypes.string };

export const AlignMiddleIcon = ({ label, className }) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden={!label}
        role={label ? "img" : undefined}
        aria-label={label}
        className={className}
    >
        <line x1="6" y1="3" x2="6" y2="21"/>
        <line x1="12" y1="6" x2="12" y2="18"/>
        <line x1="18" y1="4" x2="18" y2="20"/>
    </svg>
);
AlignMiddleIcon.propTypes = { label: PropTypes.string, className: PropTypes.string };

export const AlignBottomIcon = ({ label, className }) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden={!label}
        role={label ? "img" : undefined}
        aria-label={label}
        className={className}
    >
        <line x1="6" y1="3" x2="6" y2="21"/>
        <line x1="12" y1="9" x2="12" y2="21"/>
        <line x1="18" y1="6" x2="18" y2="21"/>
    </svg>
);
AlignBottomIcon.propTypes = { label: PropTypes.string, className: PropTypes.string };

export const DistributeHorizontalIcon = ({ label, className }) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden={!label}
        role={label ? "img" : undefined}
        aria-label={label}
        className={className}
    >
        <rect x="4" y="6" width="3" height="12"/>
        <rect x="10" y="6" width="4" height="12"/>
        <rect x="17" y="6" width="3" height="12"/>
    </svg>
);
DistributeHorizontalIcon.propTypes = { label: PropTypes.string, className: PropTypes.string };

export const DistributeVerticalIcon = ({ label, className }) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden={!label}
        role={label ? "img" : undefined}
        aria-label={label}
        className={className}
    >
        <rect x="6" y="4" width="12" height="3"/>
        <rect x="6" y="10" width="12" height="4"/>
        <rect x="6" y="17" width="12" height="3"/>
    </svg>
);
DistributeVerticalIcon.propTypes = { label: PropTypes.string, className: PropTypes.string };

// Layering Icons
export const BringToFrontIcon = ({ label, className }) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden={!label}
        role={label ? "img" : undefined}
        aria-label={label}
        className={className}
    >
        <rect x="8" y="8" width="12" height="12" rx="2"/>
        <path d="M4 16V4a2 2 0 0 1 2-2h12"/>
    </svg>
);
BringToFrontIcon.propTypes = { label: PropTypes.string, className: PropTypes.string };

export const SendToBackIcon = ({ label, className }) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden={!label}
        role={label ? "img" : undefined}
        aria-label={label}
        className={className}
    >
        <rect x="4" y="4" width="12" height="12" rx="2"/>
        <path d="M20 8v12a2 2 0 0 1-2 2H6"/>
    </svg>
);
SendToBackIcon.propTypes = { label: PropTypes.string, className: PropTypes.string };

export const BringForwardIcon = ({ label, className }) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden={!label}
        role={label ? "img" : undefined}
        aria-label={label}
        className={className}
    >
        <polyline points="17 11 12 6 7 11"/>
        <polyline points="17 18 12 13 7 18"/>
    </svg>
);
BringForwardIcon.propTypes = { label: PropTypes.string, className: PropTypes.string };

export const SendBackwardIcon = ({ label, className }) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden={!label}
        role={label ? "img" : undefined}
        aria-label={label}
        className={className}
    >
        <polyline points="7 13 12 18 17 13"/>
        <polyline points="7 6 12 11 17 6"/>
    </svg>
);
SendBackwardIcon.propTypes = { label: PropTypes.string, className: PropTypes.string };

// Grid Icon
export const GridIcon = ({ label, className }) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden={!label}
        role={label ? "img" : undefined}
        aria-label={label}
        className={className}
    >
        <rect x="3" y="3" width="18" height="18" rx="2"/>
        <path d="M3 9h18"/>
        <path d="M3 15h18"/>
        <path d="M9 3v18"/>
        <path d="M15 3v18"/>
    </svg>
);
GridIcon.propTypes = { label: PropTypes.string, className: PropTypes.string };

// Table Icon
export const TableIcon = ({ label, className }) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden={!label}
        role={label ? "img" : undefined}
        aria-label={label}
        className={className}
    >
        <rect x="3" y="3" width="18" height="18" rx="2"/>
        <path d="M3 9h18"/>
        <path d="M3 15h18"/>
        <path d="M9 3v18"/>
        <path d="M15 3v18"/>
    </svg>
);
TableIcon.propTypes = { label: PropTypes.string, className: PropTypes.string };

export const AlertTriangleIcon = ({ label, className }) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden={!label}
        role={label ? "img" : undefined}
        aria-label={label}
        className={className}
    >
        <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
        <line x1="12" y1="9" x2="12" y2="13"/>
        <line x1="12" y1="17" x2="12.01" y2="17"/>
    </svg>
);
AlertTriangleIcon.propTypes = { label: PropTypes.string, className: PropTypes.string };

export const FileTextIcon = ({ label, className }) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden={!label}
        role={label ? "img" : undefined}
        aria-label={label}
        className={className}
    >
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
        <polyline points="14 2 14 8 20 8"/>
        <line x1="16" y1="13" x2="8" y2="13"/>
        <line x1="16" y1="17" x2="8" y2="17"/>
        <polyline points="10 9 9 9 8 9"/>
    </svg>
);
FileTextIcon.propTypes = { label: PropTypes.string, className: PropTypes.string };

export const BarChartIcon = ({ label, className }) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden={!label}
        role={label ? "img" : undefined}
        aria-label={label}
        className={className}
    >
        <line x1="12" y1="20" x2="12" y2="10"/>
        <line x1="18" y1="20" x2="18" y2="4"/>
        <line x1="6" y1="20" x2="6" y2="16"/>
    </svg>
);
BarChartIcon.propTypes = { label: PropTypes.string, className: PropTypes.string };

export const SmartArtIcon = ({ label, className }) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden={!label}
        role={label ? "img" : undefined}
        aria-label={label}
        className={className}
    >
        <rect x="3" y="3" width="6" height="6" rx="1"/>
        <rect x="15" y="3" width="6" height="6" rx="1"/>
        <rect x="9" y="15" width="6" height="6" rx="1"/>
        <path d="M6 9v3"/>
        <path d="M18 9v3"/>
        <path d="M9 18h-3"/>
        <path d="M18 18h-3"/>
        <path d="M12 12v3"/>
    </svg>
);
SmartArtIcon.propTypes = { label: PropTypes.string, className: PropTypes.string };

export const VideoIcon = ({ label, className }) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden={!label}
        role={label ? "img" : undefined}
        aria-label={label}
        className={className}
    >
        <polygon points="23 7 16 12 23 17 23 7"/>
        <rect x="1" y="5" width="15" height="14" rx="2" ry="2"/>
    </svg>
);
VideoIcon.propTypes = { label: PropTypes.string, className: PropTypes.string };

export const AudioIcon = ({ label, className }) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden={!label}
        role={label ? "img" : undefined}
        aria-label={label}
        className={className}
    >
        <path d="M9 18V5l12-2v13"/>
        <circle cx="6" cy="18" r="3"/>
        <circle cx="18" cy="16" r="3"/>
    </svg>
);
AudioIcon.propTypes = { label: PropTypes.string, className: PropTypes.string };

export const GroupIcon = ({ label, className }) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden={!label}
        role={label ? "img" : undefined}
        aria-label={label}
        className={className}
    >
        <rect x="3" y="3" width="7" height="7" rx="1"/>
        <rect x="14" y="3" width="7" height="7" rx="1"/>
        <rect x="14" y="14" width="7" height="7" rx="1"/>
        <rect x="3" y="14" width="7" height="7" rx="1"/>
    </svg>
);
GroupIcon.propTypes = { label: PropTypes.string, className: PropTypes.string };

export const UngroupIcon = ({ label, className }) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden={!label}
        role={label ? "img" : undefined}
        aria-label={label}
        className={className}
    >
        <rect x="3" y="3" width="7" height="7" rx="1" strokeDasharray="2 2"/>
        <rect x="14" y="3" width="7" height="7" rx="1" strokeDasharray="2 2"/>
        <rect x="14" y="14" width="7" height="7" rx="1" strokeDasharray="2 2"/>
        <rect x="3" y="14" width="7" height="7" rx="1" strokeDasharray="2 2"/>
    </svg>
);
UngroupIcon.propTypes = { label: PropTypes.string, className: PropTypes.string };

