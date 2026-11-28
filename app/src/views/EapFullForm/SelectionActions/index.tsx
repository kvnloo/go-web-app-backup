import { useTranslation } from '@ifrc-go/ui/hooks';
import {
    Checklist,
    ConfirmDialog,
    Description,
    FieldGroup,
    FormSection,
    ListView,
    RepeatableList,
    Text,
    TextArea,
    useRepeatableList,
} from '@ifrc-go/ui/next';
import {
    resolveToComponent,
    stringValueSelector,
} from '@ifrc-go/ui/utils';
import {
    isDefined,
    listToMap,
} from '@togglecorp/fujs';
import {
    type EntriesAsList,
    type Error,
    getErrorObject,
    getErrorString,
    useFormArray,
} from '@togglecorp/toggle-form';

import GoMultiFileInput from '#components/next/domain/GoMultiFileInput';
import GoSingleFileInput from '#components/next/domain/GoSingleFileInput';
import MultiFileObjectInput from '#components/next/domain/MultiFileObjectInput';
import Link from '#components/next/Link';
import TabPage from '#components/TabPage';
import { type components } from '#generated/types';
import useChecklistFormArray from '#hooks/domain/useChecklistFormArray';
import useGlobalEnums from '#hooks/domain/useGlobalEnums';
import { EAP_ACCEPTED_FILE_FORMATS } from '#utils/constants';
import { useRequest } from '#utils/restRequest';

import { wordLimits } from '../common';
import EAPSourceInformationInput from '../EAPSourceInformationInput';
import { type PartialEapFullFormType } from '../schema';
import SectionQualityCriteria from '../SectionQualityCriteria';
import ApproachesInput from './ApproachesInput';
import EarlyActionsInput from './EarlyActionsInput';
import OperationsInput from './OperationInput';

import i18n from './i18n.json';

type EapSector = components['schemas']['EapSectorEnumKey'];
type EapSectorOption = components['schemas']['EapSectorEnum'];

type EapApproach = components['schemas']['EapApproachEnumKey'];
type EapApproachOption = components['schemas']['EapApproachEnum'];

type EnablingApproachesFormFields = NonNullable<
    PartialEapFullFormType['enabling_approaches']
>[number];

type PlannedOperationFormFields = NonNullable<
    PartialEapFullFormType['planned_operations']
>[number];

function sectorKeySelector(option: EapSectorOption) {
    return option.key;
}

function approachesKeySelector(option: EapApproachOption) {
    return option.key;
}

function operationSectorSelector(operation: PlannedOperationFormFields) {
    return operation.sector;
}

function createOperation(sector: EapSector) {
    return { sector } satisfies PlannedOperationFormFields;
}

function approachSelector(approach: EnablingApproachesFormFields) {
    return approach.approach;
}

function createApproach(approach: EapApproach) {
    return { approach } satisfies EnablingApproachesFormFields;
}

interface Props {
    value: PartialEapFullFormType;
    setFieldValue: (...entries: EntriesAsList<PartialEapFullFormType>) => void;
    error: Error<PartialEapFullFormType> | undefined;
    disabled?: boolean;
    fileIdToUrlMap: Record<number, string>;
    setFileIdToUrlMap?: React.Dispatch<
        React.SetStateAction<Record<number, string>>
    >;
    readOnly?: boolean;
}

