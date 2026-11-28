import { useTranslation } from '@ifrc-go/ui/hooks';
import {
    DataDisplay,
    Description,
    FieldGroup,
    FormSection,
    ListView,
    NumberInput,
    Text,
    TextArea,
} from '@ifrc-go/ui/next';
import { sumSafe } from '@ifrc-go/ui/utils';
import {
    type EntriesAsList,
    type Error,
    getErrorObject,
    getErrorString,
    type SetBaseValueArg,
} from '@togglecorp/toggle-form';

import GoSingleFileInput from '#components/next/domain/GoSingleFileInput';
import Link from '#components/next/Link';
import TabPage from '#components/TabPage';
import { useRequest } from '#utils/restRequest';

import { wordLimits } from '../common';
import { type PartialEapFullFormType } from '../schema';
import SectionQualityCriteria from '../SectionQualityCriteria';

import i18n from './i18n.json';

type BudgetFieldName = 'readiness_budget' | 'pre_positioning_budget' | 'early_action_budget';

interface Props {
    value: PartialEapFullFormType;
    setFieldValue: (...entries: EntriesAsList<PartialEapFullFormType>) => void;
    setValue: (value: SetBaseValueArg<PartialEapFullFormType>) => void;
    error: Error<PartialEapFullFormType> | undefined;
    disabled?: boolean;
    fileIdToUrlMap: Record<number, string>;
    setFileIdToUrlMap?: React.Dispatch<
        React.SetStateAction<Record<number, string>>
    >;
    readOnly?: boolean;
    isRevision?: boolean;
}

