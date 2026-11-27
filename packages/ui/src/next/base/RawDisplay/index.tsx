import { useContext } from 'react';
import {
    _cs,
    isNotDefined,
} from '@togglecorp/fujs';

// NOTE: shares the v2 Yes/No strings (same "common" namespace keys); the file
// moves here when v2 is removed
import booleanI18n from '#components/BooleanOutput/i18n.json';
import DefaultsContext from '#contexts/defaults';
import LanguageContext from '#contexts/language';
import useTranslation from '#hooks/useTranslation';
import {
    type DateLike,
    encodeDate,
    formatDate,
} from '#utils/common';
import { DEFAULT_DATE_FORMAT } from '#utils/constants';
import {
    formatNumberPreset,
    type NumberFormatOptions,
    type NumberFormatPreset,
} from '#utils/format';

import styles from './styles.module.css';

const FULL_DATE_FORMAT = 'dd MMM yyyy';
const FULL_TIME_FORMAT = 'hh:mm';

interface BaseProps {
    className?: string;
    /** Shown when the value is missing; defaults to the context value ("--") */
    invalidText?: React.ReactNode;
}

export interface NumberValueProps extends BaseProps {
    valueType: 'number';
    value: number | null | undefined;
    format?: NumberFormatPreset;
    formatOptions?: NumberFormatOptions;
}

export interface DateValueProps extends BaseProps {
    valueType: 'date';
    value: DateLike | null | undefined;
    /** Date format tokens; defaults to yyyy-MM-dd */
    format?: string;
    formatOptions?: never;
}

export interface BooleanValueProps extends BaseProps {
    valueType: 'boolean';
    value: boolean | null | undefined;
    format?: never;
    formatOptions?: never;
}

export interface TextValueProps extends BaseProps {
    valueType: 'text';
    value: string | null | undefined;
    format?: never;
    formatOptions?: never;
}

export interface NodeValueProps extends BaseProps {
    valueType?: never;
    value?: React.ReactNode;
    format?: never;
    formatOptions?: never;
}

export type Props =
    | NumberValueProps
    | DateValueProps
    | BooleanValueProps
    | TextValueProps
    | NodeValueProps;

function hasTimeTokens(format: string) {
    // NOTE: MM is the month; lowercase mm, hh and ss are time tokens
    return /hh|mm|ss/.test(format);
}

interface ResolvedProps {
    className: string;
    invalidText: React.ReactNode;
}

function NumberValue(props: Omit<NumberValueProps, keyof BaseProps> & ResolvedProps) {
    const {
        className,
        invalidText,
        value,
        format,
        formatOptions,
    } = props;
    const { currentLanguage } = useContext(LanguageContext);
    const formatted = formatNumberPreset(value, format, formatOptions, currentLanguage);

    if (isNotDefined(formatted) || isNotDefined(value)) {
        return <data className={className} value="">{invalidText}</data>;
    }
    return (
        <data
            className={className}
            value={String(value)}
            role={formatted.isAbbreviated ? 'img' : undefined}
            aria-label={formatted.isAbbreviated ? formatted.fullText : undefined}
        >
            {formatted.text}
        </data>
    );
}

function DateValue(props: Omit<DateValueProps, keyof BaseProps> & ResolvedProps) {
    const {
        className,
        invalidText,
        value,
        format = DEFAULT_DATE_FORMAT,
    } = props;
    const formatted = formatDate(value, format);

    if (isNotDefined(formatted) || isNotDefined(value)) {
        return <time className={className}>{invalidText}</time>;
    }
    const withTime = hasTimeTokens(format);
    const fullReading = formatDate(
        value,
        withTime ? `${FULL_DATE_FORMAT}, ${FULL_TIME_FORMAT}` : FULL_DATE_FORMAT,
    );
    const isAbbreviated = formatted !== fullReading;
    return (
        <time
            className={className}
            dateTime={withTime ? new Date(value).toISOString() : encodeDate(value)}
            role={isAbbreviated ? 'img' : undefined}
            aria-label={isAbbreviated ? fullReading : undefined}
        >
            {formatted}
        </time>
    );
}

function BooleanValue(props: Omit<BooleanValueProps, keyof BaseProps> & ResolvedProps) {
    const {
        className,
        invalidText,
        value,
    } = props;
    const strings = useTranslation(booleanI18n);

    if (isNotDefined(value)) {
        return <data className={className} value="">{invalidText}</data>;
    }
    return (
        <data className={className} value={String(value)}>
            {value ? strings.booleanYesLabel : strings.booleanNoLabel}
        </data>
    );
}

/**
 * Renders a value of any type the way GO shows it (building block).
 * Numbers and dates render native <data value> / <time dateTime> elements;
 * when the shown text is abbreviated, the full reading is given to screen
 * readers through role="img" + aria-label.
 */
function RawDisplay(props: Props) {
    const {
        className,
        invalidText: invalidTextFromProps,
        ...valueProps
    } = props;
    const { invalidText: defaultInvalidText } = useContext(DefaultsContext);
    const resolved = {
        className: _cs(styles.rawDisplay, className),
        invalidText: invalidTextFromProps ?? defaultInvalidText,
    };

    if (valueProps.valueType === 'number') {
        // eslint-disable-next-line react/jsx-props-no-spreading
        return <NumberValue {...valueProps} {...resolved} />;
    }
    if (valueProps.valueType === 'date') {
        // eslint-disable-next-line react/jsx-props-no-spreading
        return <DateValue {...valueProps} {...resolved} />;
    }
    if (valueProps.valueType === 'boolean') {
        // eslint-disable-next-line react/jsx-props-no-spreading
        return <BooleanValue {...valueProps} {...resolved} />;
    }

    const { value } = valueProps;
    if (isNotDefined(value) || value === '' || value instanceof Date) {
        return <span className={resolved.className}>{resolved.invalidText}</span>;
    }
    return <span className={resolved.className}>{value}</span>;
}

export default RawDisplay;
