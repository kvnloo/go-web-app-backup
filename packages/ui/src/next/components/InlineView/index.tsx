import InlineLayout from '#next/base/InlineLayout';
import type { SpacingType } from '#utils/style';

export interface Props {
    className?: string;
    elementRef?: React.RefObject<HTMLDivElement | null>;
    /** Leading content, such as an icon or avatar */
    before?: React.ReactNode;
    children?: React.ReactNode;
    /** Trailing content, such as actions */
    after?: React.ReactNode;
    /** Defaults to the layout-defaults context */
    spacing?: SpacingType;
    /**
     * Container width below which `after` moves under the content; `none`
     * keeps one row at every width (keep `after` short then). Defaults to md
     */
    wrapBreakpoint?: 'sm' | 'md' | 'lg' | 'none';
    /** Cross-axis alignment of the slots; defaults to center */
    alignItems?: 'start' | 'center';
}

/**
 * One row of leading content, main content and trailing content that adapts
 * to the width of its container. For several items of the same kind, use
 * ListView.
 */
function InlineView(props: Props) {
    const {
        className,
        elementRef,
        before,
        children,
        after,
        spacing,
        wrapBreakpoint = 'md',
        alignItems = 'center',
    } = props;

    return (
        <InlineLayout
            className={className}
            elementRef={elementRef}
            before={before}
            after={after}
            spacing={spacing}
            wrapBreakpoint={wrapBreakpoint}
            contentAlignment={alignItems}
        >
            {children}
        </InlineLayout>
    );
}

export default InlineView;
