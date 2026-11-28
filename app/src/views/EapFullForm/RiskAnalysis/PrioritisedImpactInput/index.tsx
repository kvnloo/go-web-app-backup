import { useTranslation } from '@ifrc-go/ui/hooks';
import {
    RemovableItem,
    TextInput,
} from '@ifrc-go/ui/next';
import {
    type Error,
    getErrorObject,
    getErrorString,
} from '@togglecorp/toggle-form';

import { type PartialEapFullFormType } from '#views/EapFullForm/schema';

import i18n from './i18n.json';

type PrioritisedImpactFormFields = NonNullable<
    PartialEapFullFormType['prioritized_impacts']
>[number];

interface Props {
    value: PrioritisedImpactFormFields;
    error: Error<PrioritisedImpactFormFields> | undefined;
    onChange: (clientId: string, value: PrioritisedImpactFormFields) => void;
    onRemove: (clientId: string) => void;
}

function PrioritisedImpactInput(props: Props) {
    const {
        value,
        onChange,
        onRemove,
        error: errorFromProps,
    } = props;

    const strings = useTranslation(i18n);
    const error = getErrorObject(errorFromProps);

    const handleImpactChange = (impact: string | undefined) => {
        onChange(value.client_id, { ...value, impact });
    };

    return (
        <RemovableItem
            name={value.client_id}
            onRemove={onRemove}
            removeLabel={strings.riskAnalysisPrioritisedImpactRemoveLabel}
            error={getErrorString(error)}
        >
            <TextInput
                name="impact"
                ariaLabel={strings.riskAnalysisPrioritisedImpactLabel}
                value={value.impact}
                onChange={handleImpactChange}
                error={getErrorString(error?.impact)}
                required
            />
        </RemovableItem>
    );
}

export default PrioritisedImpactInput;
