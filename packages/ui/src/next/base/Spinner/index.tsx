import { _cs } from '@togglecorp/fujs';

import styles from './styles.module.css';

export interface Props {
    className?: string;
    /** Inside another live region (a message): no role of its own */
    decorative?: boolean;
}

/**
 * Busy indicator (building block). On its own it is a role="status" live
 * region marked aria-busy; decorative spinners leave that to their container.
 */
function Spinner(props: Props) {
    const { className, decorative = false } = props;

    return (
        <div
            role={decorative ? undefined : 'status'}
            aria-busy={decorative ? undefined : true}
            aria-hidden={decorative ? true : undefined}
            className={_cs(styles.spinner, className)}
        >
            <div className={styles.spinnerBounce} aria-hidden />
            <div className={styles.spinnerBounce} aria-hidden />
            <div className={styles.spinnerBounce} aria-hidden />
        </div>
    );
}

export default Spinner;
