import { useContext } from 'react';
import { LanguageContext } from '@ifrc-go/ui/contexts';
import { useTranslation } from '@ifrc-go/ui/hooks';
import {
    ListView,
    RadioInput,
    SelectInput,
} from '@ifrc-go/ui/next';
import {
    stringLabelSelector,
    stringValueSelector,
} from '@ifrc-go/ui/utils';
import { isNotDefined } from '@togglecorp/fujs';

import {
    DEFAULT_MONTH,
    getCurrentYear,
    getFullDateValue,
    getMonthOptions,
    getYearMonthParts,
    getYearOptions,
} from './utils';

import i18n from './i18n.json';

const NOT_SURE = 'not-sure';
interface NotSureOption {
    key: typeof NOT_SURE;
    label: string;
}
function notSureKeySelector(option: NotSureOption) {
    return option.key;
}
function notSureLabelSelector(option: NotSureOption) {
    return option.label;
}

interface Props<NAME extends string> {
    name: NAME;
    /** A full date; only its year and month are shown */
    value: string | undefined | null;
    onChange: (value: string | undefined, name: NAME) => void;
    /** Adds a "Not Sure" choice that clears the value */
    withNotSure?: boolean;
    /** Defaults to the surrounding form section or page */
    disabled?: boolean;
    /** Defaults to the surrounding form section or page */
    readOnly?: boolean;
}

/**
 * A month and a year of a planned date, such as the expected time of an EAP
 * submission. The surrounding FieldGroup names it.
 */
function EapMonthYearInput<NAME extends string>(props: Props<NAME>) {
    const {
        name,
        value,
        onChange,
        withNotSure,
        disabled,
        readOnly,
    } = props;

    const strings = useTranslation(i18n);
    const { currentLanguage } = useContext(LanguageContext);

    // NOTE: the value is atomic, both selects derive from it so they can never
    // hold a selection the form does not know about; picking one therefore
    // completes the other
    const selectedParts = getYearMonthParts(value);
    const selectedMonth = selectedParts?.month;
    const selectedYear = selectedParts?.year;
    const currentYear = getCurrentYear();

    const monthOptions = getMonthOptions(currentLanguage);
    const yearOptions = getYearOptions(currentYear, selectedYear);
    const notSureOptions: NotSureOption[] = [
        { key: NOT_SURE, label: strings.eapMonthYearInputNotSureLabel },
    ];

    const handleMonthChange = (newMonth: string) => {
        onChange(getFullDateValue(selectedYear ?? String(currentYear), newMonth), name);
    };
    const handleYearChange = (newYear: string) => {
        onChange(getFullDateValue(newYear, selectedMonth ?? DEFAULT_MONTH), name);
    };
    const handleNotSureChange = () => {
        onChange(undefined, name);
    };

    return (
        <ListView
            layout="grid"
            layoutOptions={{ numPreferredColumns: withNotSure ? 3 : 2, minColumnSize: 'xs' }}
        >
            <SelectInput
                name="month"
                ariaLabel={strings.eapMonthYearInputMonthLabel}
                placeholder={strings.eapMonthYearInputMonthLabel}
                withoutClearButton
                value={selectedMonth}
                onChange={handleMonthChange}
                options={monthOptions}
                keySelector={stringValueSelector}
                labelSelector={stringLabelSelector}
                disabled={disabled}
                readOnly={readOnly}
            />
            <SelectInput
                name="year"
                ariaLabel={strings.eapMonthYearInputYearLabel}
                placeholder={strings.eapMonthYearInputYearLabel}
                withoutClearButton
                value={selectedYear}
                onChange={handleYearChange}
                options={yearOptions}
                keySelector={stringValueSelector}
                labelSelector={stringLabelSelector}
                disabled={disabled}
                readOnly={readOnly}
            />
            {withNotSure && (
                <RadioInput
                    name={undefined}
                    ariaLabel={strings.eapMonthYearInputNotSureLabel}
                    options={notSureOptions}
                    keySelector={notSureKeySelector}
                    labelSelector={notSureLabelSelector}
                    value={isNotDefined(value) ? NOT_SURE : undefined}
                    onChange={handleNotSureChange}
                    disabled={disabled}
                    readOnly={readOnly}
                />
            )}
        </ListView>
    );
}

export default EapMonthYearInput;
