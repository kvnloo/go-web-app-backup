import {
    useContext,
    useState,
} from 'react';
import { CloseLineIcon } from '@ifrc-go/icons';
import { FormStateContext } from '@ifrc-go/ui/contexts';
import { useTranslation } from '@ifrc-go/ui/hooks';
import {
    Button,
    Description,
    Dialog,
    IconButton,
    ListView,
    useDialogState,
} from '@ifrc-go/ui/next';
import {
    ChipLayout,
    InputError,
} from '@ifrc-go/ui/next/base';
import { resolveToString } from '@ifrc-go/ui/utils';
import {
    isDefined,
    isNotDefined,
    listToMap,
} from '@togglecorp/fujs';
import {
    MapBounds,
    MapLayer,
    MapSource,
} from '@togglecorp/re-map';
import {
    type Expression,
    type FillLayer,
    type LineLayer,
    type MapboxGeoJSONFeature,
    type SymbolLayer,
} from 'mapbox-gl';

import BaseMap from '#components/domain/BaseMap';
import GoMapContainer from '#components/GoMapContainer';
import useCountry from '#hooks/domain/useCountry';
import useCountryHasAdmin2 from '#hooks/domain/useCountryHasAdmin2';
import {
    COLOR_BLACK,
    COLOR_DARK_GREY,
    COLOR_LIGHT_GREY,
    COLOR_PRIMARY_RED,
    COLOR_TEXT,
    COLOR_TEXT_ON_DARK,
    DEFAULT_MAP_PADDING,
    DURATION_MAP_ZOOM,
    MAX_PAGE_LIMIT,
} from '#utils/constants';
import { getGeoJsonBounds } from '#utils/geo';
import {
    getAdmin2CentroidTileset,
    getAdmin2Tileset,
} from '#utils/map';
import { useRequest } from '#utils/restRequest';

import i18n from './i18n.json';

interface Props<NAME> {
    name: NAME;
    /** The ids of the chosen second-level areas */
    value: number[] | null | undefined;
    onChange: (value: number[] | undefined, name: NAME) => void;
    /** The areas are chosen on a map of this country */
    countryId: number;
    error?: React.ReactNode;
    /** Defaults to the surrounding form section or page */
    disabled?: boolean;
    /** Defaults to the surrounding form section or page; hides the map and the remove buttons */
    readOnly?: boolean;
}

/**
 * A choice of a country's second-level areas, picked on a map in a dialog
 * and listed as removable chips
 */
