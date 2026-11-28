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

function NationalSocietyCapacity(props: Props) {
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
        'ns_capacity_source_of_information',
        value.ns_capacity_source_of_information,
        setFieldValue,
    );
    const sourcesError = getErrorObject(error?.ns_capacity_source_of_information);

    return (
        <TabPage
            headerAction={(
                <SectionQualityCriteria
                    heading={strings.capacitySectionHeading}
                    content={(
                        <ListView layout="block">
                            <ListView layout="block" spacing="xs">
                                <Text variant="strong">
                                    {strings.capacityCriteriaIntroduction11}
                                </Text>
                                <Description>{strings.capacityCriteriaComment1}</Description>
                                <Description>{strings.capacityCriteriaComment2}</Description>
                            </ListView>
                            <ListView layout="block" spacing="xs">
                                <Text variant="strong">
                                    {strings.capacityCriteriaIntroduction12}
                                </Text>
                                <Description>{strings.capacityCriteriaComment3}</Description>
                            </ListView>
                        </ListView>
                    )}
                />
            )}
        >
            <FormSection
                heading={strings.capacityHeading}
                info={<Description>{strings.capacityHeadingTooltip}</Description>}
                disabled={disabled}
                readOnly={readOnly}
            >
                <FieldGroup
                    heading={strings.capacityOperationalTitle}
                    description={(
                        <ul>
                            <li>{strings.capacityOperationalDescription1}</li>
                            <li>{strings.capacityOperationalDescription2}</li>
                            <li>{strings.capacityOperationalDescription3}</li>
                            <li>{strings.capacityOperationalDescription4}</li>
                        </ul>
                    )}
                    required
                >
                    <TextArea
                        name="operational_administrative_capacity"
                        label={strings.capacityDescriptionLabel}
                        value={value?.operational_administrative_capacity}
                        onChange={setFieldValue}
                        error={getErrorString(error?.operational_administrative_capacity)}
                        maxWords={wordLimits.operational_administrative_capacity}
                    />
                </FieldGroup>
                <FieldGroup
                    heading={strings.capacityStrategiesPlansTitle}
                    description={strings.capacityStrategiesPlansDescription}
                    required
                >
                    <TextArea
                        name="strategies_and_plans"
                        label={strings.capacityDescriptionLabel}
                        value={value?.strategies_and_plans}
                        onChange={setFieldValue}
                        error={getErrorString(error?.strategies_and_plans)}
                        maxWords={wordLimits.strategies_and_plans}
                    />
                </FieldGroup>
                <FieldGroup
                    heading={strings.capacityFinancialCapacityTitle}
                    description={strings.capacityFinancialDescription}
                    info={(
                        <ListView layout="block">
                            <ListView layout="block" spacing="xs">
                                <Text variant="strong">{strings.capacityExplanatoryNoteLabel}</Text>
                                <Description>{strings.capacityExplanatoryNote}</Description>
                            </ListView>
                            <ListView layout="block" spacing="xs">
                                <Text variant="strong">{strings.capacityRequiredPointsLabel}</Text>
                                <Description>
                                    <ul>
                                        <li>{strings.capacityFinancialDescription}</li>
                                    </ul>
                                </Description>
                            </ListView>
                        </ListView>
                    )}
                    required
                >
                    <TextArea
                        name="advance_financial_capacity"
                        label={strings.capacityDescriptionLabel}
                        value={value?.advance_financial_capacity}
                        onChange={setFieldValue}
                        error={getErrorString(error?.advance_financial_capacity)}
                        maxWords={wordLimits.advance_financial_capacity}
                    />
                </FieldGroup>
                <FieldGroup
                    heading={strings.capacityNationalRelevantFilesTitle}
                    description={strings.capacityNationalRelevantFilesDescription}
                >
                    <GoMultiFileInput
                        name="capacity_relevant_files"
                        url="/api/v2/eap-file/multiple/"
                        accept={EAP_ACCEPTED_FILE_FORMATS}
                        value={value?.capacity_relevant_files}
                        onChange={setFieldValue}
                        error={getErrorString(error?.capacity_relevant_files)}
                        fileIdToUrlMap={fileIdToUrlMap}
                        setFileIdToUrlMap={setFileIdToUrlMap}
                        clearable
                        useCurrentLanguageForMutation
                    >
                        {strings.capacityNationalRelevantFilesUploadLabel}
                    </GoMultiFileInput>
                </FieldGroup>
                <FieldGroup
                    heading={strings.capacitySourcesInformationTitle}
                    description={strings.capacitySourcesInformationDescription}
                >
                    <RepeatableList
                        addLabel={strings.addNewCapacitySourceButtonLabel}
                        onAdd={sources.add}
                        error={getErrorString(error?.ns_capacity_source_of_information)}
                    >
                        {value.ns_capacity_source_of_information?.map((source) => (
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

export default NationalSocietyCapacity;
