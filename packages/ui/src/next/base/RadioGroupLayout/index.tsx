import { useId } from 'react';
import { isDefined } from '@togglecorp/fujs';

import InputContainer from '../InputContainer';
import ListLayout, { type Props as ListLayoutProps } from '../ListLayout';

export type RadioKey = string | number | boolean;

/** What a group passes to each option's renderer */
export interface RadioOptionProps<KEY extends RadioKey> {
    inputName: string;
    value: KEY;
    label: React.ReactNode;
    description?: React.ReactNode;
    checked: boolean;
    disabled: boolean;
    onSelect: (value: KEY) => void;
}

export interface Props<NAME, OPTION, KEY extends RadioKey> {
    className?: string;
    /** Class for the element that holds the options (a segment track) */
    listClassName?: string;
    name: NAME;
    value: KEY | null | undefined;
    onChange: (value: KEY | undefined, name: NAME) => void;
    options: OPTION[] | undefined;
    keySelector: (option: OPTION) => KEY;
    labelSelector: (option: OPTION) => React.ReactNode;
    descriptionSelector?: (option: OPTION) => React.ReactNode;
    /** Renders one option, usually a RawRadio with its own look */
    optionRenderer: React.ComponentType<RadioOptionProps<KEY>>;
    label?: React.ReactNode;
    ariaLabel?: string;
    hint?: React.ReactNode;
    error?: React.ReactNode;
    disabled?: boolean;
    readOnly?: boolean;
    required?: boolean;
    /** Clicking the chosen option again clears the value */
    withDeselect?: boolean;
    /** How the options are laid out; defaults to a wrapping row */
    listLayoutProps?: ListLayoutProps;
    highlightMode?: 'add' | 'update' | 'remove';
    prevValue?: React.ReactNode;
    withPrevValue?: boolean;
}

/**
 * A radio group (building block): the group container named by its label,
 * one native radio group under it, and the change rules (read-only, disabled,
 * clearing on a second click). Each option's look comes from the renderer.
 */
function RadioGroupLayout<const NAME, OPTION, KEY extends RadioKey>(
    props: Props<NAME, OPTION, KEY>,
) {
    const {
        className,
        listClassName,
        name,
        value,
        onChange,
        options,
        keySelector,
        labelSelector,
        descriptionSelector,
        optionRenderer: OptionRenderer,
        label,
        ariaLabel,
        hint,
        error,
        disabled = false,
        readOnly = false,
        required,
        withDeselect,
        listLayoutProps = { layout: 'inline', wrap: true },
        highlightMode,
        prevValue,
        withPrevValue,
    } = props;

    const id = useId();
    const inputName = `${id}-radio`;
    const errorId = isDefined(error) ? `${id}-error` : undefined;
    const hintId = isDefined(hint) && !isDefined(error) ? `${id}-hint` : undefined;

    const handleSelect = (key: KEY) => {
        if (readOnly || disabled) {
            return;
        }
        if (key !== value) {
            onChange(key, name);
        } else if (withDeselect) {
            onChange(undefined, name);
        }
    };

    return (
        <InputContainer
            className={className}
            role="radiogroup"
            label={label}
            ariaLabel={ariaLabel}
            hint={hint}
            error={error}
            hintId={hintId}
            errorId={errorId}
            disabled={disabled}
            readOnly={readOnly}
            required={required}
            variant="inline"
            withoutInputSectionPadding
            highlightMode={highlightMode}
            prevValue={prevValue}
            withPrevValue={withPrevValue}
            input={(
                <ListLayout
                    // eslint-disable-next-line react/jsx-props-no-spreading
                    {...listLayoutProps}
                    className={listClassName}
                    spacingOffset={-2}
                >
                    {options?.map((option) => {
                        const key = keySelector(option);
                        return (
                            <OptionRenderer
                                key={String(key)}
                                inputName={inputName}
                                value={key}
                                label={labelSelector(option)}
                                description={descriptionSelector?.(option)}
                                checked={key === value}
                                disabled={disabled}
                                onSelect={handleSelect}
                            />
                        );
                    })}
                </ListLayout>
            )}
        />
    );
}

export default RadioGroupLayout;
