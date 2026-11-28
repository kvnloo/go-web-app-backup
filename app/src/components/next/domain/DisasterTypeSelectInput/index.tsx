import { SelectInput } from '@ifrc-go/ui/next';

import { type DisasterTypes } from '#contexts/domain';
import useDisasterType from '#hooks/domain/useDisasterType';

import { type DomainSelectInputProps } from '../types';

type DisasterTypeItem = NonNullable<DisasterTypes['results']>[number];

function keySelector(type: DisasterTypeItem) {
    return type.id;
}
function labelSelector(type: DisasterTypeItem) {
    return type.name ?? '?';
}

type Props<NAME> = DomainSelectInputProps<NAME, DisasterTypeItem, number> & {
    /** Keeps only the disaster types it returns true for */
    optionsFilter?: (item: DisasterTypeItem) => boolean;
};

/** A select over GO's disaster types (hazards); `multiple` for several */
function DisasterTypeSelectInput<const NAME>(props: Props<NAME>) {
    const {
        optionsFilter,
        ...selectProps
    } = props;

    const disasterTypes = useDisasterType();
    const options = optionsFilter
        ? disasterTypes?.filter(optionsFilter)
        : disasterTypes;

    return (
        <SelectInput
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...selectProps}
            options={options}
            keySelector={keySelector}
            labelSelector={labelSelector}
        />
    );
}

export default DisasterTypeSelectInput;
