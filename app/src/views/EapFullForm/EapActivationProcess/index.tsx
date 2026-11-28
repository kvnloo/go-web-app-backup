import { useTranslation } from '@ifrc-go/ui/hooks';
import {
    Description,
    FieldGroup,
    FormSection,
    ListView,
    NumberInput,
    RepeatableList,
    Text,
    TextArea,
    useRepeatableList,
} from '@ifrc-go/ui/next';
import {
    type EntriesAsList,
    type Error,
    getErrorObject,
    getErrorString,
} from '@togglecorp/toggle-form';

import GoMultiFileInput from '#components/next/domain/GoMultiFileInput';
import MultiFileObjectInput from '#components/next/domain/MultiFileObjectInput';
import TabPage from '#components/TabPage';
import { EAP_ACCEPTED_FILE_FORMATS } from '#utils/constants';

import { wordLimits } from '../common';
import EAPSourceInformationInput from '../EAPSourceInformationInput';
import { type PartialEapFullFormType } from '../schema';
import SectionQualityCriteria from '../SectionQualityCriteria';

import i18n from './i18n.json';

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

function EapActivationProcess(props: Props) {
    const {
        value,
        setFieldValue,
        error: formError,
        disabled,
        fileIdToUrlMap,
        setFileIdToUrlMap,
        readOnly,
    } = props;

    const strings = useTranslation(i18n);
    const error = getErrorObject(formError);

    const sources = useRepeatableList(
        'activation_process_source_of_information',
        value.activation_process_source_of_information,
        setFieldValue,
    );
    const sourcesError = getErrorObject(error?.activation_process_source_of_information);

    return (
        <TabPage
            headerAction={(
                <SectionQualityCriteria
                    heading={strings.activationSectionHeading}
                    content={(
                        <ListView layout="block">
                            <ListView layout="block" spacing="xs">
                                <Text variant="strong">
                                    {strings.activationSectionCriteriaIntroduction1}
                                </Text>
                                <Description>
                                    {strings.activationSectionCriteriaComment11}
                                </Description>
                                <Description>
                                    {strings.activationSectionCriteriaComment12}
                                </Description>
                                <Description>
                                    {strings.activationSectionCriteriaComment13}
                                </Description>
                            </ListView>
                            <ListView layout="block" spacing="xs">
                                <Text variant="strong">
                                    {strings.activationSectionCriteriaIntroduction2}
                                </Text>
                                <Description>
                                    {strings.activationSectionCriteriaComment2}
                                </Description>
                                <Description>
                                    {strings.activationSectionCriteriaComment3}
                                </Description>
                            </ListView>
                            <ListView layout="block" spacing="xs">
                                <Text variant="strong">
                                    {strings.activationSectionCriteriaIntroduction3}
                                </Text>
                                <Description>
                                    {strings.activationSectionCriteriaComment31}
                                </Description>
                                <Description>
                                    {strings.activationSectionCriteriaComment32}
                                </Description>
                                <Description>
                                    {strings.activationSectionCriteriaComment33}
                                </Description>
                                <Description>
                                    {strings.activationSectionCriteriaComment34}
                                </Description>
                            </ListView>
                        </ListView>
                    )}
                />
            )}
        >
            <FormSection
                heading={strings.activationProcessHeading}
                info={<Description>{strings.activationProcessTooltip}</Description>}
                disabled={disabled}
                readOnly={readOnly}
            >
                <FieldGroup
                    heading={strings.activationProcessTitle}
                    description={(
                        <ul>
                            <li>{strings.activationProcessDescription1}</li>
                            <li>{strings.activationProcessDescription2}</li>
                        </ul>
                    )}
                    info={(
                        <ListView layout="block">
                            <ListView layout="block" spacing="xs">
                                <Text variant="strong">{strings.activationProcessExplanatoryLabel}</Text>
                                <Description>
                                    {strings.activationImplementationExplanatoryNote}
                                </Description>
                            </ListView>
                            <ListView layout="block" spacing="xs">
                                <Text variant="strong">{strings.activationProcessRequiredPointsLabel}</Text>
                                <Description>
                                    <ul>
                                        <li>{strings.activationRequiredPoint1}</li>
                                        <li>{strings.activationRequiredPoint2}</li>
                                        <li>{strings.activationRequiredPoint3}</li>
                                        <li>{strings.activationRequiredPoint4}</li>
                                    </ul>
                                </Description>
                            </ListView>
                        </ListView>
                    )}
                    required
                >
                    <TextArea
                        name="early_action_implementation_process"
                        label={strings.activationProcessDescriptionLabel}
                        value={value?.early_action_implementation_process}
                        onChange={setFieldValue}
                        error={getErrorString(error?.early_action_implementation_process)}
                        maxWords={wordLimits.early_action_implementation_process}
                    />
                    <MultiFileObjectInput
                        name="early_action_implementation_files"
                        url="/api/v2/eap-file/multiple/"
                        accept={EAP_ACCEPTED_FILE_FORMATS}
                        value={value?.early_action_implementation_files}
                        onChange={setFieldValue}
                        error={getErrorObject(error?.early_action_implementation_files)}
                        fileIdToUrlMap={fileIdToUrlMap}
                        setFileIdToUrlMap={setFileIdToUrlMap}
                        description={(
                            <Description variant="light" textSize="sm">
                                {strings.activationFilesCountLabel}
                            </Description>
                        )}
                    >
                        {strings.activationSelectFilesLabel}
                    </MultiFileObjectInput>
                </FieldGroup>
                <FieldGroup
                    heading={strings.activationTriggerTitle}
                    description={(
                        <ul>
                            <li>{strings.activationTriggerDescription1}</li>
                            <li>{strings.activationTriggerDescription2}</li>
                            <li>{strings.activationTriggerDescription3}</li>
                        </ul>
                    )}
                    info={(
                        <ListView layout="block">
                            <ListView layout="block" spacing="xs">
                                <Text variant="strong">{strings.activationProcessExplanatoryLabel}</Text>
                                <Description>
                                    {strings.activationTriggerExplanatoryNote}
                                </Description>
                            </ListView>
                            <ListView layout="block" spacing="xs">
                                <Text variant="strong">{strings.activationProcessRequiredPointsLabel}</Text>
                                <Description>
                                    <ul>
                                        <li>{strings.activationTriggerRequiredPoint1}</li>
                                        <li>{strings.activationTriggerRequiredPoint2}</li>
                                        <li>{strings.activationTriggerRequiredPoint3}</li>
                                    </ul>
                                </Description>
                            </ListView>
                        </ListView>
                    )}
                    required
                >
                    <TextArea
                        name="trigger_activation_system"
                        label={strings.activationProcessDescriptionLabel}
                        value={value?.trigger_activation_system}
                        onChange={setFieldValue}
                        error={getErrorString(error?.trigger_activation_system)}
                        maxWords={wordLimits.trigger_activation_system}
                    />
                    <MultiFileObjectInput
                        name="trigger_activation_system_files"
                        url="/api/v2/eap-file/multiple/"
                        accept={EAP_ACCEPTED_FILE_FORMATS}
                        value={value?.trigger_activation_system_files}
                        onChange={setFieldValue}
                        error={getErrorObject(error?.trigger_activation_system_files)}
                        fileIdToUrlMap={fileIdToUrlMap}
                        setFileIdToUrlMap={setFileIdToUrlMap}
                        description={(
                            <Description variant="light" textSize="sm">
                                {strings.activationFilesCountLabel}
                            </Description>
                        )}
                    >
                        {strings.activationSelectFilesLabel}
                    </MultiFileObjectInput>
                </FieldGroup>
                <FieldGroup
                    heading={strings.activationPeopleTargetedTitle}
                    description={strings.activationPeopleTargetedDescription}
                    info={<Description>{strings.activationPeopleTargetedTooltip}</Description>}
                    required
                >
                    <NumberInput
                        name="total_people_targeted"
                        ariaLabel={strings.activationPeopleTargetedTitle}
                        value={value?.total_people_targeted}
                        onChange={setFieldValue}
                        error={getErrorString(error?.total_people_targeted)}
                    />
                </FieldGroup>
                <FieldGroup
                    heading={strings.activationSelectionPopulationTitle}
                    description={(
                        <ul>
                            <li>{strings.activationSelectionDescription1}</li>
                            <li>{strings.activationSelectionDescription2}</li>
                            <li>{strings.activationSelectionDescription3}</li>
                        </ul>
                    )}
                    info={(
                        <ListView layout="block">
                            <ListView layout="block" spacing="xs">
                                <Text variant="strong">{strings.activationProcessExplanatoryLabel}</Text>
                                <Description>
                                    {strings.activationSelectionExplanatoryNote}
                                </Description>
                            </ListView>
                            <ListView layout="block" spacing="xs">
                                <Text variant="strong">{strings.activationProcessRequiredPointsLabel}</Text>
                                <Description>
                                    <ul>
                                        <li>{strings.activationSelectionDescription1}</li>
                                        <li>{strings.activationSelectionDescription2}</li>
                                        <li>{strings.activationSelectionDescription3}</li>
                                    </ul>
                                </Description>
                            </ListView>
                        </ListView>
                    )}
                    required
                >
                    <TextArea
                        name="selection_of_target_population"
                        label={strings.activationProcessDescriptionLabel}
                        value={value?.selection_of_target_population}
                        onChange={setFieldValue}
                        error={getErrorString(error?.selection_of_target_population)}
                        maxWords={wordLimits.selection_of_target_population}
                    />
                </FieldGroup>
                <FieldGroup
                    heading={strings.activationStopMechanismTitle}
                    description={(
                        <ul>
                            <li>{strings.activationStopDescription1}</li>
                            <li>{strings.activationStopDescription2}</li>
                            <li>{strings.activationStopDescription3}</li>
                        </ul>
                    )}
                    info={(
                        <ListView layout="block">
                            <ListView layout="block" spacing="xs">
                                <Text variant="strong">{strings.activationProcessExplanatoryLabel}</Text>
                                <Description>
                                    {strings.activationStopMechanismExplanatoryNote}
                                </Description>
                            </ListView>
                            <ListView layout="block" spacing="xs">
                                <Text variant="strong">{strings.activationProcessRequiredPointsLabel}</Text>
                                <Description>
                                    <ul>
                                        <li>{strings.activationStopDescription1}</li>
                                        <li>{strings.activationStopDescription2}</li>
                                        <li>{strings.activationStopDescription3}</li>
                                    </ul>
                                </Description>
                            </ListView>
                        </ListView>
                    )}
                    required
                >
                    <TextArea
                        name="stop_mechanism"
                        label={strings.activationProcessDescriptionLabel}
                        value={value?.stop_mechanism}
                        onChange={setFieldValue}
                        error={getErrorString(error?.stop_mechanism)}
                        maxWords={wordLimits.stop_mechanism}
                    />
                </FieldGroup>
                <FieldGroup
                    heading={strings.activationAttachFilesTitle}
                    description={strings.activationAttachFilesDescription}
                >
                    <GoMultiFileInput
                        name="activation_process_relevant_files"
                        url="/api/v2/eap-file/multiple/"
                        accept={EAP_ACCEPTED_FILE_FORMATS}
                        value={value?.activation_process_relevant_files}
                        onChange={setFieldValue}
                        error={getErrorString(error?.activation_process_relevant_files)}
                        fileIdToUrlMap={fileIdToUrlMap}
                        setFileIdToUrlMap={setFileIdToUrlMap}
                        clearable
                        useCurrentLanguageForMutation
                    >
                        {strings.activationProcessUploadLabel}
                    </GoMultiFileInput>
                </FieldGroup>
                <FieldGroup
                    heading={strings.activationSourceOfInformationTitle}
                    description={strings.activationSourceOfInformationDescription}
                >
                    <RepeatableList
                        addLabel={strings.activationAddNewButtonLabel}
                        onAdd={sources.add}
                        error={getErrorString(error?.activation_process_source_of_information)}
                    >
                        {value.activation_process_source_of_information?.map((source) => (
                            <EAPSourceInformationInput
                                key={source.client_id}
                                value={source}
                                onChange={sources.update}
                                onRemove={sources.remove}
                                error={getErrorObject(sourcesError?.[source.client_id])}
                            />
                        ))}
                    </RepeatableList>
                </FieldGroup>
            </FormSection>
        </TabPage>
    );
}

export default EapActivationProcess;
