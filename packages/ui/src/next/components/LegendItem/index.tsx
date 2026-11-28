import { _cs } from '@togglecorp/fujs';

import styles from './styles.module.css';

export interface Props {
    className?: string;
    /** A CSS colour, usually from the data */
    color: string;
    label: React.ReactNode;
}

/** A colour swatch and its label, for chart and bar legends */
function LegendItem(props: Props) {
    const {
        className,
        color,
        label,
    } = props;

    return (
        <div className={_cs(styles.legendItem, className)}>
            <span
                className={styles.swatch}
                style={{ '--swatch-color': color } as React.CSSProperties}
                aria-hidden
            />
            <span className={styles.label}>{label}</span>
        </div>
    );
}

export default LegendItem;
