import { useState } from 'react';
import { useDebouncedValue } from '@ifrc-go/ui/hooks';
import { SearchSelectInput } from '@ifrc-go/ui/next';

import {
    type GoApiResponse,
    useRequest,
} from '#utils/restRequest';

import { type DomainSearchSelectInputProps } from '../types';

type EventMini = NonNullable<GoApiResponse<'/api/v2/event/mini/'>['results']>[number];
export type EventItem = Pick<EventMini, 'id' | 'name' | 'dtype'>
    & Partial<Pick<EventMini, 'latest_field_report_id'>>;

function keySelector(event: EventItem) {
    return event.id;
}
function labelSelector(event: EventItem) {
    return event.name ?? '???';
}

type Props<NAME> = DomainSearchSelectInputProps<NAME, EventItem, number> & {
    /** Searches only the emergencies of this country */
    countryId?: number;
};

/** A select that searches GO's emergencies; `multiple` for several */
function EventSearchSelectInput<const NAME>(props: Props<NAME>) {
    const {
        countryId,
        ...selectProps
    } = props;

    const [opened, setOpened] = useState(false);
    const [searchText, setSearchText] = useState<string | undefined>('');
    const debouncedSearchText = useDebouncedValue(searchText);

    const {
        pending,
        error,
        response,
    } = useRequest({
        skip: !opened,
        url: '/api/v2/event/mini/',
        query: {
            search: debouncedSearchText,
            countries__in: countryId,
            limit: 20,
        },
        preserveResponse: true,
    });

    return (
        <SearchSelectInput
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...selectProps}
            keySelector={keySelector}
            labelSelector={labelSelector}
            onSearchValueChange={setSearchText}
            searchOptions={response?.results}
            optionsPending={pending}
            optionsErrored={!!error}
            totalOptionsCount={response?.count ?? 0}
            onShowDropdownChange={setOpened}
        />
    );
}

export default EventSearchSelectInput;
