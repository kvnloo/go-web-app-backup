// NOTE: shares the v2 Yes/No strings (same "common" namespace keys); the file
// moves here when v2 is removed
import i18n from '#components/BooleanInput/i18n.json';
import useTranslation from '#hooks/useTranslation';
import type {
    AccessibleNameProps,
    CommonInputProps,
    DiffProps,
} from '#next/utils/input';

import RadioInput, { type DeselectProps } from '../RadioInput';

interface BooleanOption {
    value: boolean;
    label: string;
}

function valueSelector(option: BooleanOption) {
    return option.value;
}

function labelSelector(option: BooleanOption) {
    return option.label;
}

interface BaseProps<NAME> extends Omit<CommonInputProps<NAME>, 'variant'> {
    value: boolean | null | undefined;
}

export type Props<NAME> = BaseProps<NAME>
    & AccessibleNameProps
    & DiffProps<boolean>
    & DeselectProps<NAME, boolean>;

/** A Yes / No choice, as a radio group */
function BooleanInput<const NAME>(props: Props<NAME>) {
    const strings = useTranslation(i18n);

    const options: BooleanOption[] = [
        { value: true, label: strings.yesLabel },
        { value: false, label: strings.noLabel },
    ];

    return (
        <RadioInput
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...props}
            options={options}
            keySelector={valueSelector}
            labelSelector={labelSelector}
        />
    );
}

export default BooleanInput;
