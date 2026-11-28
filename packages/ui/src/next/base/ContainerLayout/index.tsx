import {
    type RefObject,
    useContext,
    useMemo,
} from 'react';
import {
    _cs,
    isDefined,
    isNotDefined,
} from '@togglecorp/fujs';

import ContainerStateContext from '#contexts/container-state';
import type { DefaultMessages } from '#contexts/defaults';
import LayoutDefaultsContext from '#contexts/layout-defaults';
import SurfaceContext, {
    getContrastBackground,
    type SurfaceContextProps,
} from '#contexts/surface';
import {
    type BackgroundColorType,
    type BorderRadiusType,
    type BoxShadowType,
    getBackgroundColorClassName,
    getBorderRadiusClassName,
    getBoxShadowClassName,
    getDarkSurfaceClassName,
    getLightSurfaceClassName,
    getSpacingClassName,
    getSpacingValue,
    paddingSpacings,
    type SpacingType,
} from '#utils/style';

import BlockLayout from '../BlockLayout';
import InlineLayout, { type Props as InlineLayoutProps } from '../InlineLayout';
import ListLayout, {
    type LayoutOptions,
    type LayoutType,
} from '../ListLayout';
import StateMessage from '../StateMessage';
import TextLayout from '../TextLayout';

import styles from './styles.module.css';

type WrapBreakpoint = InlineLayoutProps['wrapBreakpoint'];

export interface Props extends Omit<React.HTMLProps<HTMLDivElement>, 'ref' | 'wrap' | 'title' | 'as'> {
    /** Element to render as the root: section for sections, article for one record */
    as?: 'div' | 'section' | 'article';
    className?: string;
    elementRef?: RefObject<HTMLDivElement | null>;

    /** A rendered heading (the flavour picks its level and look) */
    heading?: React.ReactNode;
    description?: React.ReactNode;
    icon?: React.ReactNode;
    /** Controls on the heading row; several are spaced automatically */
    actions?: React.ReactNode;
    headerAlign?: 'start' | 'center';
    headerWrapBreakpoint?: WrapBreakpoint;
    withHeaderBorder?: boolean;
    /** Puts the header on a white well with a separator below (form sections) */
    withHeaderWell?: boolean;
    /**
     * Heading-row actions (a tag, a small button) do not make the row taller,
     * so the separators of cards side by side line up
     */
    withCompactActions?: boolean;

    filters?: React.ReactNode;

    footer?: React.ReactNode;
    /** Controls at the footer end; several are spaced automatically */
    footerActions?: React.ReactNode;
    footerWrapBreakpoint?: WrapBreakpoint;
    withFooterBorder?: boolean;

    children?: React.ReactNode;
    /** Lays out the children; without it they are rendered as they are */
    layout?: LayoutType;
    layoutOptions?: LayoutOptions<LayoutType>;
    withContentOverflow?: boolean;
    withContentWell?: boolean;

    pending?: boolean;
    /** Keep showing the children under a spinner while pending */
    overlayPending?: boolean;
    errored?: boolean;
    empty?: boolean;
    filtered?: boolean;
    messages?: DefaultMessages;
    withCompactMessage?: boolean;
    withoutMessageIcon?: boolean;

    /** contrast: the neutral opposite of the parent surface; dark: navy */
    surface?: 'contrast' | 'dark';
    backgroundColor?: BackgroundColorType;
    borderRadius?: BorderRadiusType;
    boxShadow?: BoxShadowType;
    withPadding?: boolean;
    withBorder?: boolean;

    spacing?: SpacingType;
    spacingOffset?: number;
    withoutSpacingOpticalCorrection?: boolean;

    withFixedHeight?: boolean;
    withCenteredContent?: boolean;
    withOverflow?: boolean;
}

/**
 * The frame every container flavour is built on (building block): header
 * with heading, description and actions, filters, content, footer, async
 * states and surface. It shares its async state with the content (a Table
 * inside reads it) and tells its children which surface they sit on.
 */
