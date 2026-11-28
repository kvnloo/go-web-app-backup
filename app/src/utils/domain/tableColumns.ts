import {
    type ColumnOptions,
    createLinkColumn,
    createNumberColumn,
    createStringColumn,
} from '@ifrc-go/ui/next';
import { isDefined } from '@togglecorp/fujs';

import { type RouteHrefResolver } from '#hooks/domain/useRouteHref';

// NOTE: these columns hold GO records whose width is known, so they set it
// themselves; only sorting and the header explanation can be changed
type DomainColumnOptions = Pick<ColumnOptions, 'sortable' | 'defaultSortDirection' | 'info'>;

interface CountryLike {
    id: number;
    name?: string | null;
}

/** A record's title or name; takes up the free width */
export function createTitleColumn<DATUM, KEY>(
    id: string,
    title: string,
    accessor: (datum: DATUM) => string | null | undefined,
    options?: DomainColumnOptions,
) {
    return createStringColumn<DATUM, KEY>(id, title, accessor, { ...options, stretch: true });
}

/** An emergency's name, linked to its page; takes up the free width */
export function createEventColumn<DATUM, KEY>(
    id: string,
    title: string,
    nameSelector: (datum: DATUM) => string | null | undefined,
    eventIdSelector: (datum: DATUM) => number | null | undefined,
    getRouteHref: RouteHrefResolver,
    options?: DomainColumnOptions,
) {
    return createLinkColumn<DATUM, KEY>(
        id,
        title,
        nameSelector,
        (datum) => {
            const eventId = eventIdSelector(datum);
            return isDefined(eventId)
                ? getRouteHref({ to: 'emergenciesLayout', urlParams: { emergencyId: eventId } })
                : undefined;
        },
        { ...options, stretch: true },
    );
}

/** A country, linked to its page */
export function createCountryColumn<DATUM, KEY>(
    id: string,
    title: string,
    countrySelector: (datum: DATUM) => CountryLike | null | undefined,
    getRouteHref: RouteHrefResolver,
    options?: DomainColumnOptions,
) {
    return createLinkColumn<DATUM, KEY>(
        id,
        title,
        (datum) => countrySelector(datum)?.name,
        (datum) => {
            const country = countrySelector(datum);
            return isDefined(country)
                ? getRouteHref({ to: 'countriesLayout', urlParams: { countryId: country.id } })
                : undefined;
        },
        { ...options, width: 'sm' },
    );
}

/** An appeal code; with `emergencyLink` it links to the appeal's emergency */
export function createAppealCodeColumn<DATUM, KEY>(
    id: string,
    title: string,
    accessor: (datum: DATUM) => string | null | undefined,
    emergencyLink?: {
        eventIdSelector: (datum: DATUM) => number | null | undefined;
        getRouteHref: RouteHrefResolver;
    },
    options?: DomainColumnOptions,
) {
    if (!emergencyLink) {
        return createStringColumn<DATUM, KEY>(id, title, accessor, { ...options, width: 'sm' });
    }

    const { eventIdSelector, getRouteHref } = emergencyLink;
    return createLinkColumn<DATUM, KEY>(
        id,
        title,
        accessor,
        (datum) => {
            const eventId = eventIdSelector(datum);
            return isDefined(eventId)
                ? getRouteHref({ to: 'emergenciesLayout', urlParams: { emergencyId: eventId } })
                : undefined;
        },
        { ...options, width: 'sm' },
    );
}

export function createDisasterTypeColumn<DATUM, KEY>(
    id: string,
    title: string,
    accessor: (datum: DATUM) => string | null | undefined,
    options?: DomainColumnOptions,
) {
    return createStringColumn<DATUM, KEY>(id, title, accessor, { ...options, width: 'sm' });
}

/** An amount in Swiss francs, such as a budget or the funding requested */
export function createBudgetColumn<DATUM, KEY>(
    id: string,
    title: string,
    accessor: (datum: DATUM) => number | null | undefined,
    options?: DomainColumnOptions,
) {
    return createNumberColumn<DATUM, KEY>(
        id,
        title,
        accessor,
        { ...options, width: 'sm', formatOptions: { suffix: ' CHF' } },
    );
}
