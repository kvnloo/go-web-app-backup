import {
    CheckboxBlankCircleLineIcon,
    RadioButtonLineIcon,
} from '@ifrc-go/icons';
import { _cs } from '@togglecorp/fujs';

import RadioGroupLayout, {
    type RadioKey,
    type RadioOptionProps,
} from '#next/base/RadioGroupLayout';
import RawRadio from '#next/base/RawRadio';
import TextLayout from '#next/base/TextLayout';
import {
    type AccessibleNameProps,
    type CommonInputProps,
    type DiffProps,
    useInputState,
} from '#next/utils/input';
import {
    getOptionLabels,
    getOptionListLayoutProps,
    type OptionLayoutProps,
} from '#next/utils/options';
import { getHighlightMode } from '#utils/common';

import styles from './styles.module.css';

interface BaseProps<NAME, OPTION, KEY extends RadioKey>
    extends Omit<CommonInputProps<NAME>, 'variant'> {
    value: KEY | null | undefined;
    options: OPTION[] | undefined;
    keySelector: (option: OPTION) => KEY;
    labelSelector: (option: OPTION) => React.ReactNode;
    descriptionSelector?: (option: OPTION) => React.ReactNode;
}

/** With deselection the value can become undefined, and onChange says so */
export type DeselectProps<NAME, KEY> =
    | { withDeselect?: never; onChange: (value: KEY, name: NAME) => void }
    | { withDeselect: true; onChange: (value: KEY | undefined, name: NAME) => void };

export type Props<NAME, OPTION, KEY extends RadioKey> = BaseProps<NAME, OPTION, KEY>
    & AccessibleNameProps
    & DiffProps<KEY>
    & DeselectProps<NAME, KEY>
    & OptionLayoutProps;

function RadioOption<KEY extends RadioKey>(props: RadioOptionProps<KEY>) {
    const {
        inputName,
        value,
        label,
        description,
        checked,
        disabled,
        onSelect,
    } = props;

    return (
        <RawRadio
            className={styles.radioOption}
            inputName={inputName}
            value={value}
            checked={checked}
            disabled={disabled}
            onSelect={onSelect}
        >
            {checked
                ? <RadioButtonLineIcon className={_cs(styles.icon, styles.checked)} />
                : <CheckboxBlankCircleLineIcon className={styles.icon} />}
            <span className={styles.content}>
                {label}
                {description && (
                    <TextLayout as="span" textColor="light" textSize="sm">
                        {description}
                    </TextLayout>
                )}
            </span>
        </RawRadio>
    );
}

/** A group of radios for choosing one option, named by its label */
function RadioInput<const NAME, OPTION, KEY extends RadioKey>(
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
        descriptionSelector,
        withDeselect,
        withDiffView,
        prevValue,
        layout,
        layoutOptions,
    } = props;

    const { disabled, readOnly } = useInputState({
        disabled: disabledFromProps,
        readOnly: readOnlyFromProps,
    });

    return (
        <RadioGroupLayout
            className={className}
            name={name}
            value={value}
            onChange={onChange as (value: KEY | undefined, name: NAME) => void}
            options={options}
            keySelector={keySelector}
            labelSelector={labelSelector}
            descriptionSelector={descriptionSelector}
            optionRenderer={RadioOption}
            label={label}
            ariaLabel={ariaLabel}
            hint={hint}
            error={error}
            disabled={disabled}
            readOnly={readOnly}
            required={required}
            withDeselect={withDeselect}
            listLayoutProps={getOptionListLayoutProps(
                { layout, layoutOptions } as OptionLayoutProps,
            )}
            highlightMode={getHighlightMode(value, prevValue, withDiffView)}
            withPrevValue={withDiffView}
            prevValue={withDiffView && getOptionLabels(
                [prevValue],
                options,
                keySelector,
                labelSelector,
            )[0]}
        />
    );
}

export default RadioInput;
