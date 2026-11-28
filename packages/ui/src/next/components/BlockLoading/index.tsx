import { _cs } from '@togglecorp/fujs';

import SpinnerLayout from '#next/base/Spinner';

import styles from './styles.module.css';

export interface Props {
    className?: string;
    /** Shown under the spinner */
    message?: React.ReactNode;
    /** Smaller, for cards and other small surfaces */
    compact?: boolean;
}

/** A loading placeholder for a block of content, announced as busy */
function BlockLoading(props: Props) {
    const {
        className,
        message,
        compact,
    } = props;

    return (
        <div
            role="status"
            aria-busy
            className={_cs(styles.blockLoading, compact && styles.compact, className)}
        >
            <div className={styles.inner}>
                <SpinnerLayout className={styles.spinner} decorative />
                {message && <div className={styles.message}>{message}</div>}
            </div>
        </div>
    );
}

export default BlockLoading;
