import { useTranslation } from '@ifrc-go/ui/hooks';
import {
    ListView,
    RemovableItem,
    TextInput,
} from '@ifrc-go/ui/next';
import {
    type Error,
    getErrorObject,
    getErrorString,
    type PartialForm,
    type PurgeNull,
} from '@togglecorp/toggle-form';

import { type components } from '#generated/types';
import { formatSourceLink } from '#utils/common';

import i18n from './i18n.json';

type EAPSourceInformation = PurgeNull<
    components<'write'>['schemas']['EAPSourceInformation']
> & {
    client_id: string;
};

type SourceInformationFormFields = PartialForm<
    EAPSourceInformation,
    'client_id'
>;

interface Props {
    value: SourceInformationFormFields;
    /** The row's own error (the list error keyed by its client_id) */
    error: Error<SourceInformationFormFields> | undefined;
    onChange: (clientId: string, value: SourceInformationFormFields) => void;
    onRemove: (clientId: string) => void;
}

/** One source of information of an EAP section, as a row of a RepeatableList */
function EAPSourceInformationInput(props: Props) {
    const {
        value,
        error: errorFromProps,
        onChange,
        onRemove,
    } = props;

    const strings = useTranslation(i18n);
    const error = getErrorObject(errorFromProps);

    const handleNameChange = (sourceName: string | undefined) => {
        onChange(value.client_id, { ...value, source_name: sourceName });
    };
    const handleLinkChange = (sourceLink: string | undefined) => {
        onChange(value.client_id, { ...value, source_link: formatSourceLink(sourceLink) });
    };

    return (
        <RemovableItem
            name={value.client_id}
            onRemove={onRemove}
            removeLabel={strings.eapSourceInformationDeleteButton}
            error={getErrorString(errorFromProps)}
        >
            <ListView layout="grid" layoutOptions={{ numPreferredColumns: 2 }}>
                <TextInput
                    name="source_name"
                    label={strings.eapSourceInformationNameLabel}
                    value={value.source_name}
                    error={getErrorString(error?.source_name)}
                    onChange={handleNameChange}
                    required
                />
                <TextInput
                    name="source_link"
                    type="url"
                    label={strings.eapSourceInformationLinkLabel}
                    value={value.source_link}
                    error={getErrorString(error?.source_link)}
                    onChange={handleLinkChange}
                />
            </ListView>
        </RemovableItem>
    );
}

export default EAPSourceInformationInput;
