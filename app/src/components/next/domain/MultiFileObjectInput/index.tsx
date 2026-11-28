import { useTranslation } from '@ifrc-go/ui/hooks';
import {
    Description,
    Image,
    ListView,
    RemovableItem,
    Tag,
    TextInput,
} from '@ifrc-go/ui/next';
import { InputError } from '@ifrc-go/ui/next/base';
import { resolveToString } from '@ifrc-go/ui/utils';
import {
    isDefined,
    isNotDefined,
    isTruthyString,
    randomString,
} from '@togglecorp/fujs';
import {
    type ArrayError,
    getErrorObject,
    getErrorString,
    type SetValueArg,
    useFormArray,
} from '@togglecorp/toggle-form';

import Link from '#components/next/Link';
import {
    getFileNameFromUrl,
    isImageFile,
} from '#utils/common';

import GoMultiFileInput, { type Props as GoMultiFileInputProps } from '../GoMultiFileInput';

import i18n from './i18n.json';

function getFileExtension(fileName: string | undefined) {
    if (isNotDefined(fileName)) {
        return undefined;
    }
    const [, extension] = fileName.match(/\.([^.]+)$/) ?? [];
    return extension?.toUpperCase();
}

type InputValue = {
    id?: number;
    client_id: string;
    caption?: string | null;
};

type OutputValue = {
    id?: number;
    client_id: string;
    caption?: string;
};

type Props<NAME extends string | number> = Omit<
    GoMultiFileInputProps<NAME>,
    'value' | 'onChange' | 'error' | 'withoutPreview'
> & {
    value: InputValue[] | null | undefined;
    onChange: (value: SetValueArg<OutputValue[] | undefined>, name: NAME) => void;
    error: ArrayError<InputValue> | undefined;
};

/**
 * Uploads several files to GO as records: each file is a removable item,
 * and images get a preview and a caption
 */
function MultiFileObjectInput<const NAME extends string | number>(props: Props<NAME>) {
    const {
        name,
        value,
        onChange,
        error: errorFromProps,
        fileIdToUrlMap,
        accept,
        description,
        disabled,
        readOnly,
        ...fileInputProps
    } = props;

    const strings = useTranslation(i18n);
    const previewAlt = strings.multiFileObjectInputPreviewAlt;
    const captionPlaceholder = strings.multiFileObjectInputCaptionPlaceholder;
    const error = getErrorObject(errorFromProps);
    const { setValue: setFileValue, removeValue } = useFormArray(name, onChange);

    const fileIds = value?.map((file) => file.id).filter(isDefined);

    const acceptedFormats = accept
        ?.split(',')
        .map((format) => format.trim())
        .filter(isTruthyString)
        .map((format) => (format === 'image/*'
            ? strings.multiFileObjectInputImagesLabel
            : format.replace(/^\./, '').toUpperCase()));

    const handleFileIdsChange = (newFileIds: number[] | undefined, inputName: NAME) => {
        if (isNotDefined(newFileIds)) {
            onChange(undefined, inputName);
            return;
        }
        newFileIds.forEach((fileId, index) => {
            if (isNotDefined(value?.[index])) {
                setFileValue({ client_id: String(fileId), id: fileId }, index);
            }
        });
    };

    const handleCaptionChange = (caption: string | undefined, index: number) => {
        setFileValue(
            (prevValue) => (prevValue
                ? { ...prevValue, caption }
                : { client_id: randomString(), caption }),
            index,
        );
    };

    return (
        <ListView layout="block">
            {getErrorString(errorFromProps) && (
                <InputError>{getErrorString(errorFromProps)}</InputError>
            )}
            <GoMultiFileInput
                // eslint-disable-next-line react/jsx-props-no-spreading
                {...fileInputProps}
                name={name}
                value={fileIds}
                onChange={handleFileIdsChange}
                fileIdToUrlMap={fileIdToUrlMap}
                accept={accept}
                disabled={disabled}
                readOnly={readOnly}
                withoutPreview
                description={(acceptedFormats?.length ?? 0) > 0 || description ? (
                    <ListView layout="block" spacing="xs">
                        {description}
                        {acceptedFormats && acceptedFormats.length > 0 && (
                            <Description>
                                {resolveToString(
                                    strings.multiFileObjectInputAcceptedFormatsDescription,
                                    { fileFormats: acceptedFormats.join(', ') },
                                )}
                            </Description>
                        )}
                    </ListView>
                ) : undefined}
            />
            {isDefined(value) && value.length > 0 && (
                <ListView
                    layout="grid"
                    spacing="sm"
                    layoutOptions={{ numPreferredColumns: 3 }}
                >
                    {value.map((file, index) => {
                        if (isNotDefined(file.id)) {
                            return null;
                        }
                        const fileError = getErrorObject(error?.[file.client_id]);
                        const fileUrl = fileIdToUrlMap[file.id];
                        const fileName = getFileNameFromUrl(fileUrl);
                        const fileExtension = getFileExtension(fileName);

                        return (
                            <RemovableItem
                                key={file.id}
                                name={index}
                                onRemove={removeValue}
                                removeLabel={strings.multiFileObjectInputRemoveLabel}
                                error={getErrorString(fileError)}
                                disabled={disabled}
                                readOnly={readOnly}
                            >
                                {/* NOTE: only images get a preview and a caption */}
                                {isImageFile(fileUrl) ? (
                                    <>
                                        <Image
                                            alt={file.caption ?? previewAlt}
                                            src={fileUrl}
                                            size="sm"
                                        />
                                        <TextInput
                                            name={index}
                                            label={strings.multiFileObjectInputCaptionLabel}
                                            placeholder={captionPlaceholder}
                                            value={file.caption}
                                            onChange={handleCaptionChange}
                                            error={getErrorString(fileError?.caption)}
                                            disabled={disabled}
                                            readOnly={readOnly}
                                        />
                                    </>
                                ) : (
                                    <ListView spacing="xs" layoutOptions={{ wrap: true }}>
                                        {fileExtension && <Tag label={fileExtension} />}
                                        <Link href={fileUrl} variant="underline">
                                            {fileName}
                                        </Link>
                                    </ListView>
                                )}
                            </RemovableItem>
                        );
                    })}
                </ListView>
            )}
        </ListView>
    );
}

export default MultiFileObjectInput;