function SelectionActions(props: Props) {
    const {
        value,
        setFieldValue,
        error: formError,
        disabled,
        fileIdToUrlMap,
        setFileIdToUrlMap,
        readOnly,
    } = props;

    const error = getErrorObject(formError);
    const strings = useTranslation(i18n);
    const { eap_sector: eapSectorOptions, eap_approach: eapApproachOptions } = useGlobalEnums();

    const eapSectorLabelMapping = listToMap(
        eapSectorOptions,
        ({ key }) => key,
        ({ value: label }) => label,
    );
    const eapApproachLabelMapping = listToMap(
        eapApproachOptions,
        ({ key }) => key,
        ({ value: label }) => label,
    );

    const { response: templateUrl } = useRequest({
        url: '/api/v2/eap/global-files/{template_type}/',
        pathVariables: {
            template_type: 'theory_of_change_table',
        },
    });

    const { response: apCodeOptions } = useRequest({
        url: '/api/v2/eap/options/',
    });

    const earlyActions = useRepeatableList('early_actions', value.early_actions, setFieldValue);
    const earlyActionsError = getErrorObject(error?.early_actions);

    const sourcesOfInformation = useRepeatableList(
        'evidence_base_source_of_information',
        value.evidence_base_source_of_information,
        setFieldValue,
    );
    const sourcesOfInformationError = getErrorObject(error?.evidence_base_source_of_information);

    // NOTE: sector and approach rows follow their checklist, so they are
    // matched by index and keyed by sector or approach instead of a client_id
    const {
        setValue: setPlannedOperation,
        removeValue: removePlannedOperation,
    } = useFormArray<'planned_operations', PlannedOperationFormFields>(
        'planned_operations',
        setFieldValue,
    );
    const plannedOperationsError = getErrorObject(error?.planned_operations);

    const {
        selectedKeys: selectedSectors,
        pendingRemoval: pendingSectorRemoval,
        handleChecklistChange: handleSectorChecklistChange,
        handleRemovalCancel: handleSectorRemovalCancel,
        handleRemovalConfirm: handleSectorRemovalConfirm,
    } = useChecklistFormArray({
        value: value.planned_operations,
        keySelector: operationSectorSelector,
        createItem: createOperation,
        setValue: (getNewValue) => setFieldValue(getNewValue, 'planned_operations'),
        removeValue: removePlannedOperation,
    });

    const {
        setValue: setEnablingApproach,
        removeValue: removeEnablingApproach,
    } = useFormArray<'enabling_approaches', EnablingApproachesFormFields>(
        'enabling_approaches',
        setFieldValue,
    );
    const enablingApproachesError = getErrorObject(error?.enabling_approaches);

    const {
        selectedKeys: selectedApproaches,
        pendingRemoval: pendingApproachRemoval,
        handleChecklistChange: handleApproachChecklistChange,
        handleRemovalCancel: handleApproachRemovalCancel,
        handleRemovalConfirm: handleApproachRemovalConfirm,
    } = useChecklistFormArray({
        value: value.enabling_approaches,
        keySelector: approachSelector,
        createItem: createApproach,
        setValue: (getNewValue) => setFieldValue(getNewValue, 'enabling_approaches'),
        removeValue: removeEnablingApproach,
    });

    return (
        <TabPage
            spacingOffset={-2}
            headerAction={(
                <SectionQualityCriteria
                    heading={strings.actionsStatementSectionHeading}
                    content={(
                        <ListView layout="block">
                            <Text variant="strong">
                                {strings.actionsSectionCriteriaIntroduction1}
                            </Text>
                            <Description>
                                {strings.actionsSectionCriteriaComment1}
                            </Description>
                            <Description>
                                {resolveToComponent(
                                    strings.actionsSectionCriteriaComment2,
                                    {
                                        guidanceAnnexLink: (
                                            <Link href="https://ifrcorg.sharepoint.com/:f:/s/IFRCSharing/IgB7J6fjDPlsQ6iwh7ej1SpUAa0DvvOAimzrIlOx2DqpprA?e=w4OELM">
                                                {strings.guidanceAnnexLinkLabel}
                                            </Link>
                                        ),
                                    },
                                )}
                            </Description>
                            <Text variant="strong">
                                {strings.actionsSectionCriteriaIntroduction2}
                            </Text>
                            <ListView layout="block" spacing="xs">
                                <Description>
                                    {strings.actionsSectionCriteriaComment21}
                                </Description>
                                <Description>
                                    {strings.actionsSectionCriteriaComment22}
                                </Description>
                            </ListView>
                            <Text variant="strong">
                                {strings.actionsSectionCriteriaIntroduction3}
                            </Text>
                            <ListView layout="block" spacing="xs">
                                <Description>
                                    {strings.actionsSectionCriteriaComment31}
                                </Description>
                                <Description>
                                    {strings.actionsSectionCriteriaComment32}
                                </Description>
                            </ListView>
                            <ListView layout="block" spacing="xs">
                                <Text variant="strong">
                                    {strings.actionsSectionCriteriaIntroduction41}
                                </Text>
                                <Text>
                                    {strings.actionsSectionCriteriaIntroduction42}
                                </Text>
                            </ListView>
                            <Description>
                                {strings.actionsSectionCriteriaComment4}
                            </Description>
                            <ListView layout="block" spacing="xs">
                                <Text variant="strong">
                                    {strings.actionsSectionCriteriaIntroduction51}
                                </Text>
                                <Text>
                                    {strings.actionsSectionCriteriaIntroduction52}
                                </Text>
                            </ListView>
                            <Description>
                                {strings.actionsSectionCriteriaComment5}
                            </Description>
                            <Description>
                                {strings.actionsSectionCriteriaComment6}
                            </Description>
                        </ListView>
                    )}
                />
            )}
        >
            <FormSection
                heading={strings.selectionActionsHeading}
                info={<Description>{strings.selectionActionsTooltipDescription}</Description>}
                disabled={disabled}
                readOnly={readOnly}
            >
                <FieldGroup
                    heading={strings.selectionProcessTitle}
                    description={(
                        <ul>
                            <li>{strings.selectionProcessDescription1}</li>
                            <li>{strings.selectionProcessDescription2}</li>
                            <li>{strings.selectionProcessDescription3}</li>
                            <li>{strings.selectionProcessDescription4}</li>
                            <li>{strings.selectionProcessDescription5}</li>
                        </ul>
                    )}
                    info={(
                        <ListView layout="block">
                            <ListView layout="block" spacing="xs">
                                <Text variant="strong">
                                    {strings.selectionActionExplanatoryNoteLabel}
                                </Text>
                                <Description>{strings.selectionProcessExplanatoryNote}</Description>
                            </ListView>
                            <ListView layout="block" spacing="xs">
                                <Text variant="strong">
                                    {strings.selectionActionRequiredPointsLabel}
                                </Text>
                                <Description>
                                    <ul>
                                        <li>{strings.selectionProcessRequiredPoint1}</li>
                                        <li>{strings.selectionProcessRequiredPoint2}</li>
                                        <li>{strings.selectionProcessRequiredPoint3}</li>
                                        <li>{strings.selectionProcessRequiredPoint4}</li>
                                        <li>{strings.selectionProcessRequiredPoint5}</li>
                                    </ul>
                                </Description>
                            </ListView>
                        </ListView>
                    )}
                    required
                >
                    <RepeatableList
                        addLabel={strings.earlyActionsAddButtonLabel}
                        onAdd={earlyActions.add}
                        error={getErrorString(error?.early_actions)}
                    >
                        {value.early_actions?.map((action) => (
                            <EarlyActionsInput
                                key={action.client_id}
                                value={action}
                                onChange={earlyActions.update}
                                onRemove={earlyActions.remove}
                                error={getErrorObject(earlyActionsError?.[action.client_id])}
                            />
                        ))}
                    </RepeatableList>
                    <TextArea
                        name="early_action_selection_process"
                        label={strings.selectionActionDescriptionLabel}
                        value={value.early_action_selection_process}
                        onChange={setFieldValue}
                        error={getErrorString(error?.early_action_selection_process)}
                        maxWords={wordLimits.early_action_selection_process}
                    />
                    <MultiFileObjectInput
                        name="early_action_selection_process_files"
                        url="/api/v2/eap-file/multiple/"
                        accept={EAP_ACCEPTED_FILE_FORMATS}
                        value={value.early_action_selection_process_files}
                        onChange={setFieldValue}
                        error={getErrorObject(error?.early_action_selection_process_files)}
                        fileIdToUrlMap={fileIdToUrlMap}
                        setFileIdToUrlMap={setFileIdToUrlMap}
                        description={strings.selectionActionFilesCountLabel}
                    >
                        {strings.selectionActionSelectFilesLabel}
                    </MultiFileObjectInput>
                </FieldGroup>
                <FieldGroup
                    heading={strings.theoryOfChangeTableTitle}
                    description={(
                        <>
                            <Description>{strings.theoryOfChangeTableDescription}</Description>
                            <Link
                                href={templateUrl?.url}
                                variant="underline"
                                external
                            >
                                {strings.downloadTableLabel}
                            </Link>
                        </>
                    )}
                    required
                >
                    <GoSingleFileInput
                        name="theory_of_change_table_file"
                        accept=".docx"
                        url="/api/v2/eap-file/"
                        value={value.theory_of_change_table_file}
                        onChange={setFieldValue}
                        error={getErrorString(error?.theory_of_change_table_file)}
                        fileIdToUrlMap={fileIdToUrlMap}
                        setFileIdToUrlMap={setFileIdToUrlMap}
                        clearable
                    >
                        {strings.selectionActionUploadLabel}
                    </GoSingleFileInput>
                </FieldGroup>
                <FieldGroup
                    heading={strings.evidenceBaseTitle}
                    description={strings.evidenceBaseDescription}
                    info={(
                        <ListView layout="block" spacing="xs">
                            <Text variant="strong">
                                {strings.selectionActionExplanatoryNoteLabel}
                            </Text>
                            <Description>{strings.evidenceBaseExplanatoryNote}</Description>
                        </ListView>
                    )}
                    required
                >
                    <TextArea
                        name="evidence_base"
                        label={strings.selectionActionDescriptionLabel}
                        value={value.evidence_base}
                        onChange={setFieldValue}
                        error={getErrorString(error?.evidence_base)}
                        maxWords={wordLimits.evidence_base}
                    />
                </FieldGroup>
                <FieldGroup
                    heading={strings.selectionAttachFilesTitle}
                    description={strings.selectionAttachFilesDescription}
                >
                    <GoMultiFileInput
                        name="evidence_base_relevant_files"
                        url="/api/v2/eap-file/multiple/"
                        accept={EAP_ACCEPTED_FILE_FORMATS}
                        value={value.evidence_base_relevant_files}
                        onChange={setFieldValue}
                        error={getErrorString(error?.evidence_base_relevant_files)}
                        fileIdToUrlMap={fileIdToUrlMap}
                        setFileIdToUrlMap={setFileIdToUrlMap}
                        clearable
                        useCurrentLanguageForMutation
                    >
                        {strings.selectionActionUploadLabel}
                    </GoMultiFileInput>
                </FieldGroup>
                <FieldGroup
                    heading={strings.selectionSourceOfInformationTitle}
                    description={strings.selectionSourceOfInformationDescription}
                >
                    <RepeatableList
                        addLabel={strings.earlyActionsAddButtonLabel}
                        onAdd={sourcesOfInformation.add}
                        error={getErrorString(error?.evidence_base_source_of_information)}
                    >
                        {value.evidence_base_source_of_information?.map((source) => (
                            <EAPSourceInformationInput
                                key={source.client_id}
                                value={source}
                                onChange={sourcesOfInformation.update}
                                onRemove={sourcesOfInformation.remove}
                                error={getErrorObject(
                                    sourcesOfInformationError?.[source.client_id],
                                )}
                            />
                        ))}
                    </RepeatableList>
                </FieldGroup>
            </FormSection>
            <FormSection
                heading={strings.selectionActionPlannedOperationHeading}
                description={strings.selectionActionPlannedOperationHeadingDescription}
                disabled={disabled}
                readOnly={readOnly}
            >
                <FieldGroup
                    heading={strings.plannedOperationTitle}
                    description={strings.plannedOperationDescription}
                    required
                    error={getErrorString(error?.planned_operations)}
                >
                    <Checklist
                        name={undefined}
                        ariaLabel={strings.plannedOperationTitle}
                        options={eapSectorOptions}
                        keySelector={sectorKeySelector}
                        labelSelector={stringValueSelector}
                        value={selectedSectors}
                        onChange={handleSectorChecklistChange}
                        layout="grid"
                        layoutOptions={{ numPreferredColumns: 3 }}
                    />
                </FieldGroup>
                {value.planned_operations?.map((operation, index) => (
                    <OperationsInput
                        key={operation.sector}
                        index={index}
                        value={operation}
                        onChange={setPlannedOperation}
                        onRemove={removePlannedOperation}
                        error={getErrorObject(plannedOperationsError?.[operation.sector])}
                        operationTitle={eapSectorLabelMapping?.[operation.sector]}
                        sectorApCodeOption={apCodeOptions?.sector_ap_codes}
                        leadTimeframeUnit={value.lead_timeframe_unit}
                    />
                ))}
                <FieldGroup
                    heading={strings.enablingApproachesTitle}
                    description={strings.enablingApproachesDescription}
                    required
                    error={getErrorString(error?.enabling_approaches)}
                >
                    <Checklist
                        name={undefined}
                        ariaLabel={strings.enablingApproachesTitle}
                        options={eapApproachOptions}
                        keySelector={approachesKeySelector}
                        labelSelector={stringValueSelector}
                        value={selectedApproaches}
                        onChange={handleApproachChecklistChange}
                        layout="grid"
                        layoutOptions={{ numPreferredColumns: 3 }}
                    />
                </FieldGroup>
                {value.enabling_approaches?.map((approach, index) => (
                    <ApproachesInput
                        key={approach.approach}
                        index={index}
                        value={approach}
                        onChange={setEnablingApproach}
                        onRemove={removeEnablingApproach}
                        error={getErrorObject(enablingApproachesError?.[approach.approach])}
                        approachTitle={eapApproachLabelMapping?.[approach.approach]}
                        approachApCodeOption={apCodeOptions?.approach_ap_codes}
                        leadTimeframeUnit={value.lead_timeframe_unit}
                    />
                ))}
                <FieldGroup
                    heading={strings.useFulnessActionsTitle}
                    description={strings.useFulnessActionsDescription}
                    info={(
                        <ListView layout="block" spacing="xs">
                            <Text variant="strong">
                                {strings.selectionActionExplanatoryNoteLabel}
                            </Text>
                            <Description>{strings.useFulnessActionsExplanatoryNote}</Description>
                        </ListView>
                    )}
                    required
                >
                    <TextArea
                        name="usefulness_of_actions"
                        label={strings.selectionActionDescriptionLabel}
                        value={value.usefulness_of_actions}
                        onChange={setFieldValue}
                        error={getErrorString(error?.usefulness_of_actions)}
                        maxWords={wordLimits.usefulness_of_actions}
                    />
                </FieldGroup>
                <FieldGroup
                    heading={strings.feasibilityTitle}
                    description={strings.feasibilityDescription}
                    info={(
                        <ListView layout="block">
                            <ListView layout="block" spacing="xs">
                                <Text variant="strong">
                                    {strings.selectionActionExplanatoryNoteLabel}
                                </Text>
                                <Description>{strings.feasibilityExplanatoryNote}</Description>
                            </ListView>
                            <ListView layout="block" spacing="xs">
                                <Text variant="strong">
                                    {strings.selectionActionRequiredPointsLabel}
                                </Text>
                                <Description>
                                    <ul>
                                        <li>{strings.feasibilityRequiredPoint1}</li>
                                        <li>{strings.feasibilityRequiredPoint2}</li>
                                    </ul>
                                </Description>
                            </ListView>
                        </ListView>
                    )}
                    required
                >
                    <TextArea
                        name="feasibility"
                        label={strings.selectionActionDescriptionLabel}
                        value={value.feasibility}
                        onChange={setFieldValue}
                        error={getErrorString(error?.feasibility)}
                        maxWords={wordLimits.feasibility}
                    />
                </FieldGroup>
            </FormSection>
            {isDefined(pendingSectorRemoval) && (
                <ConfirmDialog
                    name={undefined}
                    message={strings.plannedOperationSectorUnselectConfirmation}
                    onCancel={handleSectorRemovalCancel}
                    onConfirm={handleSectorRemovalConfirm}
                />
            )}
            {isDefined(pendingApproachRemoval) && (
                <ConfirmDialog
                    name={undefined}
                    message={strings.enablingApproachUnselectConfirmation}
                    onCancel={handleApproachRemovalCancel}
                    onConfirm={handleApproachRemovalConfirm}
                />
            )}
        </TabPage>
    );
}

export default SelectionActions;
