import {
    useCallback,
    useMemo,
    useState,
} from 'react';
import {
    AddLineIcon,
    CaseManagementIcon,
    CheckLineIcon,
    DocumentPdfLineIcon,
    DownloadLineIcon,
    PencilLineIcon,
    ShareLineIcon,
} from '@ifrc-go/icons';
import { type Language } from '@ifrc-go/ui/contexts';
import { useTranslation } from '@ifrc-go/ui/hooks';
import {
    Button,
    Description,
    Dialog,
    Message,
    RadioInput,
    TableActions,
    Text,
    useDialogState,
} from '@ifrc-go/ui/next';
import {
    resolveToComponent,
    resolveToString,
    stringDescriptionSelector,
    stringKeySelector,
    stringLabelSelector,
} from '@ifrc-go/ui/utils';
import {
    isDefined,
    isNotDefined,
    unique,
} from '@togglecorp/fujs';

import DrefExportModal from '#components/domain/DrefExportModal';
import DrefShareModal from '#components/domain/DrefShareModal';
import EventSearchSelectInput, { type EventItem as EventSearchItem } from '#components/domain/EventSearchSelectInput';
import Link from '#components/next/Link';
import MenuItem from '#components/next/MenuItem';
import useAlert from '#hooks/useAlert';
import useInputState from '#hooks/useInputState';
import useRouting from '#hooks/useRouting';
import { languageNameMap } from '#utils/common';
import {
    DREF_STATUS_DRAFT,
    DREF_STATUS_FAILED,
    DREF_STATUS_FINALIZED,
    DREF_TYPE_IMMINENT,
    DREF_TYPE_LOAN,
    type DrefStatus,
    type TypeOfDrefEnum,
} from '#utils/constants';
import {
    type GoApiBody,
    useLazyRequest,
    useRequest,
} from '#utils/restRequest';

import { exportDrefAllocation } from './drefAllocationExport';

import i18n from './i18n.json';

const LINK_EMERGENCY_CREATE_NEW = 'create-new';
const LINK_EMERGENCY_SELECT_EXISTING = 'select-existing';

type SelectLanguageOption = {
    key: Language,
    label: string,
}

type DrefPublishRequestPostBody = GoApiBody<'/api/v2/dref/{id}/approve/', 'POST'>;
type OpsUpdateRequestBody = GoApiBody<'/api/v2/dref-op-update/', 'POST'>;

function selectLanguageKeySelector(option: SelectLanguageOption) {
    return option.key;
}

export interface Props {
    drefId: number;
    id: number;
    status: DrefStatus | null | undefined;
    countryId?: number | undefined;
    event?: number | null | undefined;

    applicationType: 'DREF' | 'OPS_UPDATE' | 'FINAL_REPORT';
    canAddOpsUpdate: boolean;
    canCreateFinalReport: boolean;
    hasPermissionToApprove?: boolean;
    isDrefImminentV2: boolean;
    startingLanguage?: Language;

    onPublishSuccess?: () => void;
    drefType?: TypeOfDrefEnum | null | undefined;
}

