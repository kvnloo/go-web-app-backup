import { useTranslation } from '@ifrc-go/ui/hooks';
import {
    RemovableItem,
    TextArea,
    TextInput,
} from '@ifrc-go/ui/next';
import {
    type Error,
    getErrorObject,
    getErrorString,
} from '@togglecorp/toggle-form';

import { wordLimits } from '#views/EapFullForm/common';
import { type PartialEapFullFormType } from '#views/EapFullForm/schema';

import i18n from './i18n.json';

type KeyActorsFormFields = NonNullable<
    PartialEapFullFormType['key_actors']
>[number];

interface Props {
    value: KeyActorsFormFields;
    error: Error<KeyActorsFormFields> | undefined;
    onChange: (clientId: string, value: KeyActorsFormFields) => void;
    onRemove: (clientId: string) => void;
}

function KeyActorsInput(props: Props) {
    const {
        value,
        onChange,
        onRemove,
        error: errorFromProps,
    } = props;

    const strings = useTranslation(i18n);
    const error = getErrorObject(errorFromProps);

    const handleFieldChange = (
        fieldValue: string | undefined,
        fieldName: 'partner' | 'description',
    ) => {
        onChange(value.client_id, { ...value, [fieldName]: fieldValue });
    };

    return (
        <RemovableItem
            name={value.client_id}
            onRemove={onRemove}
            removeLabel={strings.overviewKeyActorsDeleteButton}
            error={getErrorString(error)}
        >
            <TextInput
                name="partner"
                label={strings.overviewKeyActorsPartnerLabel}
                placeholder={strings.overviewKeyActorsPartnerPlaceholder}
                value={value.partner}
                onChange={handleFieldChange}
                error={getErrorString(error?.partner)}
                required
            />
            <TextArea
                name="description"
                label={strings.overviewKeyActorsDescriptionLabel}
                value={value.description}
                onChange={handleFieldChange}
                error={getErrorString(error?.description)}
                maxWords={wordLimits.key_actors}
                required
            />
        </RemovableItem>
    );
}

export default KeyActorsInput;
