import { useContext } from 'react';
import { DeleteBinTwoLineIcon } from '@ifrc-go/icons';
import { FormStateContext } from '@ifrc-go/ui/contexts';
import { useTranslation } from '@ifrc-go/ui/hooks';
import {
    Button,
    ExpandableSection,
    ListView,
    NumberInput,
    TextInput,
} from '@ifrc-go/ui/next';
import { noOp } from '@togglecorp/fujs';
import {
    type Error,
    getErrorObject,
    getErrorString,
} from '@togglecorp/toggle-form';

import EapIndicatorListInput from '#components/next/domain/EapIndicatorListInput';
import EapOperationActivityListInput from '#components/next/domain/EapOperationActivityListInput';
import { type TimeFrameEnumKey } from '#utils/constants';
import { type GoApiResponse } from '#utils/restRequest';

import { type PartialEapFullFormType } from '../../schema';

import i18n from './i18n.json';

type EnableApproachesFormFields = NonNullable<PartialEapFullFormType['enabling_approaches']>[number];

type EapApproachApCodeOption = NonNullable<GoApiResponse<'/api/v2/eap/options/'>['approach_ap_codes']>;

interface Props {
    value: EnableApproachesFormFields;
    /** The row's own error (the list error keyed by its approach) */
    error: Error<EnableApproachesFormFields> | undefined;
    onChange: (value: EnableApproachesFormFields, index: number) => void;
    onRemove: (index: number) => void;
    index: number;
    approachTitle?: React.ReactNode;
    approachApCodeOption?: EapApproachApCodeOption;
    leadTimeframeUnit?: TimeFrameEnumKey;
}

function ApproachesInput(props: Props) {
    const {
        value,
        error: errorFromProps,
        onChange,
        onRemove,
        index,
        approachTitle,
        approachApCodeOption,
        leadTimeframeUnit,
    } = props;

    const strings = useTranslation(i18n);
    const { readOnly } = useContext(FormStateContext);
    const error = getErrorObject(errorFromProps);

    const apCodeValue = approachApCodeOption?.[value.approach]?.join(', ');

    const handleFieldChange = <K extends keyof EnableApproachesFormFields>(
        fieldValue: EnableApproachesFormFields[K],
        fieldName: K,
    ) => {
        onChange({ ...value, [fieldName]: fieldValue }, index);
    };

    return (
        <ExpandableSection
            heading={approachTitle ?? '--'}
            initiallyExpanded
        >
            <ListView layout="grid" layoutOptions={{ numPreferredColumns: 3 }}>
                <NumberInput
                    name="budget_per_approach"
                    label={strings.approachBudget}
                    value={value.budget_per_approach}
                    onChange={handleFieldChange}
                    error={getErrorString(error?.budget_per_approach)}
                    required
                />
                <TextInput
                    name={undefined}
                    label={strings.approachApCode}
                    value={apCodeValue}
                    onChange={noOp}
                    readOnly
                />
            </ListView>
            <EapIndicatorListInput
                name="indicators"
                value={value.indicators}
                onChange={handleFieldChange}
                error={error?.indicators}
            />
            <EapOperationActivityListInput
                name="readiness_activities"
                value={value.readiness_activities}
                onChange={handleFieldChange}
                error={error?.readiness_activities}
            />
            <EapOperationActivityListInput
                name="prepositioning_activities"
                value={value.prepositioning_activities}
                onChange={handleFieldChange}
                error={error?.prepositioning_activities}
                withActivationSelection
                withoutTimeframeSelection
            />
            <EapOperationActivityListInput
                name="early_action_activities"
                value={value.early_action_activities}
                onChange={handleFieldChange}
                error={error?.early_action_activities}
                withActivationSelection
                leadTimeframeUnit={leadTimeframeUnit}
            />
            {!readOnly && (
                <ListView layoutOptions={{ align: 'end' }}>
                    <Button
                        name={index}
                        variant="tertiary"
                        before={<DeleteBinTwoLineIcon />}
                        onConfirm={onRemove}
                        confirmMessage={strings.enablingApproachRemoveConfirmation}
                    >
                        {strings.approachRemoveButton}
                    </Button>
                </ListView>
            )}
        </ExpandableSection>
    );
}

export default ApproachesInput;
