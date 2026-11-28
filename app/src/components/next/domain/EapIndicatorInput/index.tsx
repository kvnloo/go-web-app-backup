import { useTranslation } from '@ifrc-go/ui/hooks';
import {
    ListView,
    NumberInput,
    RemovableItem,
    TextInput,
} from '@ifrc-go/ui/next';
import {
    type Error,
    getErrorObject,
    getErrorString,
} from '@togglecorp/toggle-form';

import { type IndicatorFormFields } from '#components/domain/EapIndicatorInput/schema';

import i18n from './i18n.json';

interface Props {
    value: IndicatorFormFields;
    /** The row's own error (the list error keyed by its client_id) */
    error: Error<IndicatorFormFields> | undefined;
    onChange: (clientId: string, value: IndicatorFormFields) => void;
    onRemove: (clientId: string) => void;
}

/** One indicator of an EAP operation and its target, as a row of a RepeatableList */
function EapIndicatorInput(props: Props) {
    const {
        value,
        error: errorFromProps,
        onChange,
        onRemove,
    } = props;

    const strings = useTranslation(i18n);
    const error = getErrorObject(errorFromProps);

    const handleTitleChange = (title: string | undefined) => {
        onChange(value.client_id, { ...value, title });
    };
    const handleTargetChange = (target: number | undefined) => {
        onChange(value.client_id, { ...value, target });
    };

    return (
        <RemovableItem
            name={value.client_id}
            onRemove={onRemove}
            removeLabel={strings.eapIndicatorInputRemoveLabel}
            error={getErrorString(errorFromProps)}
        >
            <ListView layout="grid" layoutOptions={{ numPreferredColumns: 2 }}>
                <TextInput
                    name="title"
                    label={strings.eapIndicatorInputTitleLabel}
                    value={value.title}
                    onChange={handleTitleChange}
                    error={getErrorString(error?.title)}
                    required
                />
                <NumberInput
                    name="target"
                    label={strings.eapIndicatorInputTargetLabel}
                    value={value.target}
                    onChange={handleTargetChange}
                    error={getErrorString(error?.target)}
                    required
                />
            </ListView>
        </RemovableItem>
    );
}

export default EapIndicatorInput;
