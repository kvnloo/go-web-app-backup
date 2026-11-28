import {
    useCallback,
    useMemo,
} from 'react';
import { useTranslation } from '@ifrc-go/ui/hooks';
import {
    DataDisplay,
    ListView,
    Section,
    Text,
} from '@ifrc-go/ui/next';
import { listToGroupList } from '@togglecorp/fujs';

import { APPEAL_TYPE_DREF } from '#components/domain/ActiveOperationMap/utils';
import CountryPointsMap, {
    type CountryPoint,
    type MapLegendOption,
} from '#components/domain/CountryPointsMap';
import DisasterTypeSelectInput from '#components/next/domain/DisasterTypeSelectInput';
import useFilterState from '#hooks/useFilterState';
import { COLOR_BLUE } from '#utils/constants';
import { useRequest } from '#utils/restRequest';

import i18n from './i18n.json';

const MAP_LIMIT = 1000;
const now = new Date().toISOString();

function DrefOperationsMap() {
    const strings = useTranslation(i18n);

    const {
        filter,
        rawFilter,
        setFilterField,
    } = useFilterState<{
        disasterType?: number;
    }>({
        filter: {},
    });

    const { response } = useRequest({
        url: '/api/v2/appeal/',
        preserveResponse: true,
        query: {
            atype: APPEAL_TYPE_DREF,
            dtype: filter.disasterType,
            end_date__gt: now,
            limit: MAP_LIMIT,
        },
    });

    const appealsByIso3 = useMemo(
        () => listToGroupList(
            response?.results ?? [],
            (appeal) => appeal.country.iso3 ?? '<no-key>',
        ),
        [response],
    );

    const points = useMemo<CountryPoint[]>(
        () => Object.keys(appealsByIso3)
            .filter((iso3) => iso3 !== '<no-key>')
            .map((iso3) => ({ iso3, color: COLOR_BLUE })),
        [appealsByIso3],
    );

    const legendOptions = useMemo<MapLegendOption[]>(
        () => [{ value: APPEAL_TYPE_DREF, label: strings.drefMapLegendDref, color: COLOR_BLUE }],
        [strings.drefMapLegendDref],
    );

    const renderPopup = useCallback(
        (iso3: string) => {
            const appeals = appealsByIso3[iso3] ?? [];
            return (
                <ListView layout="block" spacing="sm">
                    {appeals.map((appeal) => (
                        <ListView key={appeal.id} layout="block" spacing="2xs">
                            <Text variant="strong">{appeal.name}</Text>
                            <DataDisplay
                                label={strings.drefMapFunding}
                                valueType="number"
                                value={appeal.amount_requested}
                                variant="plain"
                                textSize="sm"
                            />
                        </ListView>
                    ))}
                </ListView>
            );
        },
        [appealsByIso3, strings.drefMapFunding],
    );

    return (
        <Section
            heading={strings.drefMapTitle}
            filters={(
                <DisasterTypeSelectInput
                    ariaLabel={strings.drefMapDisasterTypeLabel}
                    placeholder={strings.drefMapDisasterTypePlaceholder}
                    name="disasterType"
                    value={rawFilter.disasterType}
                    onChange={setFilterField}
                />
            )}
        >
            <CountryPointsMap
                mapTitle={strings.drefMapTitle}
                points={points}
                legendOptions={legendOptions}
                renderPopup={renderPopup}
            />
        </Section>
    );
}

export default DrefOperationsMap;