function FinanceLogistics(props: Props) {
    const {
        value,
        setFieldValue,
        setValue,
        error: formError,
        disabled,
        fileIdToUrlMap,
        setFileIdToUrlMap,
        readOnly,
        isRevision,
    } = props;

    const strings = useTranslation(i18n);
    const error = getErrorObject(formError);

    const { response: templateUrl } = useRequest({
        url: '/api/v2/eap/global-files/{template_type}/',
        pathVariables: {
            template_type: 'budget_template',
        },
    });

    const setBudgetValue = (budgetValue: number | undefined, name: BudgetFieldName) => {
        setValue((prevValue) => {
            const newBudgetValue = {
                readiness_budget: prevValue.readiness_budget,
                pre_positioning_budget: prevValue.pre_positioning_budget,
                early_action_budget: prevValue.early_action_budget,
                [name]: budgetValue,
            };

            return {
                ...prevValue,
                [name]: budgetValue,
                total_budget: sumSafe([
                    newBudgetValue.readiness_budget,
                    newBudgetValue.pre_positioning_budget,
                    newBudgetValue.early_action_budget,
                ]),
            };
        });
    };

    return (
        <TabPage
            spacingOffset={-6}
            headerAction={(
                <SectionQualityCriteria
                    heading={strings.financeSectionHeading}
                    content={(
                        <ListView layout="block">
                            <ListView layout="block" spacing="xs">
                                <Text variant="strong">{strings.financeCriteriaIntroduction11}</Text>
                                <Text>{strings.financeCriteriaIntroduction12}</Text>
                                <Description>{strings.financeCriteriaComment1}</Description>
                            </ListView>
                            <ListView layout="block" spacing="xs">
                                <Text variant="strong">{strings.financeCriteriaIntroduction2}</Text>
                                <Description>{strings.financeCriteriaComment2}</Description>
                            </ListView>
                            <ListView layout="block" spacing="xs">
                                <Text variant="strong">{strings.financeCriteriaIntroduction31}</Text>
                                <Text>{strings.financeCriteriaIntroduction32}</Text>
                                <Description>{strings.financeCriteriaComment3}</Description>
                            </ListView>
                        </ListView>
                    )}
                />
            )}
        >
            <FormSection
                heading={strings.financeHeading}
                disabled={disabled}
                readOnly={readOnly}
            >
                <FieldGroup
                    heading={strings.financeBudgetTitle}
                    description={(
                        <ul>
                            <li>{strings.financeBudgetDescription1}</li>
                            <li>{strings.financeBudgetDescription2}</li>
                            <li>{strings.financeBudgetDescription3}</li>
                            <li>{strings.financeBudgetDescription4}</li>
                        </ul>
                    )}
                    info={(
                        <ListView layout="block" spacing="xs">
                            <Text variant="strong">{strings.financeExplanatoryNoteLabel}</Text>
                            <Description>{strings.financeExplanatoryNote}</Description>
                        </ListView>
                    )}
                    required
                    error={getErrorString(error?.total_budget)}
                >
                    <DataDisplay
                        label={strings.financeTotalBudgetLabel}
                        valueType="number"
                        value={value.total_budget}
                    />
                    <TextArea
                        name="budget_description"
                        label={strings.financeDescriptionLabel}
                        value={value?.budget_description}
                        onChange={setFieldValue}
                        error={getErrorString(error?.budget_description)}
                        maxWords={wordLimits.budget_description}
                    />
                </FieldGroup>
                <FieldGroup
                    heading={strings.financeBudgetDetails}
                    description={(
                        <Link href={templateUrl?.url} variant="underline">
                            {strings.financeDownloadDescription}
                        </Link>
                    )}
                    required
                >
                    <GoSingleFileInput
                        name="budget_file"
                        url="/api/v2/eap-file/"
                        accept=".xlsx, .xlsm"
                        value={value?.budget_file}
                        onChange={setFieldValue}
                        error={getErrorString(error?.budget_file)}
                        fileIdToUrlMap={fileIdToUrlMap}
                        setFileIdToUrlMap={setFileIdToUrlMap}
                        clearable
                        useCurrentLanguageForMutation
                    >
                        {strings.financeUploadButtonLabel}
                    </GoSingleFileInput>
                </FieldGroup>
                <FieldGroup
                    heading={strings.financeReadinessCostTitle}
                    description={(
                        <ul>
                            <li>{strings.financeReadinessCostDescription1}</li>
                            <li>{strings.financeReadinessCostDescription2}</li>
                        </ul>
                    )}
                    info={(
                        <ListView layout="block">
                            <ListView layout="block" spacing="xs">
                                <Text variant="strong">{strings.financeExplanatoryNoteLabel}</Text>
                                <Description>
                                    {strings.financeReadinessCostExplanatoryNote}
                                </Description>
                            </ListView>
                            <ListView layout="block" spacing="xs">
                                <Text variant="strong">{strings.financeRequiredPointsLabel}</Text>
                                <Description>
                                    <ul>
                                        <li>{strings.financeReadinessCostDescription1}</li>
                                        <li>{strings.financeReadinessCostDescription2}</li>
                                    </ul>
                                </Description>
                            </ListView>
                        </ListView>
                    )}
                    required
                >
                    <NumberInput
                        name="readiness_budget"
                        label={strings.financeReadinessBudgetLabel}
                        value={value?.readiness_budget}
                        onChange={setBudgetValue}
                        error={getErrorString(error?.readiness_budget)}
                        required
                    />
                    <TextArea
                        name="readiness_cost_description"
                        label={strings.financeDescriptionLabel}
                        value={value?.readiness_cost_description}
                        onChange={setFieldValue}
                        error={getErrorString(error?.readiness_cost_description)}
                        maxWords={wordLimits.readiness_cost_description}
                    />
                </FieldGroup>
                <FieldGroup
                    heading={strings.financePrePositioningTitle}
                    description={(
                        <ul>
                            <li>{strings.financePrePositioningDescription1}</li>
                            <li>{strings.financePrePositioningDescription2}</li>
                            <li>{strings.financePrePositioningDescription3}</li>
                        </ul>
                    )}
                    info={(
                        <ListView layout="block">
                            <ListView layout="block" spacing="xs">
                                <Text variant="strong">{strings.financeExplanatoryNoteLabel}</Text>
                                <Description>
                                    {strings.financePrePositioningExplanatoryNote}
                                </Description>
                            </ListView>
                            <ListView layout="block" spacing="xs">
                                <Text variant="strong">{strings.financeRequiredPointsLabel}</Text>
                                <Description>
                                    <ul>
                                        <li>{strings.financePrePositioningDescription1}</li>
                                        <li>{strings.financePrePositioningDescription2}</li>
                                        <li>{strings.financePrePositioningDescription3}</li>
                                    </ul>
                                </Description>
                            </ListView>
                        </ListView>
                    )}
                    required
                >
                    <NumberInput
                        name="pre_positioning_budget"
                        label={strings.financePrePositioningBudgetLabel}
                        value={value?.pre_positioning_budget}
                        onChange={setBudgetValue}
                        error={getErrorString(error?.pre_positioning_budget)}
                        required
                    />
                    <TextArea
                        name="prepositioning_cost_description"
                        label={strings.financeDescriptionLabel}
                        value={value?.prepositioning_cost_description}
                        onChange={setFieldValue}
                        error={getErrorString(error?.prepositioning_cost_description)}
                        maxWords={wordLimits.prepositioning_cost_description}
                    />
                </FieldGroup>
                <FieldGroup
                    heading={strings.financeEarlyActionCostTitle}
                    description={(
                        <ul>
                            <li>{strings.financeEarlyActionCostDescription1}</li>
                            <li>{strings.financeEarlyActionCostDescription2}</li>
                            <li>{strings.financeEarlyActionCostDescription3}</li>
                            <li>{strings.financeEarlyActionCostDescription4}</li>
                        </ul>
                    )}
                    info={(
                        <ListView layout="block">
                            <ListView layout="block" spacing="xs">
                                <Text variant="strong">{strings.financeExplanatoryNoteLabel}</Text>
                                <Description>
                                    {strings.financeEarlyActionCostExplanatoryNote}
                                </Description>
                            </ListView>
                            <ListView layout="block" spacing="xs">
                                <Text variant="strong">{strings.financeRequiredPointsLabel}</Text>
                                <Description>
                                    <ul>
                                        <li>{strings.financeEarlyActionCostDescription1}</li>
                                        <li>{strings.financeEarlyActionCostDescription2}</li>
                                        <li>{strings.financeEarlyActionCostDescription3}</li>
                                        <li>{strings.financeEarlyActionCostDescription4}</li>
                                    </ul>
                                </Description>
                            </ListView>
                        </ListView>
                    )}
                    required
                >
                    <NumberInput
                        name="early_action_budget"
                        label={strings.financeEarlyActionBudgetLabel}
                        value={value?.early_action_budget}
                        onChange={setBudgetValue}
                        error={getErrorString(error?.early_action_budget)}
                        required
                    />
                    <TextArea
                        name="early_action_cost_description"
                        label={strings.financeDescriptionLabel}
                        value={value?.early_action_cost_description}
                        onChange={setFieldValue}
                        error={getErrorString(error?.early_action_cost_description)}
                        maxWords={wordLimits.early_action_cost_description}
                    />
                </FieldGroup>
            </FormSection>
            <FormSection
                heading={strings.financeEapEndorsementHeading}
                disabled={disabled}
                readOnly={readOnly}
            >
                <FieldGroup
                    heading={strings.financeEapEndorsementTitle}
                    description={strings.financeEapEndorsementDescription}
                    info={(
                        <ListView layout="block" spacing="xs">
                            <Text variant="strong">{strings.financeExplanatoryNoteLabel}</Text>
                            <Description>
                                {strings.financeEapEndorsementExplanatoryNote}
                            </Description>
                        </ListView>
                    )}
                    required
                >
                    <TextArea
                        name="eap_endorsement"
                        label={strings.financeDescriptionLabel}
                        value={value?.eap_endorsement}
                        onChange={setFieldValue}
                        error={getErrorString(error?.eap_endorsement)}
                        maxWords={wordLimits.eap_endorsement}
                    />
                </FieldGroup>
            </FormSection>
            {isRevision && (
                <FormSection
                    disabled={disabled}
                    readOnly={readOnly}
                >
                    <FieldGroup
                        heading={strings.updatedChecklistTitle}
                        description={strings.updatedChecklistDescription}
                        required
                    >
                        <GoSingleFileInput
                            name="updated_checklist_file"
                            url="/api/v2/eap-file/"
                            accept=".pdf, .docx, .pptx, .xlsx, .xlsm"
                            value={value?.updated_checklist_file}
                            onChange={setFieldValue}
                            error={getErrorString(error?.updated_checklist_file)}
                            fileIdToUrlMap={fileIdToUrlMap}
                            setFileIdToUrlMap={setFileIdToUrlMap}
                            clearable
                        >
                            {strings.financeUploadButtonLabel}
                        </GoSingleFileInput>
                    </FieldGroup>
                </FormSection>
            )}
        </TabPage>
    );
}

export default FinanceLogistics;
