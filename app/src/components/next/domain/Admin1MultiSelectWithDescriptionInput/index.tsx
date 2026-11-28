import { useContext } from 'react';
import { FormStateContext } from '@ifrc-go/ui/contexts';
import { useTranslation } from '@ifrc-go/ui/hooks';
import {
    Description,
    ListView,
    SelectInput,
    TextArea,
} from '@ifrc-go/ui/next';
import { InputError } from '@ifrc-go/ui/next/base';
import {
    numericIdSelector,
    stringNameSelector,
} from '@ifrc-go/ui/utils';
import {
    isDefined,
    listToMap,
    randomString,
} from '@togglecorp/fujs';
import {
    type ArrayError,
    getErrorObject,
    getErrorString,
} from '@togglecorp/toggle-form';

import { MAX_PAGE_LIMIT } from '#utils/constants';
import { useRequest } from '#utils/restRequest';

import i18n from './i18n.json';

interface RegionDescriptionValue {
    client_id: string;
    id?: number;
    district?: number;
    description?: string;
    /** Sent by the server; labels the region until the country's regions load */
    district_details?: { name: string };
}

type SelectedRegion = RegionDescriptionValue & { district: number };

function isSelectedRegion(item: RegionDescriptionValue): item is SelectedRegion {
    return isDefined(item.district);
}

interface Props<NAME> {
    name: NAME;
    /** The chosen regions, each with its description */
    value: RegionDescriptionValue[] | null | undefined;
    onChange: (value: RegionDescriptionValue[] | undefined, name: NAME) => void;
    /** Offers the first-level regions of this country */
    countryId: number;
    error: ArrayError<RegionDescriptionValue> | undefined;
    /** The word limit of each description */
    maxWords?: number;
    /** Defaults to the surrounding form section or page */
    disabled?: boolean;
    /** Defaults to the surrounding form section or page; hides the select */
    readOnly?: boolean;
}

/**
 * A choice of a country's first-level regions (provinces), with a
 * description for each chosen region
 */
function Admin1MultiSelectWithDescriptionInput<const NAME>(props: Props<NAME>) {
    const {
        name,
        value,
        onChange,
        countryId,
        error: errorFromProps,
        maxWords,
        disabled,
        readOnly: readOnlyFromProps,
    } = props;

    const strings = useTranslation(i18n);
    const formState = useContext(FormStateContext);
    const readOnly = readOnlyFromProps ?? formState.readOnly;
    const error = getErrorObject(errorFromProps);

    // NOTE: a country has few first-level regions, so all of them are loaded
    // and searched locally
    const { response: regionsResponse } = useRequest({
        url: '/api/v2/district/',
        query: {
            country: countryId,
            limit: MAX_PAGE_LIMIT,
        },
    });
    const regions = regionsResponse?.results;
    const regionNameById = listToMap(
        regions ?? [],
        ({ id }) => id,
        ({ name: regionName }) => regionName,
    );

    const selectedRegions = value?.filter(isSelectedRegion) ?? [];
    const selectedRegionIds = selectedRegions.map(({ district }) => district);

    const handleSelectionChange = (regionIds: number[]) => {
        const selectedRegionById = listToMap(selectedRegions, ({ district }) => district);
        onChange(
            regionIds.map((regionId) => selectedRegionById[regionId] ?? {
                client_id: randomString(),
                district: regionId,
            }),
            name,
        );
    };

    const handleDescriptionChange = (description: string | undefined, clientId: string) => {
        onChange(
            value?.map((item) => (
                item.client_id === clientId ? { ...item, description } : item
            )),
            name,
        );
    };

    const listError = getErrorString(errorFromProps);

    return (
        <ListView layout="block">
            {listError && <InputError>{listError}</InputError>}
            {!readOnly && (
                <SelectInput
                    name="district"
                    label={strings.admin1MultiSelectWithDescriptionInputSelectLabel}
                    options={regions}
                    keySelector={numericIdSelector}
                    labelSelector={stringNameSelector}
                    multiple
                    withSelectAllButton
                    value={selectedRegionIds}
                    onChange={handleSelectionChange}
                    disabled={disabled}
                />
            )}
            {selectedRegions.length === 0 && (
                <Description variant="light">
                    {strings.admin1MultiSelectWithDescriptionInputEmptyMessage}
                </Description>
            )}
            {selectedRegions.map((item) => (
                <TextArea
                    key={item.client_id}
                    name={item.client_id}
                    label={regionNameById[item.district]
                        ?? item.district_details?.name
                        ?? String(item.district)}
                    value={item.description}
                    onChange={handleDescriptionChange}
                    error={getErrorString(getErrorObject(error?.[item.client_id])?.description)}
                    maxWords={maxWords}
                    disabled={disabled}
                    readOnly={readOnlyFromProps}
                />
            ))}
        </ListView>
    );
}

export default Admin1MultiSelectWithDescriptionInput;
