import { _cs } from '@togglecorp/fujs';

import styles from './styles.module.css';

export interface Props {
    className?: string;
    /** A CSS colour */
    value: string;
    shape?: 'round' | 'square';
    /** Defaults to md */
    size?: 'sm' | 'md' | 'lg';
}

/** A swatch of a colour, such as a hazard or sector colour */
function ColorPreview(props: Props) {
    const {
        className,
        value,
        shape = 'round',
        size = 'md',
    } = props;

    return (
        <span
            className={_cs(
                styles.colorPreview,
                shape === 'round' && styles.round,
                size === 'sm' && styles.small,
                size === 'lg' && styles.large,
                className,
            )}
            style={{ '--preview-color': value } as React.CSSProperties}
            aria-hidden
        />
    );
}

export default ColorPreview;
