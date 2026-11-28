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
    description?: React.ReactNode;
    /** Shows the label before the switch */
    withLabelFirst?: boolean;
}

export type Props<NAME> = BaseProps<NAME> & AccessibleNameProps;

/** An on/off switch, announced as a switch, for settings that apply at once */
function Switch<const NAME>(props: Props<NAME>) {
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
        withLabelFirst,
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

    return (
        <div className={_cs(styles.switch, className)}>
            <CheckboxLayout
                name={name}
                role="switch"
                checked={!!value}
                onChange={onChange}
                indicator={(
                    <span className={_cs(styles.track, value && styles.on)} aria-hidden>
                        <span className={styles.knob} />
                    </span>
                )}
                label={label}
                ariaLabel={ariaLabel}
                description={description}
                disabled={disabled}
                readOnly={readOnly}
                withLabelFirst={withLabelFirst}
                describedBy={describedBy}
                invalid={invalid}
                required={required}
            />
            {error && <InputError id={errorId}>{error}</InputError>}
        </div>
    );
}

export default Switch;
