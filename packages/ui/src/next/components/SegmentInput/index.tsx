import { _cs } from '@togglecorp/fujs';

import ButtonLayout from '#next/base/ButtonLayout';
import RadioGroupLayout, {
    type RadioKey,
    type RadioOptionProps,
} from '#next/base/RadioGroupLayout';
import RawRadio from '#next/base/RawRadio';
import {
    type AccessibleNameProps,
    type CommonInputProps,
    useInputState,
} from '#next/utils/input';

import styles from './styles.module.css';

interface BaseProps<NAME, OPTION, KEY extends RadioKey>
    extends Omit<CommonInputProps<NAME>, 'variant'> {
    value: KEY | null | undefined;
    onChange: (value: KEY, name: NAME) => void;
    options: OPTION[] | undefined;
    keySelector: (option: OPTION) => KEY;
    labelSelector: (option: OPTION) => React.ReactNode;
}

export type Props<NAME, OPTION, KEY extends RadioKey> = BaseProps<NAME, OPTION, KEY>
    & AccessibleNameProps;

function Segment<KEY extends RadioKey>(props: RadioOptionProps<KEY>) {
    const {
        inputName,
        value,
        label,
        checked,
        disabled,
        onSelect,
    } = props;

    return (
        <RawRadio
            className={styles.segment}
            inputName={inputName}
            value={value}
            checked={checked}
            disabled={disabled}
            onSelect={onSelect}
        >
            <ButtonLayout
                className={_cs(styles.segmentLook, checked && styles.checked)}
                tone={checked ? 'primary' : 'neutral'}
                fill={checked ? 'solid' : 'none'}
                disabled={disabled}
            >
                {label}
            </ButtonLayout>
        </RawRadio>
    );
}

/**
 * A short choice shown as a row of segments on a track, such as a view
 * switch. It is a radio group, so arrow keys move between segments.
 */
function SegmentInput<const NAME, OPTION, KEY extends RadioKey>(
    props: Props<NAME, OPTION, KEY>,
) {
    const {
        className,
        name,
        label,
        ariaLabel,
        hint,
        error,
        disabled: disabledFromProps,
        readOnly: readOnlyFromProps,
        required,
        value,
        onChange,
        options,
        keySelector,
        labelSelector,
    } = props;

    const { disabled, readOnly } = useInputState({
        disabled: disabledFromProps,
        readOnly: readOnlyFromProps,
    });

    return (
        <RadioGroupLayout
            className={className}
            listClassName={styles.track}
            name={name}
            value={value}
            onChange={onChange as (value: KEY | undefined, name: NAME) => void}
            options={options}
            keySelector={keySelector}
            labelSelector={labelSelector}
            optionRenderer={Segment}
            label={label}
            ariaLabel={ariaLabel}
            hint={hint}
            error={error}
            disabled={disabled}
            readOnly={readOnly}
            required={required}
            listLayoutProps={{ layout: 'inline', spacing: 'none' }}
        />
    );
}

export default SegmentInput;
