import {
    type Dispatch,
    type SetStateAction,
} from 'react';
import { useTranslation } from '@ifrc-go/ui/hooks';
import {
    Image,
    ListView,
    TextInput,
} from '@ifrc-go/ui/next';
import { InputError } from '@ifrc-go/ui/next/base';
import {
    isDefined,
    randomString,
} from '@togglecorp/fujs';
import {
    type Error,
    getErrorObject,
    getErrorString,
    type SetValueArg,
    useFormObject,
} from '@togglecorp/toggle-form';

import GoSingleFileInput, { type SupportedPaths } from '../GoSingleFileInput';

import i18n from './i18n.json';

type ImageWithCaptionValue = {
    id?: number;
    client_id: string;
    caption?: string | null;
};

type OutputValue = {
    id?: number;
    client_id: string;
    caption?: string;
};

interface Props<NAME> {
    name: NAME;
    /** Where the image is uploaded */
    url: SupportedPaths;
    value: ImageWithCaptionValue | null | undefined;
    onChange: (value: SetValueArg<OutputValue> | undefined, name: NAME) => void;
    error: Error<ImageWithCaptionValue> | undefined;
    fileIdToUrlMap: Record<number, string>;
    setFileIdToUrlMap?: Dispatch<SetStateAction<Record<number, string>>>;
    /** The file button label; defaults to "Select an Image" */
    label?: React.ReactNode;
    before?: React.ReactNode;
    useCurrentLanguageForMutation?: boolean;
    /** Defaults to the surrounding form section or page */
    disabled?: boolean;
    /** Defaults to the surrounding form section or page */
    readOnly?: boolean;
}

/** Uploads one image to GO with a preview and a caption */
function ImageWithCaptionInput<const NAME extends string | number>(props: Props<NAME>) {
    const strings = useTranslation(i18n);

    const {
        name,
        url,
        value,
        onChange,
        error: errorFromProps,
        fileIdToUrlMap,
        setFileIdToUrlMap,
        label = strings.imageWithCaptionInputSelectLabel,
        before,
        useCurrentLanguageForMutation,
        disabled,
        readOnly,
    } = props;

    const setFieldValue = useFormObject(name, onChange, () => ({ client_id: randomString() }));
    const error = getErrorObject(errorFromProps);

    const fileUrl = isDefined(value?.id) ? fileIdToUrlMap[value.id] : undefined;

    const handleFileChange = (newFileId: number | undefined) => {
        if (isDefined(newFileId)) {
            setFieldValue(newFileId, 'id');
        } else {
            onChange(undefined, name);
        }
    };

    return (
        <ListView layout="block" spacing="xs">
            {getErrorString(errorFromProps) && (
                <InputError>{getErrorString(errorFromProps)}</InputError>
            )}
            <GoSingleFileInput
                name="id"
                accept="image/*"
                value={value?.id}
                onChange={handleFileChange}
                url={url}
                fileIdToUrlMap={fileIdToUrlMap}
                setFileIdToUrlMap={setFileIdToUrlMap}
                before={before}
                clearable
                useCurrentLanguageForMutation={useCurrentLanguageForMutation}
                error={getErrorString(error?.id)}
                description={isDefined(fileUrl) && (
                    <Image
                        alt={value?.caption ?? strings.imageWithCaptionInputPreviewAlt}
                        src={fileUrl}
                        size="sm"
                    />
                )}
                disabled={disabled}
                readOnly={readOnly}
            >
                {label}
            </GoSingleFileInput>
            {isDefined(value?.id) && isDefined(fileUrl) && (
                <TextInput
                    name="caption"
                    label={strings.imageWithCaptionInputCaptionLabel}
                    placeholder={strings.imageWithCaptionInputCaptionPlaceholder}
                    value={value?.caption}
                    onChange={setFieldValue}
                    error={getErrorString(error?.caption)}
                    disabled={disabled}
                    readOnly={readOnly}
                />
            )}
        </ListView>
    );
}

export default ImageWithCaptionInput;
