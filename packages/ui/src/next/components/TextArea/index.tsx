import { isDefined } from '@togglecorp/fujs';

// NOTE: shares the v2 word count string (same "common" namespace key); the
// file moves here when v2 is removed
import i18n from '#components/TextBadge/i18n.json';
import useTranslation from '#hooks/useTranslation';
import InputContainer from '#next/base/InputContainer';
import RawTextArea from '#next/base/RawTextArea';
import {
    type AccessibleNameProps,
    type CommonInputProps,
    type DiffProps,
    useInputState,
} from '#next/utils/input';
import {
    getHighlightMode,
    getWordCount,
    trimToWordLimit,
} from '#utils/common';
import { resolveToString } from '#utils/translation';

import styles from './styles.module.css';

const BULLET = '•';

interface BaseProps<NAME> extends CommonInputProps<NAME> {
    value: string | null | undefined;
    onChange: (value: string | undefined, name: NAME) => void;
    placeholder?: string;
    /** Minimum height in lines; the field grows with its content where supported. Defaults to 5 */
    rows?: number;
    /** Starts every line with a bullet */
    withAutoBullets?: boolean;
    inputElementRef?: React.Ref<HTMLTextAreaElement>;
}

/** One limit at a time; the count under the field is announced as it changes */
type LimitProps =
    | { maxLength?: number; maxWords?: never }
    | { maxLength?: never; maxWords?: number };

export type Props<NAME> = BaseProps<NAME> & LimitProps & AccessibleNameProps & DiffProps<string>;

/** A multi-line text input with an optional character or word limit */
function TextArea<const NAME>(props: Props<NAME>) {
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
        variant: variantFromProps,
        value,
        onChange,
        placeholder,
        rows = 5,
        withAutoBullets,
        inputElementRef,
        maxLength,
        maxWords,
        withDiffView,
        prevValue,
    } = props;

    const strings = useTranslation(i18n);
    const {
        disabled,
        readOnly,
        variant,
        inputId,
        hintId,
        errorId,
        describedBy,
        invalid,
    } = useInputState({
        disabled: disabledFromProps,
        readOnly: readOnlyFromProps,
        variant: variantFromProps,
        hint,
        error,
    });

    const editable = !disabled && !readOnly;

    const handleChange = (newValue: string | undefined) => {
        onChange(
            isDefined(maxWords) ? trimToWordLimit(newValue, maxWords) : newValue,
            name,
        );
    };

    const handleFocus = (event: React.FocusEvent<HTMLTextAreaElement>) => {
        if (editable && event.currentTarget.value === '') {
            onChange(`${BULLET} `, name);
        }
    };

    const handleKeyUp = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (editable && event.key === 'Enter') {
            onChange(`${event.currentTarget.value}${BULLET} `, name);
        }
    };

    let count: string | undefined;
    if (isDefined(maxWords)) {
        count = resolveToString(
            strings.textBadgeWordCountLabel,
            { wordCount: getWordCount(value), maxWords },
        );
    } else if (isDefined(maxLength)) {
        count = `${value?.length ?? 0} / ${maxLength}`;
    }

    return (
        <InputContainer
            className={className}
            label={label}
            hint={hint}
            error={error}
            inputId={inputId}
            hintId={hintId}
            errorId={errorId}
            disabled={disabled}
            readOnly={readOnly}
            required={required}
            variant={variant}
            highlightMode={getHighlightMode(value, prevValue, withDiffView)}
            withPrevValue={withDiffView}
            prevValue={prevValue}
            input={(
                <div
                    className={styles.field}
                    style={{ '--rows': rows } as React.CSSProperties}
                >
                    <RawTextArea
                        id={inputId}
                        className={styles.textArea}
                        elementRef={inputElementRef}
                        name={name}
                        value={value}
                        onChange={handleChange}
                        onFocus={withAutoBullets ? handleFocus : undefined}
                        onKeyUp={withAutoBullets ? handleKeyUp : undefined}
                        placeholder={placeholder}
                        rows={rows}
                        maxLength={maxLength}
                        disabled={disabled}
                        readOnly={readOnly}
                        aria-required={required}
                        aria-label={ariaLabel}
                        aria-invalid={invalid}
                        aria-describedby={describedBy}
                    />
                    {count && (
                        <div className={styles.count} aria-live="polite" aria-atomic>
                            {count}
                        </div>
                    )}
                </div>
            )}
        />
    );
}

export default TextArea;
