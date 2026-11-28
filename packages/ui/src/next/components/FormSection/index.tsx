import {
    useContext,
    useId,
    useMemo,
} from 'react';

import FormStateContext, { type FormStateContextProps } from '#contexts/form-state';
import HeadingLevelContext from '#contexts/heading-level';
import ContainerLayout from '#next/base/ContainerLayout';
import ListLayout, { type Props as ListLayoutProps } from '#next/base/ListLayout';
import type { ContentLayoutProps } from '#next/utils/container';
import { useNestedHeadingLevel } from '#next/utils/heading';

import FlavourHeading from '../FlavourHeading';

import styles from './styles.module.css';

interface BaseProps {
    className?: string;
    heading?: React.ReactNode;
    description?: React.ReactNode;
    info?: React.ReactNode;
    actions?: React.ReactNode;
    footer?: React.ReactNode;
    footerActions?: React.ReactNode;
    /** FieldGroups and inputs */
    children?: React.ReactNode;
    /** Disables every input inside; defaults to the surrounding form state */
    disabled?: boolean;
    /** Makes every input inside read-only; defaults to the surrounding form state */
    readOnly?: boolean;
}

export type Props = BaseProps & ContentLayoutProps;

/**
 * One block of a form step: its heading sits on a white well, and its
 * FieldGroups are stacked below. Inputs inside inherit `disabled`,
 * `readOnly` and the form look from it; a disabled section also wraps its
 * fields in a disabled <fieldset>, so the browser disables them too.
 */
function FormSection(props: Props) {
    const {
        className,
        heading,
        description,
        info,
        actions,
        footer,
        footerActions,
        children,
        disabled,
        readOnly,
        layout = 'block',
        layoutOptions,
    } = props;

    const headingId = useId();
    const { level, contextValue } = useNestedHeadingLevel();
    const parentHeadingLevel = useContext(HeadingLevelContext);
    const parentFormState = useContext(FormStateContext);

    const formState = useMemo<FormStateContextProps>(() => ({
        disabled: disabled ?? parentFormState.disabled,
        readOnly: readOnly ?? parentFormState.readOnly,
        inputVariant: 'form',
    }), [disabled, readOnly, parentFormState]);

    // NOTE: the layout union pairs each layout with its options
    const contentLayoutProps = { layout, ...layoutOptions } as ListLayoutProps;

    const content = (
        <ListLayout
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...contentLayoutProps}
            spacing="sm"
        >
            <HeadingLevelContext.Provider value={heading ? contextValue : parentHeadingLevel}>
                {children}
            </HeadingLevelContext.Provider>
        </ListLayout>
    );

    return (
        <FormStateContext.Provider value={formState}>
            <ContainerLayout
                as={heading ? 'section' : 'div'}
                aria-labelledby={heading ? headingId : undefined}
                className={className}
                heading={heading && (
                    <FlavourHeading id={headingId} level={level} variant="card" info={info}>
                        {heading}
                    </FlavourHeading>
                )}
                description={description}
                actions={actions}
                withHeaderWell={!!heading}
                footer={footer}
                footerActions={footerActions}
            >
                {formState.disabled ? (
                    <fieldset className={styles.fieldset} disabled>
                        {content}
                    </fieldset>
                ) : content}
            </ContainerLayout>
        </FormStateContext.Provider>
    );
}

export default FormSection;
