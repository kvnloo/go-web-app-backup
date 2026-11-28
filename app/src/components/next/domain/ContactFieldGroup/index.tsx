import { useTranslation } from '@ifrc-go/ui/hooks';
import {
    FieldGroup,
    TextInput,
} from '@ifrc-go/ui/next';
import {
    type EntriesAsList,
    type Error,
    getErrorObject,
    getErrorString,
} from '@togglecorp/toggle-form';

import i18n from './i18n.json';

type ContactField = 'name' | 'title' | 'email' | 'phone_number';
type PrefixFromKey<K extends string> = K extends `${infer P}_${ContactField}` ? P : never;

type HasAllKeys<K extends string, P extends string> =
    `${P}_name` extends K
        ? `${P}_title` extends K
            ? `${P}_email` extends K
                ? `${P}_phone_number` extends K
                    ? true
                    : false
                : false
            : false
        : false;

/** The prefixes for which the form has all four contact fields */
type ValidPrefixes<K extends string> =
    PrefixFromKey<K> extends infer P
        ? P extends string
            ? HasAllKeys<K, P> extends true ? P : never
            : never
        : never;

interface Props<
    FORM_VALUE extends object,
    NAME_PREFIX extends ValidPrefixes<Extract<keyof FORM_VALUE, string>>,
> {
    /** The fields are `<namePrefix>_name`, `_title`, `_email` and `_phone_number` */
    namePrefix: NAME_PREFIX;
    value: FORM_VALUE;
    setFieldValue: (...entries: EntriesAsList<FORM_VALUE>) => void;
    error: Error<FORM_VALUE> | undefined;
    heading: React.ReactNode;
    description?: React.ReactNode;
    /** Shows the asterisk after the heading */
    required?: boolean;
    withRequiredNameAndEmail?: boolean;
    withRequiredTitle?: boolean;
}

/**
 * A contact person's name, title, email and phone number as one FieldGroup.
 * Disabled and read-only states come from the surrounding form section.
 */
function ContactFieldGroup<
    FORM_VALUE extends object,
    const NAME_PREFIX extends ValidPrefixes<Extract<keyof FORM_VALUE, string>>,
>(props: Props<FORM_VALUE, NAME_PREFIX>) {
    const {
        namePrefix,
        value,
        setFieldValue,
        error: formError,
        heading,
        description,
        required,
        withRequiredNameAndEmail,
        withRequiredTitle,
    } = props;

    const strings = useTranslation(i18n);
    const error = getErrorObject(formError);

    const getFieldValue = (field: ContactField) => value?.[`${namePrefix}_${field}`] as
        string | undefined;
    const getFieldError = (field: ContactField) => getErrorString(
        error?.[`${namePrefix}_${field}`] as string | undefined,
    );
    const handleFieldChange = (newValue: string | undefined, field: ContactField) => {
        const fieldName = `${namePrefix}_${field}` as const;
        setFieldValue(newValue as FORM_VALUE[typeof fieldName], fieldName);
    };

    return (
        <FieldGroup
            heading={heading}
            description={description}
            required={required}
            layoutOptions={{ numPreferredColumns: 2 }}
        >
            <TextInput
                name="name"
                label={strings.contactFieldGroupNameLabel}
                value={getFieldValue('name')}
                error={getFieldError('name')}
                onChange={handleFieldChange}
                required={withRequiredNameAndEmail}
            />
            <TextInput
                name="title"
                label={strings.contactFieldGroupTitleLabel}
                value={getFieldValue('title')}
                error={getFieldError('title')}
                onChange={handleFieldChange}
                required={withRequiredTitle}
            />
            <TextInput
                name="email"
                type="email"
                label={strings.contactFieldGroupEmailLabel}
                value={getFieldValue('email')}
                error={getFieldError('email')}
                onChange={handleFieldChange}
                required={withRequiredNameAndEmail}
            />
            <TextInput
                name="phone_number"
                type="tel"
                label={strings.contactFieldGroupPhoneLabel}
                value={getFieldValue('phone_number')}
                error={getFieldError('phone_number')}
                onChange={handleFieldChange}
            />
        </FieldGroup>
    );
}

export default ContactFieldGroup;
