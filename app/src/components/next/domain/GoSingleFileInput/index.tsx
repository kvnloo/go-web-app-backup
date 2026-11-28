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
    ListView,
} from '@ifrc-go/ui/next';
import { InputError } from '@ifrc-go/ui/next/base';
import {
    isDefined,
    isNotDefined,
} from '@togglecorp/fujs';
import { nonFieldError } from '@togglecorp/toggle-form';

import Link from '#components/next/Link';
import useAlert from '#hooks/useAlert';
import { useLazyRequest } from '#utils/restRequest';
import { transformObjectError } from '#utils/restRequest/error';

import i18n from './i18n.json';

export type SupportedPaths = '/api/v2/per-file/'
    | '/api/v2/dref-files/'
    | '/api/v2/flash-update-file/'
    | '/api/v2/per-document-upload/'
    | '/api/v2/eap-file/';

interface Props<NAME> {
    name: NAME;
    /** The id of the uploaded file */
    value: number | undefined | null;
    onChange: (value: number | undefined, name: NAME) => void;
    /** Where the file is uploaded */
    url: SupportedPaths;
    urlQuery?: Record<string, string | number | boolean>;
    requestBody?: Record<string, string | number | boolean>;
    /** Uploaded file ids and their URLs, for the link to the chosen file */
    fileIdToUrlMap: Record<number, string>;
    setFileIdToUrlMap?: Dispatch<SetStateAction<Record<number, string>>>;
    onSuccess?: () => void;
    useCurrentLanguageForMutation?: boolean;
    /** The button label */
    children: React.ReactNode;
    accept?: string;
    variant?: ButtonVariant;
    before?: React.ReactNode;
    /** Shows a button that removes the file */
    clearable?: boolean;
    /** Shown under the button, such as a preview */
    description?: React.ReactNode;
    error?: React.ReactNode;
    withoutPreview?: boolean;
    withoutStatus?: boolean;
    /** Defaults to the surrounding form section or page */
    disabled?: boolean;
    /** Defaults to the surrounding form section or page */
    readOnly?: boolean;
}

/**
 * Uploads one file to GO and holds its id: a file button, the chosen file
 * as a link, and an optional remove button
 */
function GoSingleFileInput<const NAME>(props: Props<NAME>) {
    const {
        name,
        value,
        onChange,
        url,
        urlQuery,
        requestBody,
        fileIdToUrlMap,
        setFileIdToUrlMap,
        onSuccess,
        useCurrentLanguageForMutation = false,
        children,
        accept,
        variant,
        before,
        clearable,
        description,
        error,
        withoutPreview,
        withoutStatus,
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
        query: urlQuery,
        method: 'POST',
        // FIXME: the server types the response and the body the same
        body: (body) => body as never,
        useCurrentLanguageForMutation,
        onSuccess: (response) => {
            const { id, file } = response;
            onChange(id, name);
            onSuccess?.();
            if (isDefined(file) && isDefined(id) && setFileIdToUrlMap) {
                setFileIdToUrlMap((oldMap) => ({ ...oldMap, [id]: file }));
            }
        },
        onFailure: ({ value: { formErrors } }) => {
            const err = transformObjectError(formErrors, () => undefined);
            const serverErrorMessage = err?.[nonFieldError] || (
                typeof err?.file === 'object' ? undefined : err?.file
            );
            alert.show(
                strings.goSingleFileInputUploadFailedMessage,
                { variant: 'danger', description: serverErrorMessage },
            );
        },
    });

    const handleFileChange = (file: File | undefined) => {
        if (isNotDefined(file)) {
            return;
        }
        triggerFileUpload({ file, ...requestBody });
    };

    const handleClear = () => {
        onChange(undefined, name);
    };

    // NOTE: an undefined state falls back to the surrounding form section
    const inputDisabled = pending ? true : disabled;
    const selectedFileUrl = isDefined(value) ? fileIdToUrlMap[value] : undefined;

    return (
        <ListView layout="block" spacing="sm">
            <ListView spacing="sm" layoutOptions={{ wrap: true }}>
                <FileInputButton
                    name={name}
                    accept={accept}
                    variant={variant}
                    before={before}
                    onChange={handleFileChange}
                    disabled={inputDisabled}
                    readOnly={readOnlyFromProps}
                >
                    {children}
                </FileInputButton>
                {isNotDefined(selectedFileUrl) && !withoutStatus && (
                    <Description variant="light">
                        {strings.goSingleFileInputNoFileMessage}
                    </Description>
                )}
                {!withoutPreview && isDefined(selectedFileUrl) && (
                    <Link href={selectedFileUrl}>
                        {selectedFileUrl.split('/').pop()}
                    </Link>
                )}
                {clearable && isDefined(value) && !readOnly && (
                    <IconButton
                        name={undefined}
                        onClick={handleClear}
                        label={strings.goSingleFileInputRemoveLabel}
                        disabled={inputDisabled}
                    >
                        <DeleteBinTwoLineIcon />
                    </IconButton>
                )}
            </ListView>
            {description}
            {error && <InputError>{error}</InputError>}
        </ListView>
    );
}

export default GoSingleFileInput;
