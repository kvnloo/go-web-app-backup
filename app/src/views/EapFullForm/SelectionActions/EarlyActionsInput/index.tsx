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

type EarlyActionsFormFields = NonNullable<
    PartialEapFullFormType['early_actions']
>[number];

interface Props {
    value: EarlyActionsFormFields;
    error: Error<EarlyActionsFormFields> | undefined;
    onChange: (clientId: string, value: EarlyActionsFormFields) => void;
    onRemove: (clientId: string) => void;
}

function EarlyActionsInput(props: Props) {
    const {
        value,
        error: errorFromProps,
        onChange,
        onRemove,
    } = props;

    const strings = useTranslation(i18n);
    const error = getErrorObject(errorFromProps);

    const handleActionChange = (action: string | undefined) => {
        onChange(value.client_id, { ...value, action });
    };

    return (
        <RemovableItem
            name={value.client_id}
            onRemove={onRemove}
            removeLabel={strings.selectionActionsEarlyActionRemoveLabel}
            error={getErrorString(errorFromProps)}
        >
            <TextInput
                name="action"
                label={strings.selectionActionsEarlyActionLabel}
                value={value.action}
                onChange={handleActionChange}
                error={getErrorString(error?.action)}
                required
            />
        </RemovableItem>
    );
}

export default EarlyActionsInput;
