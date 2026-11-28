import { type ActivityInputType } from '#components/domain/EapOperationActivityInput/schema';
import {
    TIMEFRAME_YEAR,
    type TimeFrameEnumKey,
} from '#utils/constants';

/**
 * The timeframe an activity of this kind is held to, if any: readiness runs
 * yearly, early actions follow the lead time of the trigger. Full EAP
 * pre-positioning is untimed.
 */
function getFixedTimeframe(
    name: ActivityInputType,
    leadTimeframeUnit: TimeFrameEnumKey | undefined,
    isSimplifiedEap: boolean | undefined,
): TimeFrameEnumKey | undefined {
    if (name === 'readiness_activities'
        || (name === 'prepositioning_activities' && isSimplifiedEap)) {
        return TIMEFRAME_YEAR;
    }
    if (name === 'early_action_activities') {
        return leadTimeframeUnit;
    }
    return undefined;
}

export default getFixedTimeframe;
