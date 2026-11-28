import { useTranslation } from '@ifrc-go/ui/hooks';
import {
    Description,
    FieldGroup,
    FormSection,
    ListView,
    NumberInput,
    RepeatableList,
    SelectInput,
    Text,
    TextArea,
    useRepeatableList,
} from '@ifrc-go/ui/next';
import { stringValueSelector } from '@ifrc-go/ui/utils';
import { isDefined } from '@togglecorp/fujs';
import {
    type EntriesAsList,
    type Error,
    getErrorObject,
    getErrorString,
} from '@togglecorp/toggle-form';

import Admin1MultiSelectWithDescriptionInput from '#components/next/domain/Admin1MultiSelectWithDescriptionInput';
import Admin2Input from '#components/next/domain/Admin2Input';
import GoMultiFileInput from '#components/next/domain/GoMultiFileInput';
import GoSingleFileInput from '#components/next/domain/GoSingleFileInput';
import MultiFileObjectInput from '#components/next/domain/MultiFileObjectInput';
import Link from '#components/next/Link';
import TabPage from '#components/TabPage';
import { type components } from '#generated/types';
import useCountryHasAdmin2 from '#hooks/domain/useCountryHasAdmin2';
import useGlobalEnums from '#hooks/domain/useGlobalEnums';
import { EAP_ACCEPTED_FILE_FORMATS } from '#utils/constants';
import {
    type GoApiResponse,
    useRequest,
} from '#utils/restRequest';

import { wordLimits } from '../common';
import EAPSourceInformationInput from '../EAPSourceInformationInput';
import { type PartialEapFullFormType } from '../schema';
import SectionQualityCriteria from '../SectionQualityCriteria';

import i18n from './i18n.json';

type TimeframeOption = components['schemas']['EapTimeframeEnum'];

function timeframeKeySelector(option: TimeframeOption) {
    return option.key;
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
    eapRegistrationDetail?: GoApiResponse<'/api/v2/eap-registration/{id}/'>;
    readOnly?: boolean;
}

