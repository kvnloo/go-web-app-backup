import { useTranslation } from '@ifrc-go/ui/hooks';
import {
    Checklist,
    ListView,
    RemovableItem,
    SelectInput,
    TextInput,
} from '@ifrc-go/ui/next';
import {
    resolveToString,
    stringValueSelector,
} from '@ifrc-go/ui/utils';
import { isDefined } from '@togglecorp/fujs';
import {
    type Error,
    getErrorObject,
    getErrorString,
} from '@togglecorp/toggle-form';

import {
    type ActivityInputType,
    type OperationActivityFormFields,
} from '#components/domain/EapOperationActivityInput/schema';
import { type components } from '#generated/types';
import useGlobalEnums from '#hooks/domain/useGlobalEnums';
import {
    TIMEFRAME_DAYS,
    TIMEFRAME_HOURS,
    TIMEFRAME_MONTHS,
    TIMEFRAME_YEAR,
    type TimeFrameEnumKey,
} from '#utils/constants';

import getFixedTimeframe from './utils';

import i18n from './i18n.json';

// NOTE: Simplified EAPs are limited to a two year timeframe
const SIMPLIFIED_EAP_MAX_YEARS = 2;

type TimeframeOption = components['schemas']['EapTimeframeEnum'];
type TimeValueOption = { key: number; value: string };

type ActivationField = 'activation_one' | 'activation_two';
interface ActivationOption {
    key: ActivationField;
    label: string;
}

function timeframeKeySelector(option: TimeframeOption) {
    return option.key;
}

function timeValueKeySelector(option: TimeValueOption) {
    return option.key;
}

function activationKeySelector(option: ActivationOption) {
    return option.key;
}

function activationLabelSelector(option: ActivationOption) {
    return option.label;
}

interface Props {
    value: OperationActivityFormFields;
    /** The row's own error (the list error keyed by its client_id) */
    error: Error<OperationActivityFormFields> | undefined;
    onChange: (clientId: string, value: OperationActivityFormFields) => void;
    onRemove: (clientId: string) => void;
    activityType: ActivityInputType;
    withActivationSelection?: boolean;
    withoutTimeframeSelection?: boolean;
    leadTimeframeUnit?: TimeFrameEnumKey;
    isSimplifiedEap?: boolean;
}

/**
 * One activity of an EAP operation with its activations and when it runs,
 * as a row of a RepeatableList
 */
