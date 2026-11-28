import {
    HTMLProps,
    RefObject,
    useContext,
    useMemo,
} from 'react';
import {
    _cs,
    isDefined,
} from '@togglecorp/fujs';

import LayoutDefaultsContext from '#contexts/layout-defaults';
import {
    fullSpacings,
    gapSpacings,
    getSpacingClassName,
    SpacingMode,
    SpacingType,
} from '#utils/style';

import styles from './styles.module.css';

export interface Props extends Omit<HTMLProps<HTMLDivElement>, 'ref' | 'before' | 'after' | 'as'> {
    /** Element to render as the root; pick the one that matches the meaning of the block */
    as?: 'div' | 'section' | 'article';
    /** Ref to the root DOM node */
    elementRef?: RefObject<HTMLDivElement | null>;
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
    withBeforeSeparator?: boolean;
    withAfterSeparator?: boolean;

    withoutSpacingOpticalCorrection?: boolean;
    withOverflow?: boolean;
}

/**
 * Vertical before/children/after stack with spec-driven spacing and
 * optional separators (generic layer).
 */
function BlockLayout(props: Props) {
    const {
        as: Element = 'div',
        className,
        elementRef,
        before,
        children,
        after,
        beforeContainerClassName,
        childrenContainerClassName,
        afterContainerClassName,
        spacing: spacingFromProps,
        spacingOffset: spacingOffsetFromProps = 0,
        withPadding,
        withBeforeSeparator,
        withAfterSeparator,
        withoutSpacingOpticalCorrection,
        withOverflow,

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
        offset: spacingOffset,
        withoutOpticalCorrection: withoutSpacingOpticalCorrection,
    });

    const innerSpacingClassName = getSpacingClassName({
        spacing,
        modes: gapSpacings,
        offset: spacingOffset,
        withoutOpticalCorrection: withoutSpacingOpticalCorrection,
    });

    return (
        <Element
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...divProps}
            className={_cs(
                styles.blockLayout,
                spacingClassName,
                withOverflow && styles.withOverflow,
                className,
            )}
            ref={elementRef}
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
            {withBeforeSeparator && <hr className={styles.separator} />}
            {isDefined(children) && (
                <div
                    className={_cs(
                        styles.children,
                        innerSpacingClassName,
                        childrenContainerClassName,
                    )}
                >
                    {children}
                </div>
            )}
            {withAfterSeparator && <hr className={styles.separator} />}
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
        </Element>
    );
}

export default BlockLayout;
