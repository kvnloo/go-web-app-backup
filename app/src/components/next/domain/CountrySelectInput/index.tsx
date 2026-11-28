import { SelectInput } from '@ifrc-go/ui/next';
import {
    numericIdSelector,
    stringNameSelector,
} from '@ifrc-go/ui/utils';

import useCountry, { type Country } from '#hooks/domain/useCountry';

import { type DomainSelectInputProps } from '../types';

type Props<NAME> = DomainSelectInputProps<NAME, Country, number> & {
    /** Lists only the countries of this region */
    regionId?: number;
};

/** A select over GO's countries; `multiple` for several */
function CountrySelectInput<const NAME>(props: Props<NAME>) {
    const {
        regionId,
        ...selectProps
    } = props;

    const countries = useCountry({ region: regionId });

    return (
        <SelectInput
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...selectProps}
            options={countries}
            keySelector={numericIdSelector}
            labelSelector={stringNameSelector}
        />
    );
}

export default CountrySelectInput;
