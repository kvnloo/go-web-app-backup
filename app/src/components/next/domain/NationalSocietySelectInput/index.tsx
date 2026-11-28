import { SelectInput } from '@ifrc-go/ui/next';
import { numericIdSelector } from '@ifrc-go/ui/utils';
import { isDefined } from '@togglecorp/fujs';

import useNationalSociety, { type NationalSociety } from '#hooks/domain/useNationalSociety';

import { type DomainSelectInputProps } from '../types';

function societyNameSelector(nationalSociety: NationalSociety) {
    return nationalSociety.society_name;
}

type Props<NAME> = DomainSelectInputProps<NAME, NationalSociety, number> & {
    /** Lists only the National Societies of these regions (or of `countries`) */
    regions?: number[];
    /** Lists only the National Societies of these countries (or of `regions`) */
    countries?: number[];
};

/** A select over the National Societies; `multiple` for several */
function NationalSocietySelectInput<const NAME>(props: Props<NAME>) {
    const {
        regions,
        countries,
        ...selectProps
    } = props;

    const nationalSocieties = useNationalSociety();
    const filtered = isDefined(regions) || isDefined(countries);
    const options = filtered
        ? nationalSocieties?.filter((nationalSociety) => (
            (isDefined(nationalSociety.region) && regions?.includes(nationalSociety.region))
            || countries?.includes(nationalSociety.id)
        ))
        : nationalSocieties;

    return (
        <SelectInput
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...selectProps}
            options={options}
            keySelector={numericIdSelector}
            labelSelector={societyNameSelector}
        />
    );
}

export default NationalSocietySelectInput;