function EapOperationActivityInput(props: Props) {
    const {
        value,
        error: errorFromProps,
        onChange,
        onRemove,
        activityType,
        withActivationSelection,
        withoutTimeframeSelection,
        leadTimeframeUnit,
        isSimplifiedEap,
    } = props;

    const strings = useTranslation(i18n);
    const error = getErrorObject(errorFromProps);

    const {
        eap_timeframe,
        eap_years_timeframe_value,
        eap_months_timeframe_value,
        eap_days_timeframe_value,
        eap_hours_timeframe_value,
    } = useGlobalEnums();

    const fixedTimeframe = getFixedTimeframe(activityType, leadTimeframeUnit, isSimplifiedEap);
    const isTimeframeFixedToLeadTime = activityType === 'early_action_activities'
        && isDefined(leadTimeframeUnit);
    const isTimeframeLocked = isDefined(fixedTimeframe) && value.timeframe === fixedTimeframe;

    let timeframeOptions = eap_timeframe;
    if (isDefined(fixedTimeframe)) {
        // NOTE: rows saved before the rule can hold another unit; those stay
        // editable, with both units to choose from, so they can be fixed
        timeframeOptions = eap_timeframe?.filter(
            (option) => option.key === fixedTimeframe || option.key === value.timeframe,
        );
    } else if (activityType === 'early_action_activities') {
        timeframeOptions = eap_timeframe?.filter((option) => option.key !== TIMEFRAME_YEAR);
    }

    const getTimeValueOptions = (timeframe: TimeFrameEnumKey | undefined) => {
        switch (timeframe) {
            case TIMEFRAME_YEAR: {
                const yearOptions = eap_years_timeframe_value ?? [];
                return isSimplifiedEap
                    ? yearOptions.filter(({ key }) => key <= SIMPLIFIED_EAP_MAX_YEARS)
                    : yearOptions;
            }
            case TIMEFRAME_MONTHS:
                return eap_months_timeframe_value ?? [];
            case TIMEFRAME_DAYS:
                return eap_days_timeframe_value ?? [];
            case TIMEFRAME_HOURS:
                return eap_hours_timeframe_value ?? [];
            default:
                return [];
        }
    };

    const leadTimeHint = resolveToString(
        strings.eapOperationActivityInputLeadTimeHint,
        {
            sectionName: isSimplifiedEap
                ? strings.eapOperationActivityInputLeadTimeSectionEarlyAction
                : strings.eapOperationActivityInputLeadTimeSectionTrigger,
        },
    );

    const activationOptions: ActivationOption[] = [
        {
            key: 'activation_one',
            label: strings.eapOperationActivityInputActivationOneLabel,
        },
        {
            key: 'activation_two',
            label: strings.eapOperationActivityInputActivationTwoLabel,
        },
    ];
    const selectedActivations = activationOptions
        .map(activationKeySelector)
        .filter((field) => value[field]);

    const handleActivityChange = (activity: string | undefined) => {
        onChange(value.client_id, { ...value, activity });
    };
    const handleActivationsChange = (activations: ActivationField[]) => {
        onChange(value.client_id, {
            ...value,
            activation_one: activations.includes('activation_one'),
            activation_two: activations.includes('activation_two'),
        });
    };
    const handleTimeframeChange = (timeframe: TimeFrameEnumKey | undefined) => {
        // NOTE: the time span is counted in the timeframe's unit
        onChange(value.client_id, { ...value, timeframe, time_value: undefined });
    };
    const handleTimeValueChange = (timeValue: number[]) => {
        onChange(value.client_id, { ...value, time_value: timeValue });
    };

    return (
        <RemovableItem
            name={value.client_id}
            onRemove={onRemove}
            removeLabel={strings.eapOperationActivityInputRemoveLabel}
            error={getErrorString(errorFromProps)}
        >
            <ListView layout="grid" layoutOptions={{ numPreferredColumns: 2 }}>
                <TextInput
                    name="activity"
                    label={strings.eapOperationActivityInputActivityLabel}
                    value={value.activity}
                    onChange={handleActivityChange}
                    error={getErrorString(error?.activity)}
                    required
                />
                <ListView layout="block">
                    {withActivationSelection && (
                        <Checklist
                            name={undefined}
                            label={strings.eapOperationActivityInputActivationLabel}
                            options={activationOptions}
                            keySelector={activationKeySelector}
                            labelSelector={activationLabelSelector}
                            value={selectedActivations}
                            onChange={handleActivationsChange}
                            error={getErrorString(error?.activation_one)
                                ?? getErrorString(error?.activation_two)}
                        />
                    )}
                    {!withoutTimeframeSelection && (
                        <>
                            <SelectInput
                                name="timeframe"
                                label={strings.eapOperationActivityInputTimeframeLabel}
                                options={timeframeOptions}
                                keySelector={timeframeKeySelector}
                                labelSelector={stringValueSelector}
                                value={value.timeframe}
                                onChange={handleTimeframeChange}
                                error={getErrorString(error?.timeframe)}
                                hint={isTimeframeFixedToLeadTime ? leadTimeHint : undefined}
                                // NOTE: false would override a read-only form section
                                readOnly={isTimeframeLocked || undefined}
                                required
                            />
                            {isDefined(value.timeframe) && (
                                <Checklist
                                    name="time_value"
                                    label={strings.eapOperationActivityInputTimeSpanLabel}
                                    options={getTimeValueOptions(value.timeframe)}
                                    keySelector={timeValueKeySelector}
                                    labelSelector={stringValueSelector}
                                    value={value.time_value}
                                    onChange={handleTimeValueChange}
                                    error={getErrorString(error?.time_value)}
                                    hint={isTimeframeFixedToLeadTime
                                        ? strings.eapOperationActivityInputTimeSpanHint
                                        : undefined}
                                    required
                                />
                            )}
                        </>
                    )}
                </ListView>
            </ListView>
        </RemovableItem>
    );
}

export default EapOperationActivityInput;
