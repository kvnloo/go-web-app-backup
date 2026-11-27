import {
    useContext,
    useMemo,
} from 'react';
import { _cs } from '@togglecorp/fujs';

import LayoutDefaultsContext from '#contexts/layout-defaults';
import {
    fullSpacings,
    gapSpacings,
    getSpacingClassName,
    SpacingMode,
    SpacingType,
} from '#utils/style';

import styles from './styles.module.css';

export interface Props extends Omit<React.HTMLProps<HTMLDivElement>, 'ref' | 'before' | 'after' | 'name' | 'value' | 'onClick'> {
    /** Ref to the root DOM node */
    elementRef?: React.RefObject<HTMLDivElement | null>;
    className?: string;

    before?: React.ReactNode;
    beforeContainerClassName?: string;
    children?: React.ReactNode;
    childrenContainerClassName?: string;
    after?: React.ReactNode;
    afterContainerClassName?: string;

    spacing?: SpacingType;
    spacingOffset?: number;
    withPadding?: boolean;
    withoutSpacingOpticalCorrection?: boolean;
    withAdditionalInlinePadding?: boolean;
    withEllipsizedContent?: boolean;

    contentAlignment?: 'start' | 'center' | 'end';
    withInlineDisplay?: boolean;
    /**
     * Container width below which `after` moves to its own line under the
     * content; `none` keeps one row at every width
     */
    wrapBreakpoint?: 'sm' | 'md' | 'lg' | 'none';
}

/**
 * One row of before / content / after (building block). With a wrap
 * breakpoint the row adapts to its container: below the breakpoint `after`
 * moves under the content. Spacing follows the layout-defaults context.
 */
function InlineLayout(props: Props) {
    const {
        className,
        elementRef,
        before,
        beforeContainerClassName,
        children,
        childrenContainerClassName,
        after,
        afterContainerClassName,
        spacing: spacingFromProps,
        spacingOffset: spacingOffsetFromProps = 0,
        withPadding,
        withoutSpacingOpticalCorrection,
        withAdditionalInlinePadding,
        withEllipsizedContent,
        contentAlignment = 'center',
        withInlineDisplay,
        wrapBreakpoint = 'none',

        ...divProps
    } = props;

    const defaults = useContext(LayoutDefaultsContext);
    const spacing = spacingFromProps ?? defaults.spacing;
    const spacingOffset = spacingOffsetFromProps + defaults.spacingOffset;

    const spacingModes = useMemo<SpacingMode[]>(() => {
        if (!withPadding) {
            return gapSpacings;
        }

        return fullSpacings;
    }, [withPadding]);

    const spacingClassName = getSpacingClassName({
        spacing,
        modes: spacingModes,
        offset: spacingOffset ?? 0,
        withAdditionalInlinePadding,
        withoutOpticalCorrection: withoutSpacingOpticalCorrection,
    });

    const innerSpacingClassName = getSpacingClassName({
        spacing,
        modes: gapSpacings,
        offset: spacingOffset ?? 0,
        withoutOpticalCorrection: withoutSpacingOpticalCorrection,
    });

    const wraps = wrapBreakpoint !== 'none';

    const row = (
        <div
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...(wraps ? {} : divProps)}
            ref={wraps ? undefined : elementRef}
            className={_cs(
                styles.inlineLayout,
                spacingClassName,
                contentAlignment === 'start' && styles.startAlignedContent,
                contentAlignment === 'end' && styles.endAlignedContent,
                withInlineDisplay && styles.withInlineDisplay,
                !wraps && className,
            )}
        >
            {before && (
                <div
                    className={_cs(
                        styles.beforeContent,
                        innerSpacingClassName,
                        beforeContainerClassName,
                    )}
                >
                    {before}
                </div>
            )}
            {/* FIXME: remove unnecessary gap when children is empty */}
            <div
                className={_cs(
                    styles.children,
                    innerSpacingClassName,
                    childrenContainerClassName,
                    withEllipsizedContent && styles.ellipsized,
                )}
            >
                {children}
            </div>
            {after && (
                <div
                    className={_cs(
                        styles.afterContent,
                        afterContainerClassName,
                        innerSpacingClassName,
                    )}
                >
                    {after}
                </div>
            )}
        </div>
    );

    if (!wraps) {
        return row;
    }

    // NOTE: a container query needs an ancestor container, hence the wrapper
    return (
        <div
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...divProps}
            ref={elementRef}
            className={_cs(
                styles.wrapContainer,
                wrapBreakpoint === 'sm' && styles.withSmWrapBreakpoint,
                wrapBreakpoint === 'md' && styles.withMdWrapBreakpoint,
                wrapBreakpoint === 'lg' && styles.withLgWrapBreakpoint,
                className,
            )}
        >
            {row}
        </div>
    );
}

export default InlineLayout;
