import { CheckLineIcon } from '@ifrc-go/icons';
import { _cs } from '@togglecorp/fujs';

import styles from './styles.module.css';

export interface Props {
    className?: string;
    label: React.ReactNode;
    description?: React.ReactNode;
    /** The option is chosen */
    active?: boolean;
}

/** One option in a select popup: a check mark (shown when chosen), label and description */
function Option(props: Props) {
    const {
        className,
        label,
        description,
        active,
    } = props;

    return (
        <div className={_cs(styles.option, active && styles.active, className)}>
            <div className={styles.icon}>
                <CheckLineIcon />
            </div>
            <div className={styles.label}>
                <div className={styles.overflowContainer}>
                    {label}
                </div>
                {description && (
                    <div className={_cs(styles.overflowContainer, styles.description)}>
                        {description}
                    </div>
                )}
            </div>
        </div>
    );
}

export default Option;