function TriggerModel(props: Props) {
    const {
        value,
        setFieldValue,
        error: formError,
        disabled,
        fileIdToUrlMap,
        setFileIdToUrlMap,
        eapRegistrationDetail,
        readOnly,
    } = props;

    const error = getErrorObject(formError);
    const strings = useTranslation(i18n);

    const { eap_timeframe } = useGlobalEnums();

    const countryId = eapRegistrationDetail?.country;
    const { hasAdmin2 } = useCountryHasAdmin2(countryId);
    const showAdmin2 = (value?.admin2?.length ?? 0) > 0 || hasAdmin2 === true;
    const showAdmin1 = (value?.districts?.length ?? 0) > 0 || !showAdmin2;

    const { response: templateUrl } = useRequest({
        url: '/api/v2/eap/global-files/{template_type}/',
        pathVariables: {
            template_type: 'forecast_table',
        },
    });

    const sourcesForecast = useRepeatableList(
        'trigger_statement_source_of_information',
        value.trigger_statement_source_of_information,
        setFieldValue,
    );
    const sourcesForecastError = getErrorObject(error?.trigger_statement_source_of_information);

    const sourcesOfInformation = useRepeatableList(
        'trigger_model_source_of_information',
        value.trigger_model_source_of_information,
        setFieldValue,
    );
    const sourcesOfInformationError = getErrorObject(error?.trigger_model_source_of_information);

    // NOTE: the early action activities are timed in the lead time unit, so
    // a new unit clears the activity times set in another one
    const handleLeadTimeframeUnitChange = (newValue: TimeframeOption['key'] | undefined) => {
        setFieldValue(newValue, 'lead_timeframe_unit');
        setFieldValue(
            (oldValue: PartialEapFullFormType['planned_operations']) => (
                oldValue?.map((operation) => ({
                    ...operation,
                    early_action_activities: operation.early_action_activities?.map(
                        (activity) => (
                            activity.timeframe === newValue
                                ? activity
                                : {
                                    ...activity,
                                    timeframe: newValue,
                                    time_value: undefined,
                                }
                        ),
                    ),
                }))
            ),
            'planned_operations',
        );
    };

    return (
        <TabPage
            headerAction={(
                <SectionQualityCriteria
                    heading={strings.triggerSectionHeading}
                    content={(
                        <ListView layout="block">
                            <Text variant="strong">
                                {strings.triggerSectionCriteriaIntroduction1}
                            </Text>
                            <ListView layout="block" spacing="xs">
                                <Description>
                                    {strings.triggerSectionCriteriaComment11}
                                </Description>
                                <Description>
                                    {strings.triggerSectionCriteriaComment12}
                                </Description>
                                <Description>
                                    {strings.triggerSectionCriteriaComment13}
                                </Description>
                                <Description>
                                    {strings.triggerSectionCriteriaComment14}
                                </Description>
                                <Description>
                                    {strings.triggerSectionCriteriaComment15}
                                </Description>
                            </ListView>
                            <Text variant="strong">
                                {strings.triggerSectionCriteriaIntroduction2}
                            </Text>
                            <ListView layout="block" spacing="xs">
                                <Description>
                                    {strings.triggerSectionCriteriaComment21}
                                </Description>
                                <Description>
                                    {strings.triggerSectionCriteriaComment22}
                                </Description>
                            </ListView>
                            <Text variant="strong">
                                {strings.triggerSectionCriteriaIntroduction3}
                            </Text>
                            <ListView layout="block" spacing="xs">
                                <Description>
                                    {strings.triggerSectionCriteriaComment31}
                                </Description>
                                <Description>
                                    {strings.triggerSectionCriteriaComment32}
                                </Description>
                                <Description>
                                    {strings.triggerSectionCriteriaComment33}
                                </Description>
                            </ListView>
                            <Text variant="strong">
                                {strings.triggerSectionCriteriaIntroduction4}
                            </Text>
                            <ListView layout="block" spacing="xs">
                                <Description>
                                    {strings.triggerSectionCriteriaComment41}
                                </Description>
                                <Description>
                                    {strings.triggerSectionCriteriaComment42}
                                </Description>
                                <Description>
                                    {strings.triggerSectionCriteriaComment43}
                                </Description>
                            </ListView>
                            <Text variant="strong">
                                {strings.triggerSectionCriteriaIntroduction5}
                            </Text>
                            <Description>
                                {strings.triggerSectionCriteriaComment5}
                            </Description>
                            <ListView layout="block" spacing="xs">
                                <Text variant="strong">
                                    {strings.triggerSectionCriteriaIntroduction6}
                                </Text>
                                <Description>
                                    <ol>
                                        <li>{strings.triggerSectionCriteriaIntroduction61}</li>
                                        <li>{strings.triggerSectionCriteriaIntroduction62}</li>
                                        <li>{strings.triggerSectionCriteriaIntroduction63}</li>
                                    </ol>
                                </Description>
                            </ListView>
                            <ListView layout="block" spacing="xs">
                                <Description>
                                    {strings.triggerSectionCriteriaComment61}
                                </Description>
                                <Description>
                                    {strings.triggerSectionCriteriaComment62}
                                </Description>
                                <Description>
                                    {strings.triggerSectionCriteriaComment63}
                                </Description>
                                <Description>
                                    {strings.triggerSectionCriteriaComment64}
                                </Description>
                                <Description>
                                    {strings.triggerSectionCriteriaComment65}
                                </Description>
                            </ListView>
                        </ListView>
                    )}
                />
            )}
        >
            <FormSection
                heading={strings.triggerModelHeading}
                info={(
                    <Description>
                        {strings.triggerModelTooltipDescription}
                    </Description>
                )}
                disabled={disabled}
                readOnly={readOnly}
            >
                <FieldGroup
                    heading={strings.triggerStatementTitle}
                    description={strings.triggerStatementDescription}
                    info={(
                        <ListView layout="block" spacing="xs">
                            <Text variant="strong">{strings.triggerExplanatoryNoteLabel}</Text>
                            <Description>{strings.triggerStatementExplanatoryNote}</Description>
                        </ListView>
                    )}
                    required
                >
                    <TextArea
                        name="trigger_statement"
                        label={strings.triggerModelDescriptionLabel}
                        value={value?.trigger_statement}
                        error={getErrorString(error?.trigger_statement)}
                        onChange={setFieldValue}
                        maxWords={wordLimits.trigger_statement}
                    />
                </FieldGroup>
                <FieldGroup
                    heading={strings.triggerLeadTimeTitle}
                    required
                    layoutOptions={{ numPreferredColumns: 2 }}
                >
                    <NumberInput
                        name="lead_time"
                        ariaLabel={strings.triggerLeadTimeTitle}
                        value={value?.lead_time}
                        error={getErrorString(error?.lead_time)}
                        onChange={setFieldValue}
                        required
                    />
                    <SelectInput
                        name="lead_timeframe_unit"
                        ariaLabel={strings.triggerModelLeadTimeUnitLabel}
                        value={value?.lead_timeframe_unit}
                        error={getErrorString(error?.lead_timeframe_unit)}
                        onChange={handleLeadTimeframeUnitChange}
                        options={eap_timeframe}
                        keySelector={timeframeKeySelector}
                        labelSelector={stringValueSelector}
                        required
                    />
                </FieldGroup>
                <FieldGroup
                    heading={strings.sourcesForecastTitle}
                    description={strings.sourcesForecastDescription}
                >
                    <RepeatableList
                        addLabel={strings.addNewTriggerButtonLabel}
                        onAdd={sourcesForecast.add}
                        error={getErrorString(error?.trigger_statement_source_of_information)}
                    >
                        {value.trigger_statement_source_of_information?.map((source) => (
                            <EAPSourceInformationInput
                                key={source.client_id}
                                value={source}
                                onChange={sourcesForecast.update}
                                onRemove={sourcesForecast.remove}
                                error={getErrorObject(sourcesForecastError?.[source.client_id])}
                            />
                        ))}
                    </RepeatableList>
                </FieldGroup>
                <FieldGroup
                    heading={strings.forecastSelectionTitle}
                    description={strings.forecastSelectionDescription}
                    info={(
                        <ListView layout="block">
                            <ListView layout="block" spacing="xs">
                                <Text variant="strong">{strings.triggerExplanatoryNoteLabel}</Text>
                                <Description>{strings.forecastExplanatoryNote}</Description>
                            </ListView>
                            <ListView layout="block" spacing="xs">
                                <Text variant="strong">{strings.triggerRequiredPointsLabel}</Text>
                                <Description>
                                    <ul>
                                        <li>{strings.forecastRequiredPoint1}</li>
                                        <li>{strings.forecastRequiredPoint2}</li>
                                    </ul>
                                </Description>
                            </ListView>
                        </ListView>
                    )}
                    required
                >
                    <TextArea
                        name="forecast_selection"
                        label={strings.triggerModelDescriptionLabel}
                        value={value?.forecast_selection}
                        error={getErrorString(error?.forecast_selection)}
                        onChange={setFieldValue}
                        maxWords={wordLimits.forecast_selection}
                    />
                    <MultiFileObjectInput
                        name="forecast_selection_files"
                        url="/api/v2/eap-file/multiple/"
                        accept={EAP_ACCEPTED_FILE_FORMATS}
                        value={value?.forecast_selection_files}
                        onChange={setFieldValue}
                        error={getErrorObject(error?.forecast_selection_files)}
                        fileIdToUrlMap={fileIdToUrlMap}
                        setFileIdToUrlMap={setFileIdToUrlMap}
                        description={strings.triggerModelFileCountLabel}
                    >
                        {strings.triggerSelectFilesLabel}
                    </MultiFileObjectInput>
                </FieldGroup>
                <FieldGroup
                    heading={strings.forecastTableDetails}
                    description={(
                        <Link
                            href={templateUrl?.url}
                            variant="underline"
                            external
                        >
                            {strings.downloadForecastTableLabel}
                        </Link>
                    )}
                    required
                >
                    <GoSingleFileInput
                        name="forecast_table_file"
                        url="/api/v2/eap-file/"
                        accept=".docx"
                        value={value.forecast_table_file}
                        onChange={setFieldValue}
                        error={getErrorString(error?.forecast_table_file)}
                        fileIdToUrlMap={fileIdToUrlMap}
                        setFileIdToUrlMap={setFileIdToUrlMap}
                        clearable
                        useCurrentLanguageForMutation
                    >
                        {strings.triggerUploadTableLabel}
                    </GoSingleFileInput>
                </FieldGroup>
                <FieldGroup
                    heading={strings.definitionJustificationTitle}
                    description={(
                        <ul>
                            <li>{strings.definitionJustificationDescription1}</li>
                            <li>{strings.definitionJustificationDescription2}</li>
                            <li>{strings.definitionJustificationDescription3}</li>
                            <li>{strings.definitionJustificationDescription4}</li>
                        </ul>
                    )}
                    info={(
                        <ListView layout="block">
                            <ListView layout="block" spacing="xs">
                                <Text variant="strong">{strings.triggerExplanatoryNoteLabel}</Text>
                                <Description>
                                    {strings.definitionJustificationExplanatoryNote}
                                </Description>
                            </ListView>
                            <ListView layout="block" spacing="xs">
                                <Text variant="strong">{strings.triggerRequiredPointsLabel}</Text>
                                <Description>
                                    <ul>
                                        <li>{strings.definitionRequiredPoint1}</li>
                                        <li>{strings.definitionRequiredPoint2}</li>
                                        <li>{strings.definitionRequiredPoint3}</li>
                                        <li>{strings.definitionRequiredPoint4}</li>
                                    </ul>
                                </Description>
                            </ListView>
                        </ListView>
                    )}
                    required
                >
                    <TextArea
                        name="definition_and_justification_impact_level"
                        label={strings.triggerModelDescriptionLabel}
                        value={value?.definition_and_justification_impact_level}
                        error={getErrorString(error?.definition_and_justification_impact_level)}
                        onChange={setFieldValue}
                        maxWords={wordLimits.definition_and_justification_impact_level}
                    />
                    <MultiFileObjectInput
                        name="definition_and_justification_impact_level_files"
                        url="/api/v2/eap-file/multiple/"
                        accept={EAP_ACCEPTED_FILE_FORMATS}
                        value={value?.definition_and_justification_impact_level_files}
                        onChange={setFieldValue}
                        error={getErrorObject(
                            error?.definition_and_justification_impact_level_files,
                        )}
                        fileIdToUrlMap={fileIdToUrlMap}
                        setFileIdToUrlMap={setFileIdToUrlMap}
                        description={strings.triggerModelFileCountLabel}
                    >
                        {strings.triggerSelectFilesLabel}
                    </MultiFileObjectInput>
                </FieldGroup>
                <FieldGroup
                    heading={strings.identificationInterventionTitle}
                    description={(
                        <ul>
                            <li>{strings.identificationInterventionDescription1}</li>
                            <li>{strings.identificationInterventionDescription2}</li>
                            <li>{strings.identificationInterventionDescription3}</li>
                        </ul>
                    )}
                    info={(
                        <ListView layout="block">
                            <ListView layout="block" spacing="xs">
                                <Text variant="strong">{strings.triggerExplanatoryNoteLabel}</Text>
                                <Description>
                                    {strings.identificationInterventionExplanatoryNote}
                                </Description>
                            </ListView>
                            <ListView layout="block" spacing="xs">
                                <Text variant="strong">{strings.triggerRequiredPointsLabel}</Text>
                                <Description>
                                    <ul>
                                        <li>{strings.identificationRequiredPoint1}</li>
                                        <li>{strings.identificationRequiredPoint2}</li>
                                        <li>{strings.identificationRequiredPoint3}</li>
                                    </ul>
                                </Description>
                            </ListView>
                        </ListView>
                    )}
                    required
                >
                    <TextArea
                        name="identification_of_the_intervention_area"
                        label={strings.triggerModelDescriptionLabel}
                        value={value?.identification_of_the_intervention_area}
                        error={getErrorString(error?.identification_of_the_intervention_area)}
                        onChange={setFieldValue}
                        maxWords={wordLimits.identification_of_the_intervention_area}
                    />
                    <MultiFileObjectInput
                        name="identification_of_the_intervention_area_files"
                        url="/api/v2/eap-file/multiple/"
                        accept={EAP_ACCEPTED_FILE_FORMATS}
                        value={value?.identification_of_the_intervention_area_files}
                        onChange={setFieldValue}
                        error={getErrorObject(
                            error?.identification_of_the_intervention_area_files,
                        )}
                        fileIdToUrlMap={fileIdToUrlMap}
                        setFileIdToUrlMap={setFileIdToUrlMap}
                        description={strings.triggerModelFileCountLabel}
                    >
                        {strings.triggerSelectFilesLabel}
                    </MultiFileObjectInput>
                </FieldGroup>
                {isDefined(countryId) && showAdmin2 && (
                    <FieldGroup
                        heading={strings.selectRegionTitle}
                        description={strings.selectRegionDescription}
                        required
                    >
                        <Admin2Input
                            name="admin2"
                            value={value?.admin2}
                            onChange={setFieldValue}
                            countryId={countryId}
                            error={getErrorString(error?.admin2)}
                        />
                    </FieldGroup>
                )}
                {isDefined(countryId) && showAdmin1 && (
                    <FieldGroup
                        heading={strings.selectRegionTitle}
                        description={strings.selectRegionDescription}
                        required
                    >
                        <Admin1MultiSelectWithDescriptionInput
                            name="districts"
                            value={value?.districts}
                            onChange={setFieldValue}
                            countryId={countryId}
                            error={getErrorObject(error?.districts)}
                            maxWords={wordLimits.districts}
                        />
                    </FieldGroup>
                )}
                <FieldGroup
                    heading={strings.attachRelevantFilesTitle}
                    description={strings.attachRelevantFilesDescription}
                >
                    <GoMultiFileInput
                        name="trigger_model_relevant_files"
                        url="/api/v2/eap-file/multiple/"
                        accept={EAP_ACCEPTED_FILE_FORMATS}
                        value={value?.trigger_model_relevant_files}
                        onChange={setFieldValue}
                        error={getErrorString(error?.trigger_model_relevant_files)}
                        fileIdToUrlMap={fileIdToUrlMap}
                        setFileIdToUrlMap={setFileIdToUrlMap}
                        clearable
                        useCurrentLanguageForMutation
                    >
                        {strings.attachRelevantFilesUploadLabel}
                    </GoMultiFileInput>
                </FieldGroup>
                <FieldGroup
                    heading={strings.sourceInformationTitle}
                    description={strings.sourceInformationDescription}
                >
                    <RepeatableList
                        addLabel={strings.addNewTriggerButtonLabel}
                        onAdd={sourcesOfInformation.add}
                        error={getErrorString(error?.trigger_model_source_of_information)}
                    >
                        {value.trigger_model_source_of_information?.map((source) => (
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
        </TabPage>
    );
}

export default TriggerModel;
