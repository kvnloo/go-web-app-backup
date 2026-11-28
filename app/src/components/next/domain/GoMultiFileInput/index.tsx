import {
    type Dispatch,
    type SetStateAction,
    useContext,
} from 'react';
import { DeleteBinTwoLineIcon } from '@ifrc-go/icons';
import { FormStateContext } from '@ifrc-go/ui/contexts';
import { useTranslation } from '@ifrc-go/ui/hooks';
import {
    type ButtonVariant,
    Description,
    FileInputButton,
    IconButton,
    InlineView,
    ListView,
} from '@ifrc-go/ui/next';
import { InputError } from '@ifrc-go/ui/next/base';
import { resolveToString } from '@ifrc-go/ui/utils';
import {
    isDefined,
    isNotDefined,
} from '@togglecorp/fujs';
import { nonFieldError } from '@togglecorp/toggle-form';

import Link from '#components/next/Link';
import useAlert from '#hooks/useAlert';
import {
    getFileNameFromUrl,
    isFileAccepted,
} from '#utils/common';
import { useLazyRequest } from '#utils/restRequest';
import { transformObjectError } from '#utils/restRequest/error';

import i18n from './i18n.json';

export type SupportedPaths = '/api/v2/per-file/multiple/'
    | '/api/v2/dref-files/multiple/'
    | '/api/v2/flash-update-file/multiple/'
    | '/api/v2/eap-file/multiple/';

interface FileUploadResult {
    id: number;
    file: string;
}

export interface Props<NAME> {
    name: NAME;
    /** The ids of the uploaded files */
    value: number[] | undefined | null;
    onChange: (value: number[] | undefined, name: NAME) => void;
    /** Where the files are uploaded */
    url: SupportedPaths;
    /** Uploaded file ids and their URLs, for the links to the chosen files */
    fileIdToUrlMap: Record<number, string>;
    setFileIdToUrlMap?: Dispatch<SetStateAction<Record<number, string>>>;
    useCurrentLanguageForMutation?: boolean;
    /** The button label */
    children: React.ReactNode;
    /** File types to offer, such as ".pdf,.docx" or "image/*" */
    accept?: string;
    variant?: ButtonVariant;
    before?: React.ReactNode;
    /** Shows a button that removes every file */
    clearable?: boolean;
    /** Shown under the files */
    description?: React.ReactNode;
    error?: React.ReactNode;
    /** Leaves the list of chosen files out, for an input that shows them itself */
    withoutPreview?: boolean;
    /** Defaults to the surrounding form section or page */
    disabled?: boolean;
    /** Defaults to the surrounding form section or page */
    readOnly?: boolean;
}

/** Uploads several files to GO and holds their ids */
function GoMultiFileInput<const NAME>(props: Props<NAME>) {
    const {
        name,
        value,
        onChange,
        url,
        fileIdToUrlMap,
        setFileIdToUrlMap,
        useCurrentLanguageForMutation = false,
        children,
        accept,
        variant,
        before,
        clearable,
        description,
        error,
        withoutPreview,
        disabled,
        readOnly: readOnlyFromProps,
    } = props;

    const strings = useTranslation(i18n);
    const alert = useAlert();
    const formState = useContext(FormStateContext);
    const readOnly = readOnlyFromProps ?? formState.readOnly;

    const {
        pending,
        trigger: triggerFileUpload,
    } = useLazyRequest({
        formData: true,
        url,
        method: 'POST',
        useCurrentLanguageForMutation,
        body: (body: { files: File[] }) => {
            const formData = new FormData();
            body.files.forEach((file) => {
                formData.append('file', file);
            });
            // FIXME: the server types the response and the body the same
            return formData.getAll('file') as never;
        },
        onSuccess: (responseUnsafe) => {
            // FIXME: the server types the response as one file
            const response = responseUnsafe as unknown as FileUploadResult[];
            setFileIdToUrlMap?.((oldMap) => {
                const newMap = { ...oldMap };
                response.forEach((item) => {
                    newMap[item.id] = item.file;
                });
                return newMap;
            });
            onChange([...(value ?? []), ...response.map((item) => item.id)], name);
        },
        onFailure: ({ value: { formErrors } }) => {
            const err = transformObjectError(formErrors, () => undefined);
            const serverErrorMessage = err?.[nonFieldError] || (
                typeof err?.file === 'object' ? undefined : err?.file
            );
            alert.show(
                strings.goMultiFileInputUploadFailedMessage,
                { variant: 'danger', description: serverErrorMessage },
            );
        },
    });

    const handleFilesChange = (files: File[] | undefined) => {
        if (isNotDefined(files) || files.length === 0) {
            return;
        }
        const acceptedFiles = files.filter((file) => isFileAccepted(file, accept));
        const rejectedFiles = files.filter((file) => !isFileAccepted(file, accept));

        if (rejectedFiles.length > 0) {
            alert.show(
                strings.goMultiFileInputUnsupportedFormatMessage,
                {
                    variant: 'danger',
                    description: resolveToString(
                        strings.goMultiFileInputUnsupportedFormatDescription,
                        {
                            fileNames: rejectedFiles.map((file) => file.name).join(', '),
                            fileFormats: accept ?? '',
                        },
                    ),
                },
            );
        }
        if (acceptedFiles.length > 0) {
            triggerFileUpload({ files: acceptedFiles });
        }
    };

    const handleClear = () => {
        onChange(undefined, name);
    };

    const handleFileRemove = (fileId: number) => {
        onChange(value?.filter((id) => id !== fileId), name);
    };

    // NOTE: an undefined state falls back to the surrounding form section
    const inputDisabled = pending ? true : disabled;
    const hasFiles = isDefined(value) && value.length > 0;

    return (
        <ListView layout="block" spacing="sm">
            <ListView spacing="sm" layoutOptions={{ wrap: true }}>
                <FileInputButton
                    name={name}
                    accept={accept}
                    variant={variant}
                    before={before}
                    multiple
                    onChange={handleFilesChange}
                    disabled={inputDisabled}
                    readOnly={readOnlyFromProps}
                >
                    {children}
                </FileInputButton>
                {clearable && hasFiles && !readOnly && (
                    <IconButton
                        name={undefined}
                        onClick={handleClear}
                        label={strings.goMultiFileInputClearLabel}
                        disabled={inputDisabled}
                    >
                        <DeleteBinTwoLineIcon />
                    </IconButton>
                )}
                {!hasFiles && (
                    <Description variant="light">
                        {strings.goMultiFileInputNoFileMessage}
                    </Description>
                )}
            </ListView>
            {!withoutPreview && hasFiles && (
                <ListView
                    layout="grid"
                    spacing="xs"
                    layoutOptions={{ numPreferredColumns: 3 }}
                >
                    {value.map((fileId) => {
                        const fileUrl = fileIdToUrlMap[fileId];
                        return (
                            <InlineView
                                key={fileId}
                                wrapBreakpoint="none"
                                after={!readOnly && (
                                    <IconButton
                                        name={fileId}
                                        onClick={handleFileRemove}
                                        label={strings.goMultiFileInputRemoveLabel}
                                        disabled={inputDisabled}
                                    >
                                        <DeleteBinTwoLineIcon />
                                    </IconButton>
                                )}
                            >
                                <Link href={fileUrl}>
                                    {getFileNameFromUrl(fileUrl)}
                                </Link>
                            </InlineView>
                        );
                    })}
                </ListView>
            )}
            {description && (
                <Description variant="light" textSize="sm">
                    {description}
                </Description>
            )}
            {error && <InputError>{error}</InputError>}
        </ListView>
    );
}

export default GoMultiFileInput;
