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

type PlannedOperationFormFields = NonNullable<
    PartialEapFullFormType['planned_operations']
>[number];

type EapSectorApCodeOption = NonNullable<GoApiResponse<'/api/v2/eap/options/'>['sector_ap_codes']>;

interface Props {
    value: PlannedOperationFormFields;
    /** The row's own error (the list error keyed by its sector) */
    error: Error<PlannedOperationFormFields> | undefined;
    onChange: (value: PlannedOperationFormFields, index: number) => void;
    onRemove: (index: number) => void;
    index: number;
    operationTitle?: React.ReactNode;
    sectorApCodeOption?: EapSectorApCodeOption;
    leadTimeframeUnit?: TimeFrameEnumKey;
}

function OperationsInput(props: Props) {
    const {
        value,
        error: errorFromProps,
        onChange,
        onRemove,
        index,
        operationTitle,
        sectorApCodeOption,
        leadTimeframeUnit,
    } = props;

    const strings = useTranslation(i18n);
    const { readOnly } = useContext(FormStateContext);
    const error = getErrorObject(errorFromProps);

    const apCodeValue = sectorApCodeOption?.[value.sector]?.join(', ');

    const handleFieldChange = <K extends keyof PlannedOperationFormFields>(
        fieldValue: PlannedOperationFormFields[K],
        fieldName: K,
    ) => {
        onChange({ ...value, [fieldName]: fieldValue }, index);
    };

    return (
        <ExpandableSection
            heading={operationTitle ?? '--'}
            initiallyExpanded
        >
            <ListView layout="grid" layoutOptions={{ numPreferredColumns: 3 }}>
                <NumberInput
                    name="people_targeted"
                    label={strings.selectionActionsPlannedOperationPeopleTargeted}
                    value={value.people_targeted}
                    onChange={handleFieldChange}
                    error={getErrorString(error?.people_targeted)}
                    required
                />
                <NumberInput
                    name="budget_per_sector"
                    label={strings.selectionActionsPlannedOperationBudget}
                    value={value.budget_per_sector}
                    onChange={handleFieldChange}
                    error={getErrorString(error?.budget_per_sector)}
                    required
                />
                <TextInput
                    name={undefined}
                    label={strings.selectionActionsPlannedOperationApCode}
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
                        confirmMessage={strings.plannedOperationSectorRemoveConfirmation}
                    >
                        {strings.selectionActionsPlannedOperationRemoveButton}
                    </Button>
                </ListView>
            )}
        </ExpandableSection>
    );
}

export default OperationsInput;
