import { useId } from 'react';
import { _cs } from '@togglecorp/fujs';

import styles from './styles.module.css';

export interface Props<KEY> {
    className?: string;
    /** Shared by the radios of one group, which makes them one native group */
    inputName: string;
    value: KEY;
    checked: boolean;
    disabled?: boolean;
    /** Called when the radio is chosen, and when the chosen radio is clicked again */
    onSelect: (value: KEY) => void;
    /** The visible option */
    children: React.ReactNode;
}

/**
 * A native radio, visually hidden, inside the label that shows the option
 * (building block). Radios sharing an input name get the native arrow-key
 * navigation; the focus ring is drawn on the label content.
 */
function RawRadio<const KEY>(props: Props<KEY>) {
    const {
        className,
        inputName,
        value,
        checked,
        disabled,
        onSelect,
        children,
    } = props;

    const inputId = useId();

    return (
        <label
            htmlFor={inputId}
            className={_cs(styles.rawRadio, disabled && styles.disabled, className)}
        >
            <input
                id={inputId}
                className={styles.input}
                type="radio"
                name={inputName}
                value={String(value)}
                checked={checked}
                disabled={disabled}
                onChange={() => onSelect(value)}
                // NOTE: a chosen radio fires no change when clicked again; the group
                // decides whether that clears it
                onClick={() => {
                    if (checked) {
                        onSelect(value);
                    }
                }}
            />
            {children}
        </label>
    );
}

export default RawRadio;
