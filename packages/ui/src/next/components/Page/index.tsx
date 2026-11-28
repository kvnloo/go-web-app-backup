import {
    useContext,
    useMemo,
} from 'react';
import { _cs } from '@togglecorp/fujs';

import FormStateContext, { type FormStateContextProps } from '#contexts/form-state';
import SurfaceContext from '#contexts/surface';
import ContainerLayout from '#next/base/ContainerLayout';
import PageContainer from '#next/base/PageContainer';
import PageHeader from '#next/base/PageHeader';
import {
    type AsyncStateProps,
    getAsyncStateLayoutProps,
} from '#next/utils/container';

import styles from './styles.module.css';

export interface Props extends AsyncStateProps {
    className?: string;
    breadcrumbs?: React.ReactNode;
    /** A link back to the parent page, in place of breadcrumbs */
    backLink?: React.ReactNode;
    /** Short category above the title */
    overline?: React.ReactNode;
    /** The page title (h1) */
    heading?: React.ReactNode;
    description?: React.ReactNode;
    actions?: React.ReactNode;
    /** A summary row under the description (key facts) */
    info?: React.ReactNode;
    /** Above the header: read-only and warning banners */
    banner?: React.ReactNode;
    /** Under the header: the page's tab list */
    navigation?: React.ReactNode;
    /** A photo behind the header; its text switches to the on-dark colours */
    background?: React.ReactNode;
    /** default: white main area; form: gray main area for forms */
    variant?: 'default' | 'form';
    /** Disables every input on the page */
    disabled?: boolean;
    /** Makes every input on the page read-only */
    readOnly?: boolean;
    children?: React.ReactNode;
}

const surfaces = {
    default: { background: 'foreground', dark: false },
    form: { background: 'background', dark: false },
} as const;

/**
 * A page: banner, header (breadcrumbs or back link, title, description,
 * actions, info), navigation and the main area, whose children are stacked
 * with the page spacing. Sections inside get h2 headings.
 */
function Page(props: Props) {
    const {
        className,
        breadcrumbs,
        backLink,
        overline,
        heading,
        description,
        actions,
        info,
        banner,
        navigation,
        background,
        variant = 'default',
        disabled,
        readOnly,
        children,
        ...asyncStateProps
    } = props;

    const parentFormState = useContext(FormStateContext);
    const formState = useMemo<FormStateContextProps>(() => ({
        disabled: disabled ?? parentFormState.disabled,
        readOnly: readOnly ?? parentFormState.readOnly,
        inputVariant: parentFormState.inputVariant,
    }), [disabled, readOnly, parentFormState]);

    return (
        <div className={_cs(styles.page, className)}>
            {banner}
            <PageHeader
                className={styles.header}
                breadcrumbs={breadcrumbs}
                backLink={backLink}
                overline={overline}
                heading={heading}
                description={description}
                actions={actions}
                info={info}
                background={background}
            />
            {navigation && (
                <PageContainer className={styles.navigation}>
                    {navigation}
                </PageContainer>
            )}
            <PageContainer
                contentAs="main"
                className={_cs(styles.main, variant === 'form' && styles.formVariant)}
                contentClassName={styles.mainContent}
            >
                <SurfaceContext.Provider value={surfaces[variant]}>
                    <FormStateContext.Provider value={formState}>
                        <ContainerLayout
                            layout="block"
                            spacing="4xl"
                            // eslint-disable-next-line react/jsx-props-no-spreading
                            {...getAsyncStateLayoutProps(asyncStateProps)}
                        >
                            {children}
                        </ContainerLayout>
                    </FormStateContext.Provider>
                </SurfaceContext.Provider>
            </PageContainer>
        </div>
    );
}

export default Page;
