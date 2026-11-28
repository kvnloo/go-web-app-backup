import {
    useContext,
    useId,
    useMemo,
} from 'react';

import type { DefaultMessages } from '#contexts/defaults';
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
import Pagination from '../Pagination';

import i18n from './i18n.json';

/** The parts of a list's state a paged Section uses, as useListState returns them */
export interface PagedListState {
    page: number;
    setPage: (page: number) => void;
    /** Items per page */
    limit: number;
    filtered: boolean;
    resetFilter: () => void;
}

/** A paged list: its state, the current page from the server and the request state */
export interface PagedList {
    state: PagedListState;
    response: { count?: number | null; results?: unknown[] | null } | null | undefined;
    pending: boolean;
    errored?: boolean;
}

type StateProps =
    | (AsyncStateProps & {
        /** Shows a "Clear Filters" action next to the filters while `filtered` is set */
        onFiltersClear?: () => void;
        footerActions?: React.ReactNode;
        list?: never;
    })
    | {
        /**
         * Shows the list's pagination, its loading, empty and filtered
         * states, and a "Clear Filters" action
         */
        list: PagedList;
        /** Wording for this instance; defaults come from the defaults context */
        messages?: DefaultMessages;
        pending?: never;
        errored?: never;
        empty?: never;
        filtered?: never;
        onFiltersClear?: never;
        footerActions?: never;
    };

interface BaseProps {
    className?: string;
    heading?: React.ReactNode;
    description?: React.ReactNode;
    /** An explanation, behind an info icon next to the heading */
    info?: React.ReactNode;
    /** Controls on the heading row */
    actions?: React.ReactNode;
    /** Inputs that filter the content; laid out in a grid with the general input look */
    filters?: React.ReactNode;
    footer?: React.ReactNode;
    children?: React.ReactNode;
    /** contrast: the neutral opposite of the surrounding surface; dark: navy */
    surface?: 'contrast' | 'dark';
}

export type Props = BaseProps & StateProps & ContentLayoutProps;

function getListStateProps(list: PagedList, messages: DefaultMessages | undefined) {
    const {
        state,
        response,
        pending,
        errored,
    } = list;
    return {
        asyncState: {
            pending,
            errored,
            empty: (response?.results?.length ?? 0) === 0,
            filtered: state.filtered,
            messages,
        },
        onFiltersClear: state.resetFilter,
        footerActions: (
            <Pagination
                activePage={state.page}
                numItems={response?.count ?? 0}
                numItemsPerPage={state.limit}
                onActivePageChange={state.setPage}
            />
        ),
    };
}

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
        footer,
        children,
        surface,
        layout = 'block',
        layoutOptions,
        list,
        onFiltersClear: onFiltersClearFromProps,
        footerActions: footerActionsFromProps,
        ...asyncStateFromProps
    } = props;

    const listStateProps = list && getListStateProps(list, asyncStateFromProps.messages);
    const asyncStateProps: AsyncStateProps = listStateProps?.asyncState ?? asyncStateFromProps;
    const onFiltersClear = listStateProps?.onFiltersClear ?? onFiltersClearFromProps;
    const footerActions = listStateProps?.footerActions ?? footerActionsFromProps;

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
