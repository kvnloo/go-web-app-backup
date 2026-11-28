import {
    useContext,
    useId,
    useMemo,
} from 'react';

import FormStateContext from '#contexts/form-state';
import HeadingLevelContext from '#contexts/heading-level';
import useTranslation from '#hooks/useTranslation';
import ContainerLayout from '#next/base/ContainerLayout';
import {
    type AsyncStateProps,
    type ContentLayoutProps,
    getAsyncStateLayoutProps,
} from '#next/utils/container';
import { useNestedHeadingLevel } from '#next/utils/heading';

import Button from '../Button';
import FlavourHeading from '../FlavourHeading';

import i18n from './i18n.json';

interface BaseProps extends AsyncStateProps {
    className?: string;
    heading?: React.ReactNode;
    description?: React.ReactNode;
    /** An explanation, behind an info icon next to the heading */
    info?: React.ReactNode;
    /** Controls on the heading row */
    actions?: React.ReactNode;
    /** Inputs that filter the content; laid out in a grid with the general input look */
    filters?: React.ReactNode;
    /** Shows a "Clear Filters" action next to the filters while `filtered` is set */
    onFiltersClear?: () => void;
    footer?: React.ReactNode;
    footerActions?: React.ReactNode;
    children?: React.ReactNode;
    /** contrast: the neutral opposite of the surrounding surface; dark: navy */
    surface?: 'contrast' | 'dark';
}

export type Props = BaseProps & ContentLayoutProps;

/**
 * A section of a page or tab: a <section> named by its heading, which has a
 * hairline below it. Its heading level follows from nesting, its content is
 * stacked by default, and Tables and charts inside take its async state.
 */
function Section(props: Props) {
    const {
        className,
        heading,
        description,
        info,
        actions,
        filters,
        onFiltersClear,
        footer,
        footerActions,
        children,
        surface,
        layout = 'block',
        layoutOptions,
        ...asyncStateProps
    } = props;

    const strings = useTranslation(i18n);
    const headingId = useId();
    const { level, contextValue } = useNestedHeadingLevel();
    const parentHeadingLevel = useContext(HeadingLevelContext);

    const formState = useContext(FormStateContext);
    const filtersFormState = useMemo(
        () => ({ ...formState, inputVariant: 'general' as const }),
        [formState],
    );

    const filtersNode = filters && (
        <FormStateContext.Provider value={filtersFormState}>
            {filters}
            {onFiltersClear && asyncStateProps.filtered && (
                <Button
                    name={undefined}
                    variant="tertiary"
                    onClick={onFiltersClear}
                >
                    {strings.sectionClearFiltersLabel}
                </Button>
            )}
        </FormStateContext.Provider>
    );

    return (
        <ContainerLayout
            as={heading ? 'section' : 'div'}
            aria-labelledby={heading ? headingId : undefined}
            className={className}
            heading={heading && (
                <FlavourHeading id={headingId} level={level} variant="section" info={info}>
                    {heading}
                </FlavourHeading>
            )}
            description={description}
            actions={actions}
            withHeaderBorder={!!heading}
            filters={filtersNode}
            footer={footer}
            footerActions={footerActions}
            surface={surface}
            withPadding={!!surface}
            layout={layout}
            layoutOptions={layoutOptions}
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...getAsyncStateLayoutProps(asyncStateProps)}
        >
            <HeadingLevelContext.Provider value={heading ? contextValue : parentHeadingLevel}>
                {children}
            </HeadingLevelContext.Provider>
        </ContainerLayout>
    );
}

export default Section;
