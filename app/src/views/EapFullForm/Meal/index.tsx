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
    setFileIdToUrlMap?: React.Dispatch<React.SetStateAction<Record<number, string>>>;
    readOnly?: boolean;
}

function Meal(props: Props) {
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

    const sourcesOfInformation = useRepeatableList(
        'meal_source_of_information',
        value.meal_source_of_information,
        setFieldValue,
    );
    const sourcesOfInformationError = getErrorObject(error?.meal_source_of_information);

    return (
        <TabPage
            headerAction={(
                <SectionQualityCriteria
                    heading={strings.mealSectionHeading}
                    content={(
                        <ListView layout="block">
                            <ListView layout="block" spacing="xs">
                                <Text variant="strong">{strings.mealCriteriaIntroduction1}</Text>
                                <Description>
                                    <ol>
                                        <li>{strings.mealCriteriaIntroduction11}</li>
                                        <li>{strings.mealCriteriaIntroduction12}</li>
                                        <li>{strings.mealCriteriaIntroduction13}</li>
                                    </ol>
                                </Description>
                            </ListView>
                            <Description>{strings.mealCriteriaComment1}</Description>
                            <Description>
                                {strings.mealCriteriaComment2}
                                <ul>
                                    <li>{strings.mealCriteriaPdmTheme1}</li>
                                    <li>{strings.mealCriteriaPdmTheme2}</li>
                                    <li>{strings.mealCriteriaPdmTheme3}</li>
                                    <li>
                                        {strings.mealCriteriaPdmTheme4}
                                        <ul>
                                            <li>{strings.mealCriteriaPdmFollowing1}</li>
                                            <li>{strings.mealCriteriaPdmFollowing2}</li>
                                            <li>{strings.mealCriteriaPdmFollowing3}</li>
                                        </ul>
                                    </li>
                                </ul>
                            </Description>
                            <Description>{strings.mealCriteriaComment3}</Description>
                            <Description>{strings.mealCriteriaComment4}</Description>
                            <Description>{strings.mealCriteriaComment5}</Description>
                        </ListView>
                    )}
                />
            )}
        >
            <FormSection
                heading={strings.mealHeading}
                disabled={disabled}
                readOnly={readOnly}
            >
                <FieldGroup
                    heading={strings.mealTitle}
                    description={(
                        <ul>
                            <li>
                                {strings.mealDescription1}
                                <ul>
                                    <li>{strings.mealDescription11}</li>
                                    <li>{strings.mealDescription12}</li>
                                    <li>{strings.mealDescription13}</li>
                                </ul>
                            </li>
                            <li>{strings.mealDescription2}</li>
                            <li>{strings.mealDescription3}</li>
                        </ul>
                    )}
                    info={(
                        <ListView layout="block">
                            <ListView layout="block" spacing="xs">
                                <Text variant="strong">{strings.mealExplanatoryNoteLabel}</Text>
                                <Description>{strings.mealExplanatoryNote}</Description>
                            </ListView>
                            <ListView layout="block" spacing="xs">
                                <Text variant="strong">{strings.mealRequiredPointsLabel}</Text>
                                <Description>
                                    <ul>
                                        <li>
                                            {strings.mealDescription1}
                                            <ul>
                                                <li>{strings.mealDescription11}</li>
                                                <li>{strings.mealDescription12}</li>
                                                <li>{strings.mealDescription13}</li>
                                                <li>{strings.mealDescription14}</li>
                                            </ul>
                                        </li>
                                        <li>{strings.mealDescription2}</li>
                                        <li>{strings.mealDescription3}</li>
                                    </ul>
                                </Description>
                            </ListView>
                        </ListView>
                    )}
                    required
                >
                    <TextArea
                        name="meal"
                        label={strings.mealDescriptionLabel}
                        value={value?.meal}
                        onChange={setFieldValue}
                        error={getErrorString(error?.meal)}
                        maxWords={wordLimits.meal}
                    />
                </FieldGroup>
                <FieldGroup
                    heading={strings.mealAttachRelevantFilesTitle}
                    description={strings.mealAttachRelevantFilesDescription}
                >
                    <GoMultiFileInput
                        name="meal_relevant_files"
                        url="/api/v2/eap-file/multiple/"
                        accept={EAP_ACCEPTED_FILE_FORMATS}
                        value={value.meal_relevant_files}
                        onChange={setFieldValue}
                        error={getErrorString(error?.meal_relevant_files)}
                        fileIdToUrlMap={fileIdToUrlMap}
                        setFileIdToUrlMap={setFileIdToUrlMap}
                        clearable
                        useCurrentLanguageForMutation
                    >
                        {strings.mealAttachRelevantFilesUploadLabel}
                    </GoMultiFileInput>
                </FieldGroup>
                <FieldGroup
                    heading={strings.mealSourcesInformationTitle}
                    description={strings.mealSourcesInformationDescription}
                >
                    <RepeatableList
                        addLabel={strings.addNewMealButtonLabel}
                        onAdd={sourcesOfInformation.add}
                        error={getErrorString(error?.meal_source_of_information)}
                    >
                        {value.meal_source_of_information?.map((source) => (
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

export default Meal;
