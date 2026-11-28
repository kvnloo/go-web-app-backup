import { useTranslation } from '@ifrc-go/ui/hooks';
import {
    FieldGroup,
    RepeatableList,
    useRepeatableList,
} from '@ifrc-go/ui/next';
import {
    type Error,
    getErrorObject,
    getErrorString,
} from '@togglecorp/toggle-form';

import { type IndicatorFormFields } from '#components/domain/EapIndicatorInput/schema';

import EapIndicatorInput from '../EapIndicatorInput';

import i18n from './i18n.json';

interface Props<NAME> {
    name: NAME;
    value: IndicatorFormFields[] | undefined;
    onChange: (value: IndicatorFormFields[], name: NAME) => void;
    error: Error<IndicatorFormFields[]> | undefined;
}

/**
 * The indicators of an EAP operation as one FieldGroup of removable rows.
 * Disabled and read-only states come from the surrounding form section.
 */
function EapIndicatorListInput<const NAME>(props: Props<NAME>) {
    const {
        name,
        value,
        onChange,
        error,
    } = props;

    const strings = useTranslation(i18n);
    const indicators = useRepeatableList(name, value, onChange);
    const indicatorsError = getErrorObject(error);

    return (
        <FieldGroup
            heading={strings.eapIndicatorListInputHeading}
            required
        >
            <RepeatableList
                addLabel={strings.eapIndicatorListInputAddLabel}
                onAdd={indicators.add}
                error={getErrorString(error)}
            >
                {value?.map((indicator) => (
                    <EapIndicatorInput
                        key={indicator.client_id}
                        value={indicator}
                        onChange={indicators.update}
                        onRemove={indicators.remove}
                        error={getErrorObject(indicatorsError?.[indicator.client_id])}
                    />
                ))}
            </RepeatableList>
        </FieldGroup>
    );
}

export default EapIndicatorListInput;
