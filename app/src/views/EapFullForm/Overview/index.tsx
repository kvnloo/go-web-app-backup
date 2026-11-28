import { useCallback } from 'react';
import { useTranslation } from '@ifrc-go/ui/hooks';
import {
    BooleanInput,
    Checkbox,
    Description,
    FieldGroup,
    FormSection,
    ListView,
    RadioInput,
    RepeatableList,
    Text,
    TextArea,
    TextInput,
    useRepeatableList,
} from '@ifrc-go/ui/next';
import {
    resolveToComponent,
    resolveToString,
} from '@ifrc-go/ui/utils';
import { isNotDefined } from '@togglecorp/fujs';
import {
    type EntriesAsList,
    type Error,
    getErrorObject,
    getErrorString,
} from '@togglecorp/toggle-form';

import ContactInputsSection from '#components/domain/ContactInputsSection';
import EapMonthYearInput from '#components/domain/EapMonthYearInput';
import ImageWithCaptionInput from '#components/domain/ImageWithCaptionInput';
import CountrySelectInput from '#components/next/domain/CountrySelectInput';
import DisasterTypeSelectInput from '#components/next/domain/DisasterTypeSelectInput';
import NationalSocietySelectInput from '#components/next/domain/NationalSocietySelectInput';
import TabPage from '#components/TabPage';
import {
    DISASTER_TYPE_EPIDEMIC,
    DISASTER_TYPE_OTHER,
} from '#utils/constants';
import { type GoApiResponse } from '#utils/restRequest';

import { wordLimits } from '../common';
import { type PartialEapFullFormType } from '../schema';
import SectionQualityCriteria from '../SectionQualityCriteria';
import KeyActorsInput from './KeyActorsInput';

import i18n from './i18n.json';

type EapRegisterRequestDetails = GoApiResponse<'/api/v2/eap-registration/{id}/'>;

const NOT_SURE = 'not-sure';
interface NotSureOption {
    key: typeof NOT_SURE;
    label: string;
}
const notSureKeySelector = (option: NotSureOption) => option.key;
const notSureLabelSelector = (option: NotSureOption) => option.label;

interface Props {
    value: PartialEapFullFormType;
    setFieldValue: (...entries: EntriesAsList<PartialEapFullFormType>) => void;
    error: Error<PartialEapFullFormType> | undefined;
    disabled?: boolean;
    fileIdToUrlMap: Record<number, string>;
    setFileIdToUrlMap?: React.Dispatch<
        React.SetStateAction<Record<number, string>>
    >;
    eapRegistrationDetail?: EapRegisterRequestDetails;
    readOnly?: boolean;
}

