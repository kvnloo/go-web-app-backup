import { useTranslation } from '@ifrc-go/ui/hooks';
import {
    Description,
    FieldGroup,
    RepeatableList,
    useRepeatableList,
} from '@ifrc-go/ui/next';
import {
    type Error,
    getErrorObject,
    getErrorString,
} from '@togglecorp/toggle-form';

import {
    type ActivityInputType,
    type OperationActivityFormFields,
} from '#components/domain/EapOperationActivityInput/schema';
import { type TimeFrameEnumKey } from '#utils/constants';

import EapOperationActivityInput from '../EapOperationActivityInput';
import getFixedTimeframe from '../EapOperationActivityInput/utils';

import i18n from './i18n.json';

interface Props<NAME extends ActivityInputType> {
    /** The kind of activities, which also picks the heading and the timeframe rules */
    name: NAME;
    value: OperationActivityFormFields[] | undefined;
    onChange: (value: OperationActivityFormFields[], name: NAME) => void;
    error: Error<OperationActivityFormFields[]> | undefined;
    withActivationSelection?: boolean;
    withoutTimeframeSelection?: boolean;
    leadTimeframeUnit?: TimeFrameEnumKey;
    isSimplifiedEap?: boolean;
}

/**
 * The readiness, pre-positioning or early action activities of an EAP
 * operation as one FieldGroup of removable rows. Disabled and read-only
 * states come from the surrounding form section.
 */
function EapOperationActivityListInput<const NAME extends ActivityInputType>(
    props: Props<NAME>,
) {
    const {
        name,
        value,
        onChange,
        error,
        withActivationSelection,
        withoutTimeframeSelection,
        leadTimeframeUnit,
        isSimplifiedEap,
    } = props;

    const strings = useTranslation(i18n);
    const activities = useRepeatableList(name, value, onChange);
    const activitiesError = getErrorObject(error);

    const headings: Record<ActivityInputType, {
        heading: string;
        description: string;
        info: string;
    }> = {
        readiness_activities: {
            heading: strings.eapOperationActivityListInputReadinessTitle,
            description: strings.eapOperationActivityListInputReadinessTitleDescription,
            info: strings.eapOperationActivityListInputReadinessDescription,
        },
        prepositioning_activities: {
            heading: strings.eapOperationActivityListInputPrepositioningTitle,
            description: strings.eapOperationActivityListInputPrepositioningTitleDescription,
            info: strings.eapOperationActivityListInputPrepositioningDescription,
        },
        early_action_activities: {
            heading: strings.eapOperationActivityListInputEarlyActionTitle,
            description: strings.eapOperationActivityListInputEarlyActionTitleDescription,
            info: strings.eapOperationActivityListInputEarlyActionDescription,
        },
    };
    const { heading, description, info } = headings[name];

    const handleAdd = () => {
        activities.add({
            timeframe: getFixedTimeframe(name, leadTimeframeUnit, isSimplifiedEap),
        });
    };

    return (
        <FieldGroup
            heading={heading}
            description={description}
            info={<Description>{info}</Description>}
        >
            <RepeatableList
                addLabel={strings.eapOperationActivityListInputAddLabel}
                onAdd={handleAdd}
                error={getErrorString(error)}
            >
                {value?.map((activity) => (
                    <EapOperationActivityInput
                        key={activity.client_id}
                        value={activity}
                        onChange={activities.update}
                        onRemove={activities.remove}
                        error={getErrorObject(activitiesError?.[activity.client_id])}
                        activityType={name}
                        withActivationSelection={withActivationSelection}
                        withoutTimeframeSelection={withoutTimeframeSelection}
                        leadTimeframeUnit={leadTimeframeUnit}
                        isSimplifiedEap={isSimplifiedEap}
                    />
                ))}
            </RepeatableList>
        </FieldGroup>
    );
}

export default EapOperationActivityListInput;
