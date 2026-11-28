import { useMemo } from 'react';
import { SearchLineIcon } from '@ifrc-go/icons';
import { useTranslation } from '@ifrc-go/ui/hooks';
import {
    createDateColumn,
    createLinkColumn,
    createNumberColumn,
    createStringColumn,
    Pagination,
    Section,
    SelectInput,
    Table,
    TextInput,
} from '@ifrc-go/ui/next';
import {
    numericKeySelector,
    stringValueSelector,
} from '@ifrc-go/ui/utils';
import { isDefined } from '@togglecorp/fujs';

import { APPEAL_TYPE_DREF } from '#components/domain/ActiveOperationMap/utils';
import useRouteHref from '#hooks/domain/useRouteHref';
import useFilterState from '#hooks/useFilterState';
import {
    type GoApiResponse,
    type GoApiUrlQuery,
    useRequest,
} from '#utils/restRequest';

import i18n from './i18n.json';

type AppealQueryParams = GoApiUrlQuery<'/api/v2/appeal/'>;
type AppealResponse = GoApiResponse<'/api/v2/appeal/'>;
type AppealListItem = NonNullable<AppealResponse['results']>[number];
type Key = AppealListItem['id'];

const PAGE_SIZE = 10;
const FIRST_YEAR = 2018;
const now = new Date();
const nowIso = now.toISOString();
const yearOptions = Array.from(
    { length: now.getFullYear() - FIRST_YEAR + 1 },
    (_, i) => ({
        key: now.getFullYear() - i,
        value: String(now.getFullYear() - i),
    }),
);
const appealKeySelector = (item: AppealListItem) => item.id;

function DrefOperationsTable() {
    const strings = useTranslation(i18n);

    const {
        page,
        setPage,
        limit,
        offset,
        rawFilter,
        filter,
        setFilterField,
        resetFilter,
        rawFiltered,
    } = useFilterState<{
        search?: string,
        year?: number,
    }>({
        filter: {},
        pageSize: PAGE_SIZE,
    });

    const query = useMemo<AppealQueryParams>(
        () => ({
            limit,
            offset,
            ordering: '-start_date',
            atype: APPEAL_TYPE_DREF,
            // Default view lists ongoing operations only; picking a year
            // browses that year's operations including ended ones.
            end_date__gt: isDefined(filter.year) ? undefined : nowIso,
            search: filter.search,
            start_date__gte: isDefined(filter.year) ? `${filter.year}-01-01` : undefined,
            start_date__lt: isDefined(filter.year) ? `${filter.year + 1}-01-01` : undefined,
        }),
        [limit, offset, filter],
    );

    const {
        pending,
        response,
    } = useRequest({
        url: '/api/v2/appeal/',
        preserveResponse: true,
        query,
    });

    const getRouteHref = useRouteHref();

    const columns = useMemo(
        () => ([
            createDateColumn<AppealListItem, Key>(
                'start_date',
                strings.drefOpsStartDate,
                (item) => item.start_date,
            ),
            createStringColumn<AppealListItem, Key>(
                'code',
                strings.drefOpsCode,
                (item) => item.code,
                { width: 'sm' },
            ),
            createLinkColumn<AppealListItem, Key>(
                'operation',
                strings.drefOpsOperation,
                (item) => item.name,
                // NOTE: about half of DREF appeals have no linked emergency;
                // those show the name without a link
                (item) => (isDefined(item.event)
                    ? getRouteHref({
                        to: 'emergenciesLayout',
                        urlParams: { emergencyId: item.event },
                    })
                    : undefined),
                { stretch: true },
            ),
            createStringColumn<AppealListItem, Key>(
                'dtype',
                strings.drefOpsDisasterType,
                (item) => item.dtype?.name,
                { width: 'sm' },
            ),
            createNumberColumn<AppealListItem, Key>(
                'amount_requested',
                strings.drefOpsFunding,
                (item) => item.amount_requested,
                { width: 'sm', formatOptions: { suffix: ' CHF' } },
            ),
            createLinkColumn<AppealListItem, Key>(
                'country',
                strings.drefOpsCountry,
                (item) => item.country?.name,
                (item) => getRouteHref({
                    to: 'countriesLayout',
                    urlParams: { countryId: item.country.id },
                }),
                { width: 'sm' },
            ),
        ]),
        [
            getRouteHref,
            strings.drefOpsStartDate,
            strings.drefOpsCode,
            strings.drefOpsOperation,
            strings.drefOpsDisasterType,
            strings.drefOpsFunding,
            strings.drefOpsCountry,
        ],
    );

    return (
        <Section
            heading={strings.drefOpsHeading}
            filters={(
                <>
                    <TextInput
                        name="search"
                        ariaLabel={strings.drefOpsFilterSearchPlaceholder}
                        placeholder={strings.drefOpsFilterSearchPlaceholder}
                        type="search"
                        value={rawFilter.search}
                        onChange={setFilterField}
                        before={<SearchLineIcon />}
                    />
                    <SelectInput
                        name="year"
                        ariaLabel={strings.drefOpsFilterYearLabel}
                        placeholder={strings.drefOpsFilterAllYears}
                        value={rawFilter.year}
                        onChange={setFilterField}
                        keySelector={numericKeySelector}
                        labelSelector={stringValueSelector}
                        options={yearOptions}
                    />
                </>
            )}
            onFiltersClear={resetFilter}
            filtered={rawFiltered}
            pending={pending}
            empty={(response?.results?.length ?? 0) === 0}
            footerActions={(
                <Pagination
                    activePage={page}
                    numItems={response?.count ?? 0}
                    numItemsPerPage={limit}
                    onActivePageChange={setPage}
                />
            )}
        >
            <Table
                caption={strings.drefOpsHeading}
                columns={columns}
                keySelector={appealKeySelector}
                data={response?.results}
            />
        </Section>
    );
}

export default DrefOperationsTable;