function Overview(props: Props) {
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

    const strings = useTranslation(i18n);
    const error = getErrorObject(formError);

    const objectiveDescription = resolveToComponent(
        strings.objectiveDescription,
        { exampleObjective: <i>{strings.objectiveDescriptionExample}</i> },
    );

    // NOTE: We dont want some fields to have onChange functionality
    const noop = () => { };

    const isEpidemicDisasterType = eapRegistrationDetail
        ?.disaster_type === DISASTER_TYPE_EPIDEMIC;
    const isOtherDisasterType = eapRegistrationDetail?.disaster_type === DISASTER_TYPE_OTHER;

    const keyActors = useRepeatableList('key_actors', value.key_actors, setFieldValue);
    const keyActorsError = getErrorObject(error?.key_actors);

    const notSureOptions: NotSureOption[] = [{ key: NOT_SURE, label: strings.notSure }];

    const handleSubmissionTimeNotSureClick = useCallback(() => {
        setFieldValue(undefined, 'expected_submission_time');
    }, [setFieldValue]);

    return (
        <TabPage
            spacingOffset={-2}
            headerAction={(
                <SectionQualityCriteria
                    heading={strings.overviewSectionHeading}
                    content={(
                        <ListView layout="block">
                            <Description>{strings.sectionCriteriaIntroduction1}</Description>
                            <Description>{strings.sectionCriteriaIntroduction2}</Description>
                            <Description>{strings.sectionCriteriaComment2}</Description>
                            <Description>{strings.sectionCriteriaComment3}</Description>
                            <Description>{strings.sectionCriteriaComment4}</Description>
                        </ListView>
                    )}
                />
            )}
        >
            {/* FIXME: ImageWithCaptionInput, EapMonthYearInput and
            ContactInputsSection are still v2 and ignore the form state of next
            form sections; drop their disabled and readOnly once they move */}
            <FormSection
                heading={strings.overviewHeading}
                disabled={disabled}
                readOnly={readOnly}
            >
                <FieldGroup
                    heading={strings.nationalSociety}
                    description={strings.nationalSocietyDescription}
                    required
                >
                    <NationalSocietySelectInput
                        name="national_society"
                        ariaLabel={strings.nationalSociety}
                        onChange={noop}
                        value={eapRegistrationDetail?.national_society}
                        readOnly
                    />
                </FieldGroup>
                <FieldGroup
                    heading={strings.formCountry}
                    description={strings.formCountryDescription}
                    required
                >
                    <CountrySelectInput
                        name="country"
                        ariaLabel={strings.formCountry}
                        value={eapRegistrationDetail?.country}
                        onChange={noop}
                        readOnly
                    />
                </FieldGroup>
                <FieldGroup
                    heading={strings.disasterType}
                    description={strings.disasterTypeDescription}
                    required
                >
                    <DisasterTypeSelectInput
                        name="disaster_type"
                        ariaLabel={strings.disasterType}
                        value={eapRegistrationDetail?.disaster_type}
                        onChange={noop}
                        readOnly
                    />
                    {(isEpidemicDisasterType || isOtherDisasterType) && (
                        <TextInput
                            name="disaster_sub_type"
                            label={isEpidemicDisasterType
                                ? strings.epidemicType
                                : strings.otherDisasterType}
                            value={eapRegistrationDetail?.disaster_sub_type}
                            onChange={noop}
                            readOnly
                        />
                    )}
                </FieldGroup>
                <FieldGroup
                    heading={strings.formUploadCoverImage}
                    description={strings.formUploadCoverImageDescription}
                    required
                    layoutOptions={{ numPreferredColumns: 2 }}
                >
                    <ImageWithCaptionInput
                        name="cover_image_file"
                        url="/api/v2/eap-file/"
                        value={value?.cover_image_file}
                        onChange={setFieldValue}
                        error={getErrorObject(error?.cover_image_file)}
                        fileIdToUrlMap={fileIdToUrlMap}
                        setFileIdToUrlMap={setFileIdToUrlMap}
                        label={strings.formUploadAnImageLabel}
                        readOnly={readOnly}
                        disabled={disabled}
                    />
                </FieldGroup>
                <FieldGroup
                    heading={strings.formExpectedSubmissionTimeTitle}
                    description={strings.formExpectedSubmissionTimeDescription}
                    required
                    layoutOptions={{ numPreferredColumns: 2 }}
                    error={getErrorString(error?.expected_submission_time)}
                >
                    <EapMonthYearInput
                        name="expected_submission_time"
                        value={value?.expected_submission_time}
                        onChange={setFieldValue}
                        disabled={disabled}
                        readOnly={readOnly}
                    />
                    <RadioInput
                        name={undefined}
                        ariaLabel={strings.formExpectedSubmissionTimeTitle}
                        options={notSureOptions}
                        keySelector={notSureKeySelector}
                        labelSelector={notSureLabelSelector}
                        value={isNotDefined(value?.expected_submission_time)
                            ? NOT_SURE
                            : undefined}
                        onChange={handleSubmissionTimeNotSureClick}
                    />
                </FieldGroup>
                <FieldGroup
                    heading={strings.objectiveTitle}
                    description={objectiveDescription}
                    required
                >
                    <TextArea
                        name="objective"
                        label={strings.workWithGovernmentDescriptionLabel}
                        value={value?.objective}
                        error={getErrorString(error?.objective)}
                        onChange={setFieldValue}
                    />
                </FieldGroup>
                <FieldGroup
                    heading={strings.partnersInvolved}
                    description={strings.partnersInvolvedDescription}
                >
                    <NationalSocietySelectInput
                        name="partners"
                        ariaLabel={strings.partnersInvolved}
                        multiple
                        value={value.partners}
                        error={getErrorString(error?.partners)}
                        onChange={setFieldValue}
                    />
                    <Checkbox
                        name="include_rcrc_climate_center"
                        label={strings.rcrcClimateCenter}
                        value={value?.include_rcrc_climate_center}
                        onChange={setFieldValue}
                        error={getErrorString(error?.include_rcrc_climate_center)}
                    />
                </FieldGroup>
            </FormSection>
            <FormSection
                heading={strings.formContacts}
                disabled={disabled}
                readOnly={readOnly}
            >
                <ContactInputsSection
                    title={strings.nSContact}
                    description={strings.nSContactDescription}
                    namePrefix="national_society_contact"
                    value={value}
                    setFieldValue={setFieldValue}
                    error={error}
                    disabled={disabled}
                    readOnly={readOnly}
                    withRequiredNameAndEmail
                    withRequiredTitle
                />
                <ContactInputsSection
                    title={strings.drefFocalPoint}
                    description={strings.drefFocalPointDescription}
                    namePrefix="dref_focal_point"
                    value={value}
                    setFieldValue={setFieldValue}
                    error={error}
                    disabled={disabled}
                    readOnly={readOnly}
                />
                <ContactInputsSection
                    title={strings.regionalFocalPoint}
                    namePrefix="ifrc_regional_focal_point"
                    value={value}
                    setFieldValue={setFieldValue}
                    error={error}
                    disabled={disabled}
                    readOnly={readOnly}
                />
                <ContactInputsSection
                    title={strings.regionalManager}
                    namePrefix="ifrc_regional_ops_manager"
                    value={value}
                    setFieldValue={setFieldValue}
                    error={error}
                    disabled={disabled}
                    readOnly={readOnly}
                />
                <ContactInputsSection
                    title={strings.regionalHead}
                    namePrefix="ifrc_regional_head_dcc"
                    value={value}
                    setFieldValue={setFieldValue}
                    error={error}
                    disabled={disabled}
                    readOnly={readOnly}
                />
            </FormSection>
            <FormSection
                heading={strings.stakeholderHeader}
                disabled={disabled}
                readOnly={readOnly}
            >
                <FieldGroup
                    heading={strings.workWithGovernmentTitle}
                    description={strings.workWithGovernmentDescription}
                    info={(
                        <ListView layout="block" spacing="xs">
                            <Text variant="strong">{strings.overviewExplanatoryNoteLabel}</Text>
                            <Description>{strings.workExplanatoryNote}</Description>
                        </ListView>
                    )}
                    required
                >
                    <BooleanInput
                        name="is_worked_with_government"
                        ariaLabel={strings.workWithGovernmentTitle}
                        value={value?.is_worked_with_government}
                        onChange={setFieldValue}
                        error={getErrorString(error?.is_worked_with_government)}
                    />
                    {value.is_worked_with_government && (
                        <TextArea
                            name="worked_with_government_description"
                            label={strings.workWithGovernmentDescriptionLabel}
                            value={value?.worked_with_government_description}
                            onChange={setFieldValue}
                            error={getErrorString(error?.worked_with_government_description)}
                        />
                    )}
                </FieldGroup>
                <FieldGroup
                    heading={strings.keyActorsTitle}
                    description={(
                        <>
                            <Description>{strings.keyActorsDescription}</Description>
                            <Description>
                                {resolveToString(
                                    strings.keyActorsDescription2,
                                    { addNewActorButtonLabel: strings.keyActorsAddButton },
                                )}
                            </Description>
                        </>
                    )}
                    info={(
                        <ListView layout="block">
                            <ListView layout="block" spacing="xs">
                                <Text variant="strong">{strings.overviewExplanatoryNoteLabel}</Text>
                                <Description>{strings.actorsExplanatoryNote}</Description>
                            </ListView>
                            <ListView layout="block" spacing="xs">
                                <Text variant="strong">{strings.overviewRequiredPointsLabel}</Text>
                                <Description>
                                    <ul>
                                        <li>{strings.overviewRequiredPoint1}</li>
                                        <li>{strings.overviewRequiredPoint2}</li>
                                        <li>{strings.overviewRequiredPoint3}</li>
                                    </ul>
                                </Description>
                            </ListView>
                        </ListView>
                    )}
                    required
                >
                    <RepeatableList
                        addLabel={strings.keyActorsAddButton}
                        onAdd={keyActors.add}
                        error={getErrorString(error?.key_actors)}
                    >
                        {value.key_actors?.map((actor) => (
                            <KeyActorsInput
                                key={actor.client_id}
                                value={actor}
                                onChange={keyActors.update}
                                onRemove={keyActors.remove}
                                error={getErrorObject(keyActorsError?.[actor.client_id])}
                            />
                        ))}
                    </RepeatableList>
                </FieldGroup>
                <FieldGroup
                    heading={strings.technicalWorkingGroupsTitle}
                    description={strings.technicalWorkingGroupDescription}
                    required
                >
                    <BooleanInput
                        name="is_technical_working_groups"
                        ariaLabel={strings.technicalWorkingGroupsTitle}
                        value={value?.is_technical_working_groups}
                        onChange={setFieldValue}
                        error={getErrorString(error?.is_technical_working_groups)}
                    />
                    {value.is_technical_working_groups && (
                        <>
                            <TextInput
                                name="technically_working_group_title"
                                label={strings.technicalWorkingGroupsTitleLabel}
                                value={value?.technically_working_group_title}
                                onChange={setFieldValue}
                                error={getErrorString(error?.technically_working_group_title)}
                            />
                            <TextArea
                                name="technical_working_groups_in_place_description"
                                label={strings.workWithGovernmentDescriptionLabel}
                                value={value?.technical_working_groups_in_place_description}
                                onChange={setFieldValue}
                                error={getErrorString(
                                    error?.technical_working_groups_in_place_description,
                                )}
                                maxWords={wordLimits.technical_working_groups_in_place_description}
                            />
                        </>
                    )}
                </FieldGroup>
            </FormSection>
        </TabPage>
    );
}

export default Overview;