function Admin2Input<const NAME>(props: Props<NAME>) {
    const {
        name,
        value,
        onChange,
        countryId,
        error,
        disabled,
        readOnly: readOnlyFromProps,
    } = props;

    const strings = useTranslation(i18n);
    const formState = useContext(FormStateContext);
    const readOnly = readOnlyFromProps ?? formState.readOnly;
    const dialog = useDialogState();

    const countryDetails = useCountry({ id: countryId });
    const iso3 = countryDetails?.iso3;
    const { hasAdmin2 } = useCountryHasAdmin2(countryId);

    // NOTE: the map tiles identify areas by code, not by id: these are the
    // codes picked on the map since the value last changed outside it
    const [pickedCodes, setPickedCodes] = useState<string[]>();

    const {
        pending: valueDetailsPending,
        response: valueDetails,
    } = useRequest({
        skip: isNotDefined(value) || value.length === 0,
        url: '/api/v2/admin2/',
        query: {
            id__in: value ?? [],
            limit: MAX_PAGE_LIMIT,
        },
        preserveResponse: true,
    });

    const { response: pickedDetails } = useRequest({
        skip: isNotDefined(pickedCodes) || pickedCodes.length === 0,
        url: '/api/v2/admin2/',
        query: {
            code__in: pickedCodes ?? [],
            limit: MAX_PAGE_LIMIT,
        },
        onSuccess: (response) => {
            onChange(response.results.map(({ id }) => id), name);
        },
    });

    const admin2ById = listToMap(
        [...(valueDetails?.results ?? []), ...(pickedDetails?.results ?? [])],
        ({ id }) => id,
    );
    const getAdmin2Label = (admin2Id: number) => {
        const admin2 = admin2ById[admin2Id];
        return admin2 ? `${admin2.name} (${admin2.district_name})` : String(admin2Id);
    };

    const selectedCodes = pickedCodes
        ?? value?.map((admin2Id) => admin2ById[admin2Id]?.code).filter(isDefined)
        ?? [];

    const handleAdmin2Click = (feature: MapboxGeoJSONFeature) => {
        const code = feature.properties?.code as string | undefined;
        if (isNotDefined(code)) {
            return false;
        }

        const newCodes = selectedCodes.includes(code)
            ? selectedCodes.filter((selectedCode) => selectedCode !== code)
            : [...selectedCodes, code];

        setPickedCodes(newCodes);
        // NOTE: an empty pick skips the request, so the value is cleared here
        if (newCodes.length === 0) {
            onChange(undefined, name);
        }

        return false;
    };

    const handleRemove = (admin2Id: number) => {
        setPickedCodes(undefined);
        onChange(value?.filter((selectedId) => selectedId !== admin2Id), name);
    };

    const isSelectedExpression: Expression = [
        'in',
        ['get', 'code'],
        ['literal', selectedCodes],
    ];

    const adminOneLabelLayerOptions: Omit<SymbolLayer, 'id'> = {
        type: 'symbol',
        paint: {
            'text-opacity': [
                'match',
                ['get', 'country_id'],
                countryId,
                1,
                0,
            ],
        },
        layout: {
            'text-offset': [0, 1],
            visibility: 'visible',
        },
    };

    const adminTwoFillLayerOptions: Omit<FillLayer, 'id'> | undefined = iso3 ? {
        type: 'fill',
        'source-layer': getAdmin2Tileset(iso3).sourceLayer,
        paint: {
            'fill-color': [
                'case',
                isSelectedExpression,
                COLOR_PRIMARY_RED,
                ['boolean', ['feature-state', 'hovered'], false],
                COLOR_DARK_GREY,
                COLOR_LIGHT_GREY,
            ],
            'fill-outline-color': COLOR_DARK_GREY,
            'fill-opacity': 1,
        },
        layout: {
            visibility: 'visible',
        },
    } : undefined;

    const adminTwoLineLayerOptions: Omit<LineLayer, 'id'> | undefined = iso3 ? {
        type: 'line',
        'source-layer': getAdmin2Tileset(iso3).sourceLayer,
        paint: {
            'line-color': COLOR_BLACK,
            'line-opacity': 1,
        },
        layout: {
            visibility: 'visible',
        },
    } : undefined;

    const adminTwoLabelLayerOptions: Omit<SymbolLayer, 'id'> | undefined = iso3 ? {
        type: 'symbol',
        'source-layer': getAdmin2CentroidTileset(iso3).sourceLayer,
        paint: {
            'text-color': [
                'case',
                isSelectedExpression,
                COLOR_TEXT_ON_DARK,
                COLOR_TEXT,
            ],
            'text-opacity': 1,
        },
        layout: {
            'text-field': ['get', 'name'],
            'text-anchor': 'center',
            'text-size': 10,
        },
    } : undefined;

    const bounds = countryDetails ? getGeoJsonBounds(countryDetails.bbox) : undefined;
    const hasValue = isDefined(value) && value.length > 0;

    return (
        <ListView layout="block" spacing="sm">
            <ListView spacing="sm" layoutOptions={{ wrap: true }}>
                {hasAdmin2 && !readOnly && (
                    <Button
                        name={undefined}
                        onClick={dialog.open}
                        disabled={disabled || valueDetailsPending}
                    >
                        {strings.admin2InputSelectButtonLabel}
                    </Button>
                )}
                {!hasValue && (
                    <Description variant="light">
                        {hasAdmin2 === false
                            ? strings.admin2InputNotAvailableMessage
                            : strings.admin2InputEmptyMessage}
                    </Description>
                )}
            </ListView>
            {hasValue && (
                <ListView spacing="xs" layoutOptions={{ wrap: true }}>
                    {value.map((admin2Id) => (
                        <ChipLayout
                            key={admin2Id}
                            label={getAdmin2Label(admin2Id)}
                            trailing={readOnly ? undefined : (
                                <IconButton
                                    name={admin2Id}
                                    onClick={handleRemove}
                                    label={strings.admin2InputRemoveLabel}
                                    ariaLabel={resolveToString(
                                        strings.admin2InputRemoveAriaLabel,
                                        { areaName: getAdmin2Label(admin2Id) },
                                    )}
                                    disabled={disabled}
                                >
                                    <CloseLineIcon />
                                </IconButton>
                            )}
                        />
                    ))}
                </ListView>
            )}
            {error && <InputError>{error}</InputError>}
            {dialog.isOpen && (
                <Dialog
                    heading={strings.admin2InputDialogHeading}
                    size="xl"
                    onClose={dialog.close}
                    footerActions={(
                        <Button
                            name={undefined}
                            onClick={dialog.close}
                            variant="primary"
                        >
                            {strings.admin2InputDoneButtonLabel}
                        </Button>
                    )}
                >
                    <BaseMap
                        baseLayers={(
                            <MapLayer
                                layerKey="admin-1-label"
                                layerOptions={adminOneLabelLayerOptions}
                            />
                        )}
                    >
                        <GoMapContainer
                            title={strings.admin2InputDialogHeading}
                            withoutDownloadButton
                        />
                        {bounds && (
                            <MapBounds
                                duration={DURATION_MAP_ZOOM}
                                padding={DEFAULT_MAP_PADDING}
                                bounds={bounds}
                            />
                        )}
                        {iso3
                            && adminTwoFillLayerOptions
                            && adminTwoLineLayerOptions
                            && adminTwoLabelLayerOptions
                            && (
                                <>
                                    <MapSource
                                        sourceKey="country-admin-2"
                                        sourceOptions={{
                                            type: 'vector',
                                            url: getAdmin2Tileset(iso3).url,
                                        }}
                                    >
                                        <MapLayer
                                            layerKey="admin-2-fill"
                                            layerOptions={adminTwoFillLayerOptions}
                                            onClick={handleAdmin2Click}
                                            hoverable
                                        />
                                        <MapLayer
                                            layerKey="admin-2-line"
                                            layerOptions={adminTwoLineLayerOptions}
                                        />
                                    </MapSource>
                                    <MapSource
                                        sourceKey="country-admin-2-labels"
                                        sourceOptions={{
                                            type: 'vector',
                                            url: getAdmin2CentroidTileset(iso3).url,
                                        }}
                                    >
                                        <MapLayer
                                            layerKey="admin-2-label"
                                            layerOptions={adminTwoLabelLayerOptions}
                                        />
                                    </MapSource>
                                </>
                            )}
                    </BaseMap>
                </Dialog>
            )}
        </ListView>
    );
}

export default Admin2Input;
