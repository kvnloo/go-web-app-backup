import {
    useMemo,
    useState,
} from 'react';
import { useTranslation } from '@ifrc-go/ui/hooks';
import {
    createActionColumn,
    createDateColumn,
    createStringColumn,
    Section,
    Table,
} from '@ifrc-go/ui/next';
import { isDefined } from '@togglecorp/fujs';

import useRouteHref from '#hooks/domain/useRouteHref';
import useFilterState from '#hooks/useFilterState';
import { type TypeOfDrefEnum } from '#utils/constants';
import {
    createAppealCodeColumn,
    createCountryColumn,
    createTitleColumn,
} from '#utils/domain/tableColumns';
import { useRequest } from '#utils/restRequest';

import DrefTableActions, { type Props as DrefTableActionsProps } from '../DrefTableActions';
import Filters, { type FilterValue } from '../Filters';
import { getStageKey } from '../utils';

import i18n from './i18n.json';

const NUM_ITEMS_PER_PAGE = 10;

interface Props {
    actions?: React.ReactNode;
}

function CompletedDrefTable(props: Props) {
    const { actions } = props;

    const strings = useTranslation(i18n);
    const filterState = useFilterState<FilterValue>({
        filter: {},
        pageSize: NUM_ITEMS_PER_PAGE,
    });
    const {
        rawFilter,
        filter,
        setFilterField,
        limit,
        offset,
    } = filterState;

    const {
        response: completedDrefResponse,
        pending: completedDrefResponsePending,
    } = useRequest({
        url: '/api/v2/completed-dref/',
        query: {
            offset,
            limit,
            // FIXME server should accept country
            country: isDefined(filter.country) ? [filter.country] : undefined,
            type_of_dref: isDefined(filter.type_of_dref) ? [filter.type_of_dref] : undefined,
            disaster_type: filter.disaster_type,
            appeal_code: filter.appeal_code,
        },
    });

    type DrefResultItem = NonNullable<NonNullable<typeof completedDrefResponse>['results']>[number] & { drefType?: TypeOfDrefEnum | null | undefined };
    type Key = string;

    const [expandedKeys, setExpandedKeys] = useState<Key[]>([]);
    const getRouteHref = useRouteHref();

    const columns = useMemo(
        () => ([
            createDateColumn<DrefResultItem, Key>(
                'created_at',
                strings.completedDrefTableCreatedHeading,
                (item) => item.created_at,
            ),
            createAppealCodeColumn<DrefResultItem, Key>(
                'appeal_code',
                strings.completedDrefTableAppealCodeHeading,
                (item) => item.appeal_code,
                {
                    eventIdSelector: (item) => item.dref.event,
                    getRouteHref,
                },
            ),
            createTitleColumn<DrefResultItem, Key>(
                'title',
                strings.completedDrefTableTitleHeading,
                (item) => item.title,
            ),
            createStringColumn<DrefResultItem, Key>(
                'type',
                strings.completedDrefTableStageHeading,
                (item) => item.application_type_display,
                { width: 'xs' },
            ),
            createCountryColumn<DrefResultItem, Key>(
                'country',
                strings.completedDrefTableCountryHeading,
                (item) => item.country_details,
                getRouteHref,
            ),
            createStringColumn<DrefResultItem, Key>(
                'status',
                strings.completedDrefTableStatusHeading,
                (item) => item.status_display,
                { width: 'xs' },
            ),
            createActionColumn<DrefResultItem, Key, DrefTableActionsProps>('actions', {
                renderer: DrefTableActions,
                rendererParams: (_, item) => ({
                    id: item.id,
                    drefId: item.dref.id,
                    status: item.status,
                    // NOTE: drefType is only set on the expanded sub-rows
                    drefType: item.drefType ?? item.dref.type_of_dref,
                    // FIXME: fix typing in server (medium priority)
                    // the application_type should be an enum
                    applicationType: item.application_type as 'DREF' | 'OPS_UPDATE' | 'FINAL_REPORT',
                    isDrefImminentV2: item.dref.is_dref_imminent_v2 ?? false,
                    canAddOpsUpdate: false,
                    canCreateFinalReport: false,
                }),
            }),
        ]),
        [
            getRouteHref,
            strings.completedDrefTableCreatedHeading,
            strings.completedDrefTableAppealCodeHeading,
            strings.completedDrefTableTitleHeading,
            strings.completedDrefTableStageHeading,
            strings.completedDrefTableCountryHeading,
            strings.completedDrefTableStatusHeading,
        ],
    );

    const getSubRows = (row: DrefResultItem): DrefResultItem[] => {
        const opsUpdateList = row.dref.operational_update_details ?? [];

        return [
            ...opsUpdateList.map((opsUpdate) => ({
                ...opsUpdate,
                dref: row.dref,
                glide_codes: row.glide_codes,
                date_of_publication: row.date_of_publication,
                starting_language: row.starting_language,
            })),
            {
                ...row.dref,
                dref: row.dref,
                drefType: row.dref.type_of_dref,
                glide_codes: row.glide_codes,
                date_of_publication: row.date_of_publication,
            },
        ];
    };

    return (
        <Section
            heading={strings.completedDrefTitle}
            actions={actions}
            filters={(
                <Filters
                    value={rawFilter}
                    onChange={setFilterField}
                />
            )}
            list={{
                state: filterState,
                response: completedDrefResponse,
                pending: completedDrefResponsePending,
            }}
        >
            <Table
                caption={strings.completedDrefTitle}
                data={completedDrefResponse?.results}
                columns={columns}
                keySelector={getStageKey}
                getSubRows={getSubRows}
                expandedKeys={expandedKeys}
                onExpandedKeysChange={setExpandedKeys}
            />
        </Section>
    );
}

export default CompletedDrefTable;
