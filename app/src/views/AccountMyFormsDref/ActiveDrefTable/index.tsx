import {
    useCallback,
    useMemo,
    useState,
} from 'react';
import { type Language } from '@ifrc-go/ui/contexts';
import { useTranslation } from '@ifrc-go/ui/hooks';
import {
    createActionColumn,
    createDateColumn,
    createStringColumn,
    DataDisplay,
    DataDisplayList,
    Section,
    Table,
} from '@ifrc-go/ui/next';
import {
    isDefined,
    isNotDefined,
    listToMap,
} from '@togglecorp/fujs';

import useGlobalEnums from '#hooks/domain/useGlobalEnums';
import useRouteHref from '#hooks/domain/useRouteHref';
import useUserMe from '#hooks/domain/useUserMe';
import useFilterState from '#hooks/useFilterState';
import {
    DREF_STATUS_APPROVED,
    DREF_STATUS_DRAFT,
    DREF_STATUS_FAILED,
    DREF_STATUS_FINALIZED,
    DREF_STATUS_FINALIZING,
    DREF_TYPE_LOAN,
    type TypeOfDrefEnum,
} from '#utils/constants';
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

function ActiveDrefTable(props: Props) {
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

    const { dref_dref_status: drefStatus } = useGlobalEnums();

    const {
        response: activeDrefResponse,
        pending: activeDrefResponsePending,
        retrigger: refetchActiveDref,
    } = useRequest({
        url: '/api/v2/active-dref/',
        preserveResponse: true,
        query: {
            offset,
            limit,
            // FIXME server should accept country
            country: isDefined(filter.country) ? [filter.country] : undefined,
            type_of_dref: isDefined(filter.type_of_dref) ? [filter.type_of_dref] : undefined,
            disaster_type: filter.disaster_type,
            appeal_code: filter.appeal_code,
        },
        shouldPoll: (res) => {
            if (res.errored) {
                return -1;
            }

            const hasFinalizingStatus = res.value.results.some(
                (item) => item.status === DREF_STATUS_FINALIZING,
            );

            if (!hasFinalizingStatus) {
                return -1;
            }

            return 3000;
        },
    });

    const userMe = useUserMe();
    const userRegionCoordinatorMap = useMemo(
        () => {
            if (
                isNotDefined(userMe)
                || isNotDefined(userMe.is_dref_coordinator_for_regions)
                || userMe.is_dref_coordinator_for_regions.length === 0
            ) {
                return undefined;
            }

            return listToMap(
                userMe.is_dref_coordinator_for_regions,
                (region) => region,
                () => true,
            );
        },
        [userMe],
    );

    type DrefItem = NonNullable<NonNullable<typeof activeDrefResponse>['results']>[number];
    type Key = string;

    const getLatestStageOfDref = useCallback(
        (dref: DrefItem) => {
            const {
                final_report_details,
                operational_update_details,
                has_ops_update,
                has_final_report,
            } = dref;

            if (has_final_report) {
                return final_report_details;
            }

            // NOTE: server drops operational_update_details for users without
            // region admin access, even when has_ops_update is true
            const latestOpsUpdate = operational_update_details?.[0];
            if (has_ops_update && isDefined(latestOpsUpdate)) {
                return latestOpsUpdate;
            }

            return dref;
        },
        [],
    );

    const latestDrefs = useMemo(
        () => activeDrefResponse?.results?.map(getLatestStageOfDref),
        [activeDrefResponse, getLatestStageOfDref],
    );

    type LatestDref = NonNullable<typeof latestDrefs>[number];

    const latestDrefToOriginalMap = useMemo(
        () => listToMap(
            activeDrefResponse?.results ?? [],
            (dref) => getStageKey(getLatestStageOfDref(dref)),
        ),
        [activeDrefResponse, getLatestStageOfDref],
    );

    const [expandedKeys, setExpandedKeys] = useState<Key[]>([]);

    const statusDescription = useMemo(() => {
        if (isNotDefined(drefStatus)) {
            return undefined;
        }

        const statusMap = listToMap(
            drefStatus,
            (item) => item.key,
            (item) => item.value,
        );

        return [
            {
                key: DREF_STATUS_DRAFT,
                status: statusMap[DREF_STATUS_DRAFT],
                description: strings.activeDrefTableStatusDraftDescription,
            },
            {
                key: DREF_STATUS_FINALIZING,
                status: statusMap[DREF_STATUS_FINALIZING],
                description: strings.activeDrefTableStatusFinalizingDescription,
            },
            {
                key: DREF_STATUS_FINALIZED,
                status: statusMap[DREF_STATUS_FINALIZED],
                description: strings.activeDrefTableStatusFinalizedDescription,
            },
            {
                key: DREF_STATUS_APPROVED,
                status: statusMap[DREF_STATUS_APPROVED],
                description: strings.activeDrefTableStatusApprovedDescription,
            },
            {
                key: DREF_STATUS_FAILED,
                status: statusMap[DREF_STATUS_FAILED],
                description: strings.activeDrefTableStatusFailedDescription,
            },
        ];
    }, [
        drefStatus,
        strings.activeDrefTableStatusDraftDescription,
        strings.activeDrefTableStatusFinalizingDescription,
        strings.activeDrefTableStatusFinalizedDescription,
        strings.activeDrefTableStatusApprovedDescription,
        strings.activeDrefTableStatusFailedDescription,
    ]);

    const getRouteHref = useRouteHref();

    const columns = useMemo(
        () => ([
            createDateColumn<LatestDref, Key>(
                'created_at',
                strings.activeDrefTableCreatedHeading,
                (item) => item.created_at,
            ),
            // NOTE: the event lives on the original DREF, not on its stages;
            // drafts have none
            createAppealCodeColumn<LatestDref, Key>(
                'appeal_code',
                strings.activeDrefTableAppealCodeHeading,
                (item) => item.appeal_code,
                {
                    eventIdSelector: (item) => (
                        latestDrefToOriginalMap[getStageKey(item)]?.event
                    ),
                    getRouteHref,
                },
            ),
            createTitleColumn<LatestDref, Key>(
                'title',
                strings.activeDrefTableTitleHeading,
                (item) => item.title,
            ),
            createStringColumn<LatestDref, Key>(
                'type',
                strings.activeDrefTableStageHeading,
                (item) => item.application_type_display,
                { width: 'xs' },
            ),
            createCountryColumn<LatestDref, Key>(
                'country',
                strings.activeDrefTableCountryHeading,
                (item) => item.country_details,
                getRouteHref,
            ),
            createStringColumn<LatestDref, Key>(
                'type_of_dref',
                strings.activeDrefTableTypeOfDrefHeading,
                (item) => item.type_of_dref_display,
                { width: 'xs' },
            ),
            createStringColumn<LatestDref, Key>(
                'status',
                strings.activeDrefTableStatusHeading,
                (item) => item.status_display,
                {
                    width: 'xs',
                    info: (
                        <DataDisplayList>
                            {statusDescription?.map((status) => (
                                <DataDisplay
                                    key={status.key}
                                    label={status.status}
                                    value={status.description}
                                    layout="block"
                                    withoutLabelColon
                                />
                            ))}
                        </DataDisplayList>
                    ),
                },
            ),
            createActionColumn<LatestDref, Key, DrefTableActionsProps>('actions', {
                renderer: DrefTableActions,
                rendererParams: (key, item) => {
                    const { id } = item;
                    const originalDref = latestDrefToOriginalMap[key];
                    // FIXME: fix typing in server (medium priority)
                    // the application_type should be an enum
                    const applicationType = item.application_type as 'DREF' | 'OPS_UPDATE' | 'FINAL_REPORT';
                    const drefType = item.type_of_dref as TypeOfDrefEnum;
                    if (!originalDref) {
                        return {
                            id,
                            drefId: id,
                            drefType,
                            status: item.status,
                            applicationType,
                            // NOTE: Sub-rows only, never final reports
                            isDrefImminentV2: false,
                            canAddOpsUpdate: false,
                            canCreateFinalReport: false,
                            hasPermissionToApprove: false,
                        };
                    }

                    const {
                        unpublished_op_update_count,
                        status,
                        has_ops_update,
                        has_final_report,
                        country_details,
                        is_dref_imminent_v2,
                        starting_language,
                        country,
                        event,
                    } = originalDref;

                    const is_published = status === DREF_STATUS_APPROVED;

                    const canAddOpsUpdate = (is_published ?? false)
                        && (applicationType === 'DREF' || applicationType === 'OPS_UPDATE')
                        && !has_final_report
                        && unpublished_op_update_count === 0;

                    const canCreateFinalReport = !has_final_report
                        && (applicationType === 'DREF' || applicationType === 'OPS_UPDATE')
                        && (is_published ?? false)
                        && (item.type_of_dref !== DREF_TYPE_LOAN)
                        && (
                            !has_ops_update
                            || (has_ops_update && unpublished_op_update_count === 0)
                        );

                    const drefRegion = country_details?.region;
                    const isRegionCoordinator = isDefined(drefRegion)
                        ? userRegionCoordinatorMap?.[drefRegion] ?? false
                        : false;

                    const countryId = isDefined(country) ? country : undefined;

                    return {
                        id,
                        drefId: originalDref.id,
                        drefType,
                        status: item.status,
                        isDrefImminentV2: is_dref_imminent_v2 ?? false,
                        applicationType,
                        canAddOpsUpdate,
                        canCreateFinalReport,
                        hasPermissionToApprove: isRegionCoordinator || userMe?.is_superuser,
                        onPublishSuccess: refetchActiveDref,
                        startingLanguage: starting_language as Language,
                        countryId,
                        event,
                    };
                },
            }),
        ]),
        [
            strings.activeDrefTableCreatedHeading,
            strings.activeDrefTableAppealCodeHeading,
            strings.activeDrefTableTitleHeading,
            strings.activeDrefTableStageHeading,
            strings.activeDrefTableCountryHeading,
            strings.activeDrefTableTypeOfDrefHeading,
            strings.activeDrefTableStatusHeading,
            getRouteHref,
            latestDrefToOriginalMap,
            userMe,
            userRegionCoordinatorMap,
            refetchActiveDref,
            statusDescription,
        ],
    );

    // NOTE: the latest stage is the row itself; final_report_details is null
    // until a final report exists
    const getSubRows = (row: LatestDref): LatestDref[] | undefined => {
        const originalDref = latestDrefToOriginalMap[getStageKey(row)];
        if (isNotDefined(originalDref)) {
            return undefined;
        }

        return [
            originalDref.final_report_details,
            ...(originalDref.operational_update_details ?? []),
            originalDref,
        ].filter(isDefined).slice(1);
    };

    return (
        <Section
            heading={strings.activeDrefTitle}
            actions={actions}
            filters={(
                <Filters
                    value={rawFilter}
                    onChange={setFilterField}
                />
            )}
            list={{
                state: filterState,
                response: activeDrefResponse,
                pending: activeDrefResponsePending,
            }}
        >
            <Table
                caption={strings.activeDrefTitle}
                data={latestDrefs}
                columns={columns}
                keySelector={getStageKey}
                getSubRows={getSubRows}
                expandedKeys={expandedKeys}
                onExpandedKeysChange={setExpandedKeys}
            />
        </Section>
    );
}

export default ActiveDrefTable;
