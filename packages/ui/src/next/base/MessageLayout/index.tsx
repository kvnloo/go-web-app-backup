import { _cs } from '@togglecorp/fujs';

import type { StatusType } from '#utils/style';

import Spinner from '../Spinner';

import styles from './styles.module.css';

export interface Props {
    className?: string;
    /** negative highlights the title */
    status?: StatusType;
    icon?: React.ReactNode;
    title?: React.ReactNode;
    description?: React.ReactNode;
    actions?: React.ReactNode;
    /** Smaller sizing for cards and other constrained surfaces */
    compact?: boolean;
    /** A spinner in place of the icon */
    pending?: boolean;
}

/**
 * Centred feedback content: icon, title, description and actions
 * (building block). It is a polite live region.
 */
function MessageLayout(props: Props) {
    const {
        className,
        status,
        icon,
        title,
        description,
        actions,
        compact = false,
        pending = false,
    } = props;

    return (
        <div
            role="status"
            aria-busy={pending}
            className={_cs(
                styles.message,
                status === 'negative' && styles.errored,
                compact && styles.compact,
                className,
            )}
        >
            {(icon || pending) && (
                <div className={styles.icon}>
                    {pending ? <Spinner className={styles.spinner} decorative /> : icon}
                </div>
            )}
            {title && <div className={styles.title}>{title}</div>}
            {description && <div className={styles.description}>{description}</div>}
            {actions && <div className={styles.actions}>{actions}</div>}
        </div>
    );
}

export default MessageLayout;
