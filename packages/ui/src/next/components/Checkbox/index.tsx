import {
    CheckboxBlankLineIcon,
    CheckboxFillIcon,
    CheckboxIndeterminateFillIcon,
} from '@ifrc-go/icons';
import { _cs } from '@togglecorp/fujs';

import CheckboxLayout from '#next/base/CheckboxLayout';
import InputError from '#next/base/InputError';
import {
    type AccessibleNameProps,
    type CommonInputProps,
    useInputState,
} from '#next/utils/input';

import styles from './styles.module.css';

interface BaseProps<NAME> extends Omit<CommonInputProps<NAME>, 'variant' | 'hint'> {
    value: boolean | null | undefined;
    onChange: (value: boolean, name: NAME) => void;
    /** Shown under the label */
    description?: React.ReactNode;
    /** Partly checked, such as a "select all" over a partial selection */
    indeterminate?: boolean;
}

export type Props<NAME> = BaseProps<NAME> & AccessibleNameProps;

/** A single checkbox with its label; read-only checkboxes stay focusable */
function Checkbox<const NAME>(props: Props<NAME>) {
    const {
        className,
        name,
        label,
        ariaLabel,
        error,
        disabled: disabledFromProps,
        readOnly: readOnlyFromProps,
        required,
        value,
        onChange,
        description,
        indeterminate,
    } = props;

    const {
        disabled,
        readOnly,
        errorId,
        describedBy,
        invalid,
    } = useInputState({
        disabled: disabledFromProps,
        readOnly: readOnlyFromProps,
        error,
    });

    let indicator = <CheckboxBlankLineIcon />;
    if (indeterminate) {
        indicator = <CheckboxIndeterminateFillIcon className={styles.checked} />;
    } else if (value) {
        indicator = <CheckboxFillIcon className={styles.checked} />;
    }

    return (
        <div className={_cs(styles.checkbox, className)}>
            <CheckboxLayout
                name={name}
                checked={!!value}
                indeterminate={indeterminate}
                onChange={onChange}
                indicator={indicator}
                label={label}
                ariaLabel={ariaLabel}
                description={description}
                disabled={disabled}
                readOnly={readOnly}
                describedBy={describedBy}
                invalid={invalid}
                required={required}
            />
            {error && <InputError id={errorId}>{error}</InputError>}
        </div>
    );
}

export default Checkbox;
