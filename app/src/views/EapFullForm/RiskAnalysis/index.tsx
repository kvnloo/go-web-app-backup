import { useTranslation } from '@ifrc-go/ui/hooks';
import {
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
import PrioritisedImpactInput from './PrioritisedImpactInput';

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

function RiskAnalysis(props: Props) {
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

    const prioritizedImpacts = useRepeatableList(
        'prioritized_impacts',
        value.prioritized_impacts,
        setFieldValue,
    );
    const prioritizedImpactsError = getErrorObject(error?.prioritized_impacts);

    const sourcesOfInformation = useRepeatableList(
        'risk_analysis_source_of_information',
        value.risk_analysis_source_of_information,
        setFieldValue,
    );
    const sourcesOfInformationError = getErrorObject(
        error?.risk_analysis_source_of_information,
    );

    return (
        <TabPage
            headerAction={(
                <SectionQualityCriteria
                    heading={strings.riskAnalysisSectionHeading}
                    content={(
                        <ListView layout="block">
                            <ListView layout="block" spacing="xs">
                                <Text variant="strong">
                                    {strings.riskSectionCriteriaIntroduction1}
                                </Text>
                                <Description>{strings.riskSectionCriteriaComment11}</Description>
                                <Description>{strings.riskSectionCriteriaComment12}</Description>
                                <Description>{strings.riskSectionCriteriaComment13}</Description>
                                <Description>{strings.riskSectionCriteriaComment14}</Description>
                                <Description>{strings.riskSectionCriteriaComment15}</Description>
                            </ListView>
                            <ListView layout="block" spacing="xs">
                                <Text variant="strong">
                                    {strings.riskSectionCriteriaIntroduction2}
                                </Text>
                                <Description>{strings.riskSectionCriteriaComment21}</Description>
                                <Description>{strings.riskSectionCriteriaComment22}</Description>
                            </ListView>
                            <ListView layout="block" spacing="xs">
                                <Text variant="strong">
                                    {strings.riskSectionCriteriaIntroduction3}
                                </Text>
                                <Description>{strings.riskSectionCriteriaComment31}</Description>
                                <Description>{strings.riskSectionCriteriaComment32}</Description>
                                <Description>{strings.riskSectionCriteriaComment33}</Description>
                            </ListView>
                            <ListView layout="block" spacing="xs">
                                <Text variant="strong">
                                    {strings.riskSectionCriteriaIntroduction4}
                                </Text>
                                <Description>{strings.riskSectionCriteriaComment41}</Description>
                                <Description>{strings.riskSectionCriteriaComment42}</Description>
                                <Description>{strings.riskSectionCriteriaComment43}</Description>
                            </ListView>
                            <ListView layout="block" spacing="xs">
                                <Text variant="strong">
                                    {strings.riskSectionCriteriaIntroduction5}
                                </Text>
                                <Description>{strings.riskSectionCriteriaComment5}</Description>
                            </ListView>
                            <ListView layout="block" spacing="xs">
                                <Text variant="strong">
                                    {strings.riskSectionCriteriaIntroduction6}
                                </Text>
                                <Description>
                                    <ol>
                                        <li>{strings.riskSectionCriteriaIntroduction61}</li>
                                        <li>{strings.riskSectionCriteriaIntroduction62}</li>
                                        <li>{strings.riskSectionCriteriaIntroduction63}</li>
                                    </ol>
                                </Description>
                                <Description>{strings.riskSectionCriteriaComment61}</Description>
                                <Description>{strings.riskSectionCriteriaComment62}</Description>
                                <Description>{strings.riskSectionCriteriaComment63}</Description>
                                <Description>{strings.riskSectionCriteriaComment64}</Description>
                                <Description>{strings.riskSectionCriteriaComment65}</Description>
                            </ListView>
                        </ListView>
                    )}
                />
            )}
        >
            <FormSection
                heading={strings.riskAnalysisHeading}
                disabled={disabled}
                readOnly={readOnly}
            >
                <FieldGroup
                    heading={strings.hazardSelectionTitle}
                    description={(
                        <ul>
                            <li>{strings.hazardSelectionDescription1}</li>
                            <li>{strings.hazardSelectionDescription2}</li>
                            <li>{strings.hazardSelectionDescription3}</li>
                            <li>{strings.hazardSelectionDescription4}</li>
                        </ul>
                    )}
                    info={(
                        <ListView layout="block">
                            <ListView layout="block" spacing="xs">
                                <Text variant="strong">{strings.riskExplanatoryNoteLabel}</Text>
                                <Description>{strings.hazardSelectionExplanatoryNote}</Description>
                            </ListView>
                            <ListView layout="block" spacing="xs">
                                <Text variant="strong">{strings.riskRequiredPointsLabel}</Text>
                                <Description>
                                    <ul>
                                        <li>{strings.hazardSelectionRequiredPoint1}</li>
                                        <li>{strings.hazardSelectionRequiredPoint2}</li>
                                        <li>
                                            {strings.hazardSelectionRequiredPoint3}
                                            <ul>
                                                <li>{strings.hazardSelectionRequiredPoint31}</li>
                                            </ul>
                                        </li>
                                        <li>{strings.hazardSelectionRequiredPoint4}</li>
                                    </ul>
                                </Description>
                            </ListView>
                        </ListView>
                    )}
                    required
                >
                    <TextArea
                        name="hazard_selection"
                        label={strings.riskDescriptionLabel}
                        value={value?.hazard_selection}
                        onChange={setFieldValue}
                        error={getErrorString(error?.hazard_selection)}
                        maxWords={wordLimits.hazard_selection}
                    />
                    <MultiFileObjectInput
                        name="hazard_selection_files"
                        url="/api/v2/eap-file/multiple/"
                        accept={EAP_ACCEPTED_FILE_FORMATS}
                        value={value?.hazard_selection_files}
                        onChange={setFieldValue}
                        error={getErrorObject(error?.hazard_selection_files)}
                        fileIdToUrlMap={fileIdToUrlMap}
                        setFileIdToUrlMap={setFileIdToUrlMap}
                        description={strings.riskAnalysisFileCountLabel}
                    >
                        {strings.attachFilesSelectFilesLabel}
                    </MultiFileObjectInput>
                </FieldGroup>
                <FieldGroup
                    heading={strings.exposeElementTitle}
                    description={(
                        <ul>
                            <li>{strings.exposeElementDescription1}</li>
                            <li>{strings.exposeElementDescription2}</li>
                            <li>{strings.exposeElementDescription3}</li>
                            <li>{strings.exposeElementDescription4}</li>
                            <li>{strings.exposeElementDescription5}</li>
                        </ul>
                    )}
                    info={(
                        <ListView layout="block">
                            <ListView layout="block" spacing="xs">
                                <Text variant="strong">{strings.riskExplanatoryNoteLabel}</Text>
                                <Description>{strings.exposeElementExplanatoryNote}</Description>
                            </ListView>
                            <ListView layout="block" spacing="xs">
                                <Text variant="strong">{strings.riskRequiredPointsLabel}</Text>
                                <Description>
                                    <ul>
                                        <li>{strings.exposeElementRequiredPoint1}</li>
                                        <li>{strings.exposeElementRequiredPoint2}</li>
                                        <li>{strings.exposeElementRequiredPoint3}</li>
                                        <li>{strings.exposeElementRequiredPoint4}</li>
                                        <li>{strings.exposeElementRequiredPoint5}</li>
                                    </ul>
                                </Description>
                            </ListView>
                        </ListView>
                    )}
                    required
                >
                    <TextArea
                        name="exposed_element_and_vulnerability_factor"
                        label={strings.riskDescriptionLabel}
                        value={value?.exposed_element_and_vulnerability_factor}
                        onChange={setFieldValue}
                        error={getErrorString(error?.exposed_element_and_vulnerability_factor)}
                        maxWords={wordLimits.exposed_element_and_vulnerability_factor}
                    />
                    <MultiFileObjectInput
                        name="exposed_element_and_vulnerability_factor_files"
                        url="/api/v2/eap-file/multiple/"
                        accept={EAP_ACCEPTED_FILE_FORMATS}
                        value={value?.exposed_element_and_vulnerability_factor_files}
                        onChange={setFieldValue}
                        error={getErrorObject(
                            error?.exposed_element_and_vulnerability_factor_files,
                        )}
                        fileIdToUrlMap={fileIdToUrlMap}
                        setFileIdToUrlMap={setFileIdToUrlMap}
                        description={strings.riskAnalysisFileCountLabel}
                    >
                        {strings.attachFilesSelectFilesLabel}
                    </MultiFileObjectInput>
                </FieldGroup>
                <FieldGroup
                    heading={strings.prioritisedImpactTitle}
                    description={strings.prioritisedImpactDescription}
                    info={(
                        <ListView layout="block" spacing="xs">
                            <Text variant="strong">{strings.riskExplanatoryNoteLabel}</Text>
                            <Description>{strings.prioritisedImpactExplanatoryNote}</Description>
                        </ListView>
                    )}
                    required
                >
                    <RepeatableList
                        addLabel={strings.addButtonLabel}
                        onAdd={prioritizedImpacts.add}
                        error={getErrorString(error?.prioritized_impacts)}
                    >
                        {value.prioritized_impacts?.map((impact) => (
                            <PrioritisedImpactInput
                                key={impact.client_id}
                                value={impact}
                                onChange={prioritizedImpacts.update}
                                onRemove={prioritizedImpacts.remove}
                                error={getErrorObject(
                                    prioritizedImpactsError?.[impact.client_id],
                                )}
                            />
                        ))}
                    </RepeatableList>
                    <TextArea
                        name="prioritized_impact"
                        label={strings.riskDescriptionLabel}
                        value={value?.prioritized_impact}
                        onChange={setFieldValue}
                        error={getErrorString(error?.prioritized_impact)}
                        maxWords={wordLimits.prioritized_impact}
                    />
                    <MultiFileObjectInput
                        name="prioritized_impact_files"
                        url="/api/v2/eap-file/multiple/"
                        accept={EAP_ACCEPTED_FILE_FORMATS}
                        value={value?.prioritized_impact_files}
                        onChange={setFieldValue}
                        error={getErrorObject(error?.prioritized_impact_files)}
                        fileIdToUrlMap={fileIdToUrlMap}
                        setFileIdToUrlMap={setFileIdToUrlMap}
                        description={strings.riskAnalysisFileCountLabel}
                    >
                        {strings.attachFilesSelectFilesLabel}
                    </MultiFileObjectInput>
                </FieldGroup>
                <FieldGroup
                    heading={strings.attachFilesTitle}
                    description={strings.attachFilesDescription}
                >
                    <GoMultiFileInput
                        name="risk_analysis_relevant_files"
                        url="/api/v2/eap-file/multiple/"
                        accept={EAP_ACCEPTED_FILE_FORMATS}
                        value={value.risk_analysis_relevant_files}
                        onChange={setFieldValue}
                        error={getErrorString(error?.risk_analysis_relevant_files)}
                        fileIdToUrlMap={fileIdToUrlMap}
                        setFileIdToUrlMap={setFileIdToUrlMap}
                        clearable
                        useCurrentLanguageForMutation
                    >
                        {strings.attachFilesUploadLabel}
                    </GoMultiFileInput>
                </FieldGroup>
                <FieldGroup
                    heading={strings.sourceOfInformationTitle}
                    description={strings.sourceOfInformationDescription}
                >
                    <RepeatableList
                        addLabel={strings.addButtonLabel}
                        onAdd={sourcesOfInformation.add}
                        error={getErrorString(error?.risk_analysis_source_of_information)}
                    >
                        {value.risk_analysis_source_of_information?.map((source) => (
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

export default RiskAnalysis;