function DrefTableActions(props: Props) {
    const {
        id,
        drefId: drefIdFromProps,
        status,
        countryId,
        applicationType,
        canAddOpsUpdate,
        canCreateFinalReport,
        hasPermissionToApprove,
        isDrefImminentV2,
        onPublishSuccess,
        drefType,
        startingLanguage,
        event,
    } = props;

    const [eventValue, setEventValue] = useInputState<number | undefined | null>(event);
    const [eventOptions, setEventOptions] = useState<
        EventSearchItem[] | undefined | null
    >([]);
    const [selectOpsLanguage, setSelectOpsLanguage] = useState<Language | undefined>();
    const [selectFinalLanguage, setSelectFinalLanguage] = useState<Language | undefined>();

    const { navigate } = useRouting();
    const alert = useAlert();
    const strings = useTranslation(i18n);

    const selectLanguageOptions: SelectLanguageOption[] | undefined = useMemo(() => {
        if (isNotDefined(startingLanguage)) {
            return undefined;
        }
        return [
            {
                key: startingLanguage,
                label: `${languageNameMap[startingLanguage]} (${strings.drefOpsUpdateStartingLanguageLabel})`,
            },
            { key: 'en', label: languageNameMap.en },
        ];
    }, [startingLanguage, strings.drefOpsUpdateStartingLanguageLabel]);

    const linkEmergencyOptions = useMemo(() => ([
        {
            key: LINK_EMERGENCY_CREATE_NEW,
            label: strings.linkEmergencyCreateNewLabel,
            description: strings.linkEmergencyCreateNewDescription,
        },
        {
            key: LINK_EMERGENCY_SELECT_EXISTING,
            label: strings.linkEmergencySelectExistingLabel,
            description: null,
        },
    ]), [
        strings.linkEmergencyCreateNewLabel,
        strings.linkEmergencyCreateNewDescription,
        strings.linkEmergencySelectExistingLabel,
    ]);

    const [linkEmergencyValue, setLinkEmergencyValue] = useState<string | undefined>();

    // the picked emergency stays in state otherwise, and still gets linked
    const handleLinkEmergencyChange = useCallback((newValue: string | undefined) => {
        setLinkEmergencyValue(newValue);
        if (newValue !== LINK_EMERGENCY_SELECT_EXISTING) {
            setEventValue(undefined);
        }
    }, [setEventValue]);

    const exportDialog = useDialogState();
    const shareDialog = useDialogState();
    const approvalDialog = useDialogState();
    const opsUpdateDialog = useDialogState();
    const finalReportDialog = useDialogState();

    useRequest({
        skip: !approvalDialog.isOpen || isNotDefined(eventValue),
        url: '/api/v2/event/mini/',
        query: {
            id: isDefined(eventValue) ? eventValue : undefined,
        },
        onSuccess: (response) => {
            setEventOptions(
                (oldOptions) => unique(
                    [...(oldOptions ?? []), ...response.results],
                    (option) => option.id,
                ),
            );
        },
    });

    const {
        trigger: fetchDref,
        pending: fetchingDref,
    } = useLazyRequest({
        url: '/api/v2/dref/{id}/',
        pathVariables: (ctx: number) => (
            isDefined(ctx) ? {
                id: String(ctx),
            } : undefined
        ),
        onSuccess: (response) => {
            const exportData = {
                allocationFor: response?.type_of_dref === DREF_TYPE_LOAN
                    ? strings.drefAllocationForEmergencyAppeal
                    : strings.drefAllocationForDrefOperation,
                appealManager: response?.ifrc_appeal_manager_name,
                projectManager: response?.ifrc_project_manager_name,
                affectedCountry: response?.country_details?.name,
                name: response?.title,
                disasterType: response?.disaster_type_details?.name,
                responseType: response?.type_of_dref === DREF_TYPE_IMMINENT
                    ? strings.drefResponseTypeImminentCrisis
                    : response?.type_of_onset_display,
                noOfPeopleTargeted: response?.num_assisted,
                nsRequestDate: response?.ns_request_date,
                disasterStartDate: response?.event_date,
                implementationPeriod: response?.type_of_dref === DREF_TYPE_IMMINENT
                    ? resolveToString(
                        strings.drefImplementationPeriodDays,
                        { count: response.operation_timeframe_imminent },
                    )
                    : resolveToString(
                        strings.drefImplementationPeriodMonths,
                        { count: response?.operation_timeframe },
                    ),
                totalDREFAllocation: response?.amount_requested,
                previousAllocation: undefined,
                allocationRequested: response.type_of_dref === DREF_TYPE_IMMINENT
                    ? response.total_cost : response?.amount_requested,
                toBeAllocatedFrom: response?.type_of_dref === DREF_TYPE_IMMINENT
                    ? strings.drefAllocatedFromAnticipatoryPillar
                    : strings.drefAllocatedFromResponsePillar,
                focalPointName: response?.regional_focal_point_name,
            };
            exportDrefAllocation(exportData);
        },
    });

    const {
        trigger: fetchOpsUpdate,
        pending: fetchingOpsUpdate,
    } = useLazyRequest({
        url: '/api/v2/dref-op-update/{id}/',
        pathVariables: (ctx: number) => (
            isDefined(ctx) ? {
                id: String(ctx),
            } : undefined
        ),
        onSuccess: (response) => {
            const exportData = {
                allocationFor: response?.type_of_dref === DREF_TYPE_LOAN
                    ? strings.drefAllocationForEmergencyAppeal
                    : strings.drefAllocationForDrefOperation,
                appealManager: response?.ifrc_appeal_manager_name,
                projectManager: response?.ifrc_project_manager_name,
                affectedCountry: response?.country_details?.name,
                name: response?.title,
                disasterType: response?.disaster_type_details?.name,
                responseType: response?.type_of_dref === DREF_TYPE_IMMINENT
                    ? strings.drefResponseTypeImminentCrisis
                    : response?.type_of_onset_display,
                nsRequestDate: response?.ns_request_date,
                disasterStartDate: response?.event_date,
                implementationPeriod: resolveToString(
                    strings.drefImplementationPeriodMonths,
                    { count: response?.total_operation_timeframe },
                ),
                allocationRequested: response?.additional_allocation,
                previousAllocation: response?.dref_allocated_so_far ?? 0,
                totalDREFAllocation: response?.total_dref_allocation,
                noOfPeopleTargeted: response?.number_of_people_targeted,
                toBeAllocatedFrom: response?.type_of_dref === DREF_TYPE_IMMINENT
                    ? strings.drefAllocatedFromAnticipatoryPillar
                    : strings.drefAllocatedFromResponsePillar,
                focalPointName: response?.regional_focal_point_name,
            };
            exportDrefAllocation(exportData);
        },
    });

    const {
        trigger: publishDref,
        pending: publishDrefPending,
    } = useLazyRequest({
        method: 'POST',
        url: '/api/v2/dref/{id}/approve/',
        pathVariables: { id: String(id) },
        // FIXME: typings should be fixed in the server
        body: (publishBody: DrefPublishRequestPostBody) => publishBody,
        onSuccess: () => {
            alert.show(
                strings.drefApprovalSuccessTitle,
                { variant: 'success' },
            );
            approvalDialog.close();
            if (onPublishSuccess) {
                onPublishSuccess();
            }
        },
        onFailure: ({
            value: { messageForNotification },
        }) => {
            alert.show(
                strings.drefApprovalFailureTitle,
                {
                    description: messageForNotification,
                    variant: 'danger',
                },
            );
        },
    });

    const handlePublishDref = useCallback(() => {
        // event already selected in the application form
        if (isDefined(event)) {
            publishDref({ event });
            return;
        }

        const eventToLink = linkEmergencyValue === LINK_EMERGENCY_SELECT_EXISTING
            ? eventValue
            : undefined;

        publishDref({ event: eventToLink });
    }, [publishDref, eventValue, event, linkEmergencyValue]);

    const {
        trigger: publishOpsUpdate,
        pending: publishOpsUpdatePending,
    } = useLazyRequest({
        method: 'POST',
        url: '/api/v2/dref-op-update/{id}/approve/',
        pathVariables: { id: String(id) },
        // FIXME: typings should be fixed in the server
        body: () => ({} as never),
        onSuccess: () => {
            alert.show(
                strings.drefApprovalSuccessTitle,
                { variant: 'success' },
            );
            if (onPublishSuccess) {
                onPublishSuccess();
            }
        },
        onFailure: ({
            value: { messageForNotification },
        }) => {
            alert.show(
                strings.drefApprovalFailureTitle,
                {
                    description: messageForNotification,
                    variant: 'danger',
                },
            );
        },
    });

    const {
        trigger: publishFinalReport,
        pending: publishFinalReportPending,
    } = useLazyRequest({
        method: 'POST',
        url: '/api/v2/dref-final-report/{id}/approve/',
        pathVariables: { id: String(id) },
        // FIXME: typings should be fixed in the server
        body: () => ({} as never),
        onSuccess: () => {
            alert.show(
                strings.drefApprovalSuccessTitle,
                { variant: 'success' },
            );
            if (onPublishSuccess) {
                onPublishSuccess();
            }
        },
        onFailure: ({
            value: { messageForNotification },
        }) => {
            alert.show(
                strings.drefApprovalFailureTitle,
                {
                    description: messageForNotification,
                    variant: 'danger',
                },
            );
        },
    });

    const {
        trigger: finalizeDref,
        pending: finalizeDrefPending,
    } = useLazyRequest({
        method: 'POST',
        url: '/api/v2/dref/{id}/finalize/',
        pathVariables: { id: String(id) },
        body: () => ({} as never),
        onSuccess: () => {
            alert.show(
                strings.drefFinalizeSuccessTitle,
                { variant: 'success' },
            );
            if (onPublishSuccess) {
                onPublishSuccess();
            }
        },
        onFailure: ({
            value: { messageForNotification },
        }) => {
            alert.show(
                strings.drefFinalizeFailureTitle,
                {
                    description: messageForNotification,
                    variant: 'danger',
                },
            );
        },
    });

    const {
        trigger: finalizeOpsUpdate,
        pending: finalizeOpsUpdatePending,
    } = useLazyRequest({
        method: 'POST',
        url: '/api/v2/dref-op-update/{id}/finalize/',
        pathVariables: { id: String(id) },
        body: () => ({} as never),
        onSuccess: () => {
            alert.show(
                strings.drefFinalizeSuccessTitle,
                { variant: 'success' },
            );
            if (onPublishSuccess) {
                onPublishSuccess();
            }
        },
        onFailure: ({
            value: { messageForNotification },
        }) => {
            alert.show(
                strings.drefFinalizeFailureTitle,
                {
                    description: messageForNotification,
                    variant: 'danger',
                },
            );
        },
    });

    const {
        trigger: finalizeFinalReport,
        pending: finalizeFinalReportPending,
    } = useLazyRequest({
        method: 'POST',
        url: '/api/v2/dref-final-report/{id}/finalize/',
        pathVariables: { id: String(id) },
        body: () => ({} as never),
        onSuccess: () => {
            alert.show(
                strings.drefFinalizeSuccessTitle,
                { variant: 'success' },
            );
            if (onPublishSuccess) {
                onPublishSuccess();
            }
        },
        onFailure: ({
            value: { messageForNotification },
        }) => {
            alert.show(
                strings.drefFinalizeFailureTitle,
                {
                    description: messageForNotification,
                    variant: 'danger',
                },
            );
        },
    });

    const {
        trigger: createOpsUpdate,
        pending: createOpsUpdatePending,
    } = useLazyRequest({
        method: 'POST',
        url: '/api/v2/dref-op-update/',
        // FIXME: the type should be fixed on the server
        body: (
            drefId: number,
        ) => ({
            dref: drefId,
            starting_language: startingLanguage === 'en' ? startingLanguage : selectOpsLanguage,
        } as unknown as OpsUpdateRequestBody),
        enforceLanguageForMutation: selectOpsLanguage,
        onSuccess: (response) => {
            navigate(
                'drefOperationalUpdateForm',
                { params: { opsUpdateId: response.id } },
                { state: { isNewOpsUpdate: true } },
            );
        },
        onFailure: ({
            value: { messageForNotification },
        }) => {
            alert.show(
                strings.drefAccountCouldNotCreate,
                {
                    description: messageForNotification,
                    variant: 'danger',
                },
            );
        },
    });

    // FIXME: the type should be fixed on the server
    type FinalReportRequestBody = GoApiBody<'/api/v2/dref-final-report/', 'POST'>;
    const {
        trigger: createFinalReport,
        pending: createFinalReportPending,
    } = useLazyRequest({
        method: 'POST',
        url: '/api/v2/dref-final-report/',
        enforceLanguageForMutation: selectFinalLanguage,
        // FIXME: the type should be fixed on the server
        body: (
            drefId: number,
        ) => ({
            dref: drefId,
            starting_language: startingLanguage === 'en' ? startingLanguage : selectFinalLanguage,
        } as FinalReportRequestBody),
        onSuccess: (response) => {
            navigate(
                isDrefImminentV2 ? 'drefFinalReportForm' : 'oldDrefFinalReportForm',
                { params: { finalReportId: response.id } },
            );
        },
        onFailure: ({
            value: { messageForNotification },
        }) => {
            alert.show(
                strings.drefAccountCouldNotCreateFinalReport,
                {
                    description: messageForNotification,
                    variant: 'danger',
                },
            );
        },
    });

    const handleAddOpsUpdate = useCallback(
        () => {
            createOpsUpdate(drefIdFromProps);
        },
        [drefIdFromProps, createOpsUpdate],
    );

    const handleAddFinalReport = useCallback(
        () => {
            createFinalReport(drefIdFromProps);
        },
        [drefIdFromProps, createFinalReport],
    );

    const handlePublishClick = useCallback(
        () => {
            if (applicationType === 'OPS_UPDATE') {
                publishOpsUpdate(null);
            }

            if (applicationType === 'FINAL_REPORT') {
                publishFinalReport(null);
            }
        },
        [
            applicationType,
            publishOpsUpdate,
            publishFinalReport,
        ],
    );

    const handleFinalizeClick = useCallback(
        () => {
            if (applicationType === 'DREF') {
                finalizeDref(null);
            } else if (applicationType === 'OPS_UPDATE') {
                finalizeOpsUpdate(null);
            } else if (applicationType === 'FINAL_REPORT') {
                finalizeFinalReport(null);
            } else {
                applicationType satisfies never;
            }
        },
        [
            applicationType,
            finalizeDref,
            finalizeOpsUpdate,
            finalizeFinalReport,
        ],
    );

    const handleDrefAllocationExport = useCallback(
        () => {
            if (applicationType === 'DREF') {
                fetchDref(id);
            } else if (applicationType === 'OPS_UPDATE') {
                fetchOpsUpdate(id);
            }
        },
        [fetchDref, fetchOpsUpdate, applicationType, id],
    );

    const drefApprovalPending = publishDrefPending
        || publishOpsUpdatePending
        || publishFinalReportPending;

    const canDownloadAllocation = (applicationType === 'DREF' || applicationType === 'OPS_UPDATE');

    const canApprove = status === DREF_STATUS_FINALIZED && hasPermissionToApprove;

    const canFinalize = (status === DREF_STATUS_DRAFT
        || status === DREF_STATUS_FAILED)
        && hasPermissionToApprove;

    const shouldConfirmImminentAddOpsUpdate = drefType === DREF_TYPE_IMMINENT && isDrefImminentV2;

    const disabled = fetchingDref
        || fetchingOpsUpdate
        || publishDrefPending
        || finalizeDrefPending
        || finalizeOpsUpdatePending
        || finalizeFinalReportPending
        || publishOpsUpdatePending
        || publishFinalReportPending
        || createOpsUpdatePending
        || createFinalReportPending;

    const canEdit = status === DREF_STATUS_DRAFT || status === DREF_STATUS_FINALIZED;

    const editLinks = {
        DREF: { to: 'drefApplicationForm', urlParams: { drefId: id } },
        OPS_UPDATE: { to: 'drefOperationalUpdateForm', urlParams: { opsUpdateId: id } },
        FINAL_REPORT: {
            to: isDrefImminentV2 ? 'drefFinalReportForm' : 'oldDrefFinalReportForm',
            urlParams: { finalReportId: id },
        },
    } as const;
    const editLink = editLinks[applicationType];

    const linkedEventName = eventOptions?.find((option) => option.id === event)?.name;

    const approveDisabled = disabled
        || (isNotDefined(event)
            && (isNotDefined(linkEmergencyValue)
                || (linkEmergencyValue === LINK_EMERGENCY_SELECT_EXISTING
                    && isNotDefined(eventValue))));

    return (
        <>
            <TableActions
                actions={canEdit && (
                    <Link
                        to={editLink.to}
                        urlParams={editLink.urlParams}
                        variant="secondary"
                        before={<PencilLineIcon />}
                    >
                        {strings.dropdownActionEditLabel}
                    </Link>
                )}
            >
                {canFinalize && (
                    <MenuItem
                        name={undefined}
                        before={<CheckLineIcon />}
                        confirmMessage={resolveToString(
                            strings.drefAccountFinalizeConfirmMessage,
                            {
                                selectedLanguage: startingLanguage
                                    ? languageNameMap[startingLanguage]
                                    : '--',
                            },
                        )}
                        onConfirm={handleFinalizeClick}
                        disabled={disabled}
                    >
                        {strings.dropdownActionFinalizeLabel}
                    </MenuItem>
                )}
                {canApprove && applicationType !== 'DREF' && (
                    <MenuItem
                        name={undefined}
                        before={<CheckLineIcon />}
                        confirmMessage={strings.drefAccountConfirmMessage}
                        onConfirm={handlePublishClick}
                        disabled={disabled}
                    >
                        {strings.dropdownActionApproveLabel}
                    </MenuItem>
                )}
                {canApprove && applicationType === 'DREF' && (
                    <MenuItem
                        name={undefined}
                        before={<CheckLineIcon />}
                        onClick={approvalDialog.open}
                        disabled={disabled}
                    >
                        {strings.dropdownActionApproveLabel}
                    </MenuItem>
                )}
                {canDownloadAllocation && (
                    <MenuItem
                        name={undefined}
                        before={<DownloadLineIcon />}
                        onClick={handleDrefAllocationExport}
                        disabled={disabled}
                    >
                        {strings.dropdownActionAllocationFormLabel}
                    </MenuItem>
                )}
                {canAddOpsUpdate && (
                    <MenuItem
                        name={undefined}
                        before={<AddLineIcon />}
                        onClick={opsUpdateDialog.open}
                        disabled={disabled}
                    >
                        {strings.dropdownActionAddOpsUpdateLabel}
                    </MenuItem>
                )}
                {canCreateFinalReport && (
                    <MenuItem
                        name={undefined}
                        before={<CaseManagementIcon />}
                        onClick={finalReportDialog.open}
                        disabled={disabled}
                    >
                        {strings.dropdownActionCreateFinalReportLabel}
                    </MenuItem>
                )}
                <MenuItem
                    name={undefined}
                    before={<ShareLineIcon />}
                    onClick={shareDialog.open}
                    disabled={disabled}
                >
                    {strings.dropdownActionShareLabel}
                </MenuItem>
                {drefType !== DREF_TYPE_LOAN && (
                    <MenuItem
                        name={undefined}
                        before={<DocumentPdfLineIcon />}
                        onClick={exportDialog.open}
                        disabled={disabled}
                    >
                        {strings.dropdownActionExportLabel}
                    </MenuItem>
                )}
            </TableActions>
            {exportDialog.isOpen && (
                <DrefExportModal
                    onCancel={exportDialog.close}
                    id={id}
                    drefType={drefType}
                    // eslint-disable-next-line react/jsx-props-no-spreading
                    {...(applicationType === 'FINAL_REPORT'
                        ? { applicationType, isDrefImminentV2 }
                        : { applicationType })}
                />
            )}
            {shareDialog.isOpen && (
                <DrefShareModal
                    onCancel={shareDialog.close}
                    onSuccess={shareDialog.close}
                    drefId={drefIdFromProps}
                />
            )}
            {opsUpdateDialog.isOpen && (
                <Dialog
                    heading={strings.dropdownActionImminentNewOpsUpdateConfirmationHeading}
                    onClose={opsUpdateDialog.close}
                    footerActions={(
                        <Button
                            name={undefined}
                            variant="primary"
                            onClick={handleAddOpsUpdate}
                            disabled={(startingLanguage !== 'en' && !selectOpsLanguage) || disabled}
                        >
                            {strings.dropdownActionAddOpsUpdateLabel}
                        </Button>
                    )}
                >
                    <Description>
                        {strings.dropdownActionNewOpsUpdateConfirmationMessage}
                    </Description>
                    {shouldConfirmImminentAddOpsUpdate && (
                        <Description>
                            {strings.dropdownActionImminentNewOpsUpdateConfirmationMessage}
                        </Description>
                    )}
                    {startingLanguage !== 'en' && (
                        <RadioInput
                            name={undefined}
                            label={strings.dropdownActionNewOpsUpdateLanguageSelectLanguageMessage}
                            value={selectOpsLanguage}
                            options={selectLanguageOptions}
                            onChange={setSelectOpsLanguage}
                            keySelector={selectLanguageKeySelector}
                            labelSelector={stringLabelSelector}
                        />
                    )}
                </Dialog>
            )}
            {finalReportDialog.isOpen && (
                <Dialog
                    heading={strings.dropdownActionNewFinalReportConfirmationHeading}
                    onClose={finalReportDialog.close}
                    footerActions={(
                        <Button
                            name={undefined}
                            variant="primary"
                            onClick={handleAddFinalReport}
                            disabled={(startingLanguage !== 'en' && !selectFinalLanguage) || disabled}
                        >
                            {strings.dropdownActionAddFinalReportLabel}
                        </Button>
                    )}
                >
                    <Description>
                        {strings.dropdownActionNewFinalReportConfirmationMessage}
                    </Description>
                    {startingLanguage !== 'en' && (
                        <RadioInput
                            name={undefined}
                            label={strings
                                .dropdownActionNewFinalReportLanguageSelectLanguageMessage}
                            value={selectFinalLanguage}
                            options={selectLanguageOptions}
                            onChange={setSelectFinalLanguage}
                            keySelector={selectLanguageKeySelector}
                            labelSelector={stringLabelSelector}
                        />
                    )}
                </Dialog>
            )}
            {drefApprovalPending && (
                <Dialog
                    ariaLabel={strings.drefApprovalInProgressTitle}
                    size="sm"
                >
                    <Message
                        pending
                        heading={strings.drefApprovalInProgressTitle}
                    />
                </Dialog>
            )}
            {approvalDialog.isOpen && (
                <Dialog
                    heading={strings.drefApprovalConfirmHeading}
                    onClose={approvalDialog.close}
                    footerActions={(
                        <Button
                            name={undefined}
                            variant="primary"
                            onClick={handlePublishDref}
                            disabled={approveDisabled}
                        >
                            {strings.dropdownActionApproveLabel}
                        </Button>
                    )}
                >
                    {isNotDefined(event) && (
                        <>
                            <RadioInput
                                name={undefined}
                                label={strings.drefApplicationNoEventApprovalWarningMessage}
                                options={linkEmergencyOptions}
                                keySelector={stringKeySelector}
                                labelSelector={stringLabelSelector}
                                descriptionSelector={stringDescriptionSelector}
                                value={linkEmergencyValue}
                                onChange={handleLinkEmergencyChange}
                                layout="block"
                            />
                            <EventSearchSelectInput
                                name={undefined}
                                value={eventValue}
                                onChange={setEventValue}
                                countryId={countryId}
                                options={eventOptions}
                                onOptionsChange={setEventOptions}
                                placeholder={strings.drefApprovalLinkEmergencyPlaceholder}
                                nonClearable
                                disabled={disabled
                                    || linkEmergencyValue !== LINK_EMERGENCY_SELECT_EXISTING}
                            />
                        </>
                    )}
                    {isDefined(event) && (
                        <>
                            <Description>
                                {resolveToComponent(
                                    strings.drefApplicationHasEventMessage,
                                    {
                                        emergency: (
                                            <Text variant="strong">
                                                {linkedEventName ?? '--'}
                                            </Text>
                                        ),
                                    },
                                )}
                            </Description>
                            <Description>
                                {strings.drefApprovalSureMessage}
                            </Description>
                        </>
                    )}
                </Dialog>
            )}
        </>
    );
}

export default DrefTableActions;