function ContainerLayout(props: Props) {
    const {
        className,
        elementRef,

        heading,
        description,
        icon,
        actions,
        headerAlign = 'start',
        headerWrapBreakpoint = 'md',
        withHeaderBorder,
        withHeaderWell,
        withCompactActions,

        filters,

        footer,
        footerActions,
        footerWrapBreakpoint = 'lg',
        withFooterBorder,

        children,
        layout,
        layoutOptions,
        withContentOverflow,
        withContentWell,

        pending = false,
        overlayPending = false,
        errored = false,
        empty = false,
        filtered = false,
        messages,
        withCompactMessage,
        withoutMessageIcon,

        surface,
        backgroundColor: backgroundColorFromProps,
        borderRadius: borderRadiusFromProps,
        boxShadow,
        withPadding,
        withBorder,

        spacing: spacingFromProps,
        spacingOffset: spacingOffsetFromProps = 0,
        withoutSpacingOpticalCorrection,

        withFixedHeight,
        withCenteredContent,
        withOverflow,

        ...divProps
    } = props;

    const defaults = useContext(LayoutDefaultsContext);
    const spacing = spacingFromProps ?? defaults.spacing;
    const spacingOffset = spacingOffsetFromProps + defaults.spacingOffset;

    const parentSurface = useContext(SurfaceContext);
    const surfaceValue = useMemo<SurfaceContextProps>(() => {
        if (surface === 'dark') {
            return { background: parentSurface.background, dark: true };
        }
        if (surface === 'contrast') {
            return { background: getContrastBackground(parentSurface.background), dark: false };
        }
        if (backgroundColorFromProps === 'foreground' || backgroundColorFromProps === 'background') {
            return { background: backgroundColorFromProps, dark: false };
        }
        return parentSurface;
    }, [surface, backgroundColorFromProps, parentSurface]);

    const backgroundColor = surface === 'contrast'
        ? surfaceValue.background
        : backgroundColorFromProps;

    // NOTE: a background or border implies a rounded container (md, as in the design)
    const borderRadius = borderRadiusFromProps
        ?? ((isDefined(backgroundColor) || isDefined(surface) || withBorder) ? 'md' : undefined);

    const containerState = useMemo(
        () => ({
            pending,
            errored,
            empty,
            filtered,
        }),
        [pending, errored, empty, filtered],
    );

    const contentSpacingClassName = getSpacingClassName({
        spacing,
        offset: spacingOffset,
        modes: paddingSpacings,
        withoutOpticalCorrection: withoutSpacingOpticalCorrection,
    });
    const spacingValue = getSpacingValue(spacing, spacingOffset);

    // NOTE: layout and layoutOptions are correlated by the flavours' types;
    // here they are passed through as one bag
    const arrangedChildren = isDefined(layout) ? (
        <ListLayout
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...(layoutOptions as object)}
            layout={layout as 'block'}
            spacing={spacing}
            spacingOffset={spacingOffset}
        >
            {children}
        </ListLayout>
    ) : children;

    const overflowChildren = (withContentOverflow && withPadding) ? (
        <div
            className={styles.overflowContainer}
            style={{
                padding: `0 ${spacingValue}`,
                margin: `0 calc(-1 * ${spacingValue})`,
            }}
        >
            {arrangedChildren}
        </div>
    ) : arrangedChildren;

    const showChildren = !empty && !errored && (!pending || overlayPending);
    const childrenUnderOverlay = pending && overlayPending;
    const mainContent = (isDefined(children) || empty || pending || errored || filtered) && (
        <ContainerStateContext.Provider value={containerState}>
            <StateMessage
                className={styles.message}
                pending={pending}
                errored={errored}
                empty={empty}
                filtered={filtered}
                messages={messages}
                compact={withCompactMessage}
                withoutIcon={withoutMessageIcon}
            />
            {showChildren && childrenUnderOverlay && (
                // NOTE: content under the spinner cannot be reached while it reloads
                <div className={styles.inertContent} inert>
                    {overflowChildren}
                </div>
            )}
            {showChildren && !childrenUnderOverlay && overflowChildren}
        </ContainerStateContext.Provider>
    );

    const showHeadingRow = isDefined(heading) || isDefined(icon) || isDefined(actions);
    const actionsClassName = withCompactActions ? styles.compactActions : undefined;
    const showHeader = showHeadingRow || isDefined(description);
    const showFooter = isDefined(footer) || isDefined(footerActions);

    return (
        <SurfaceContext.Provider value={surfaceValue}>
            <BlockLayout
                // eslint-disable-next-line react/jsx-props-no-spreading
                {...divProps}
                elementRef={elementRef}
                className={_cs(
                    styles.containerLayout,
                    surface === 'dark' && getDarkSurfaceClassName(),
                    parentSurface.dark && !surfaceValue.dark && getLightSurfaceClassName(),
                    getBackgroundColorClassName(backgroundColor),
                    getBorderRadiusClassName(borderRadius),
                    getBoxShadowClassName(boxShadow),
                    withContentWell && styles.withContentWell,
                    withFixedHeight && styles.withFixedHeight,
                    withCenteredContent && styles.withCenteredContent,
                    withBorder && styles.withBorder,
                    withHeaderWell && styles.withHeaderWell,
                    className,
                )}
                spacing={spacing}
                spacingOffset={spacingOffset}
                withoutSpacingOpticalCorrection={withoutSpacingOpticalCorrection}
                withPadding={withPadding}
                beforeContainerClassName={styles.beforeContainer}
                before={showHeader && (
                    <ListLayout
                        layout="block"
                        spacing={spacing}
                        spacingOffset={spacingOffset}
                        backgroundColor={withHeaderWell ? 'foreground' : undefined}
                        withPadding={withHeaderWell}
                    >
                        {showHeadingRow && (
                            <InlineLayout
                                spacing={spacing}
                                spacingOffset={spacingOffset - 1}
                                withoutSpacingOpticalCorrection={withoutSpacingOpticalCorrection}
                                wrapBreakpoint={headerWrapBreakpoint}
                                before={icon}
                                after={actions && (
                                    <ListLayout
                                        className={actionsClassName}
                                        spacing={spacing}
                                        spacingOffset={spacingOffset - 1}
                                    >
                                        {actions}
                                    </ListLayout>
                                )}
                            >
                                {heading}
                            </InlineLayout>
                        )}
                        {description && (
                            <TextLayout as="div" textAlign={headerAlign === 'center' ? 'center' : undefined}>
                                {description}
                            </TextLayout>
                        )}
                    </ListLayout>
                )}
                after={showFooter && (
                    <InlineLayout
                        spacing={spacing}
                        spacingOffset={spacingOffset}
                        withoutSpacingOpticalCorrection={withoutSpacingOpticalCorrection}
                        wrapBreakpoint={footerWrapBreakpoint}
                        after={footerActions && (
                            <ListLayout spacing={spacing} spacingOffset={spacingOffset - 1}>
                                {footerActions}
                            </ListLayout>
                        )}
                    >
                        {footer}
                    </InlineLayout>
                )}
                withBeforeSeparator={withHeaderBorder}
                withAfterSeparator={withFooterBorder}
                aria-busy={childrenUnderOverlay || undefined}
                childrenContainerClassName={_cs(
                    styles.content,
                    pending && overlayPending && styles.pendingOverlaid,
                    withContentOverflow && styles.withOverflow,
                    withPadding && withContentOverflow && styles.withPaddingOverflow,
                    !withPadding && withContentOverflow && styles.withoutPaddingOverflow,
                    withContentWell && contentSpacingClassName,
                )}
                withOverflow={withOverflow}
            >
                {isDefined(filters) && (
                    <ListLayout layout="block" spacing={spacing} spacingOffset={spacingOffset}>
                        {/* NOTE: a search landmark: these inputs filter the content */}
                        <search>
                            <ListLayout
                                gridContentClassName={styles.filters}
                                layout="grid"
                                numPreferredColumns={6}
                                spacing={spacing}
                                spacingOffset={spacingOffset - 1}
                            >
                                {filters}
                            </ListLayout>
                        </search>
                        {mainContent}
                    </ListLayout>
                )}
                {isNotDefined(filters) && mainContent}
            </BlockLayout>
        </SurfaceContext.Provider>
    );
}

export default ContainerLayout;
