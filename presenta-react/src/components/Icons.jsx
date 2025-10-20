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

