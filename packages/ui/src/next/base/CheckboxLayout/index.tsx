import {
    useEffect,
    useId,
    useRef,
} from 'react';
import { _cs } from '@togglecorp/fujs';

import TextLayout from '../TextLayout';

import styles from './styles.module.css';

export interface Props<NAME> {
    className?: string;
    name: NAME;
    checked: boolean;
    /** Partly checked, such as a "select all" over a partial selection */
    indeterminate?: boolean;
    onChange: (checked: boolean, name: NAME) => void;
    /** The visible indicator: a checkmark or a switch track */
    indicator: React.ReactNode;
    label?: React.ReactNode;
    /** Accessible name when there is no visible label */
    ariaLabel?: string;
    description?: React.ReactNode;
    disabled?: boolean;
    /** Focusable and announced, but not changeable */
    readOnly?: boolean;
    /** switch: announced as an on/off switch */
    role?: 'switch';
    /** Shows the label before the indicator */
    withLabelFirst?: boolean;
    describedBy?: string;
    invalid?: boolean;
    required?: boolean;
}

/**
 * A native checkbox, visually hidden, with a custom indicator and its label
 * (building block). Keyboard use and form semantics come from the native
 * control; the focus ring is drawn on the indicator.
 */
function CheckboxLayout<const NAME>(props: Props<NAME>) {
    const {
        className,
        name,
        checked,
        indeterminate = false,
        onChange,
        indicator,
        label,
        ariaLabel,
        description,
        disabled,
        readOnly,
        role,
        withLabelFirst,
        describedBy,
        invalid,
        required,
    } = props;

    const inputId = useId();
    const inputRef = useRef<HTMLInputElement>(null);

    // NOTE: indeterminate is a DOM property with no attribute; checking clears it
    useEffect(() => {
        if (inputRef.current) {
            inputRef.current.indeterminate = indeterminate;
        }
    }, [indeterminate, checked]);

    const handleClick = (event: React.MouseEvent<HTMLInputElement>) => {
        if (readOnly) {
            event.preventDefault();
        }
    };

    return (
        <label
            htmlFor={inputId}
            className={_cs(
                styles.checkboxLayout,
                withLabelFirst && styles.withLabelFirst,
                (checked || indeterminate) && styles.checked,
                disabled && styles.disabled,
                readOnly && styles.readOnly,
                className,
            )}
        >
            <span className={styles.indicator}>
                <input
                    id={inputId}
                    ref={inputRef}
                    className={styles.input}
                    type="checkbox"
                    role={role}
                    name={typeof name === 'string' ? name : undefined}
                    checked={checked}
                    onChange={(event) => onChange(event.currentTarget.checked, name)}
                    onClick={handleClick}
                    disabled={disabled}
                    aria-readonly={readOnly || undefined}
                    aria-label={ariaLabel}
                    aria-describedby={describedBy}
                    aria-invalid={invalid || undefined}
                    aria-required={required || undefined}
                />
                {indicator}
            </span>
            {(label || description) && (
                <span className={styles.content}>
                    {label}
                    {description && (
                        <TextLayout as="span" textColor="light" textSize="xs">
                            {description}
                        </TextLayout>
                    )}
                </span>
            )}
        </label>
    );
}

export default CheckboxLayout;
