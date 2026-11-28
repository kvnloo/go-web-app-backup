import {
    useEffect,
    useId,
    useLayoutEffect,
    useRef,
    useState,
} from 'react';
import {
    _cs,
    bound,
    isNotDefined,
} from '@togglecorp/fujs';

import Portal from '../Portal';
import TextLayout from '../TextLayout';

import styles from './styles.module.css';

export interface Props {
    className?: string;
    heading?: React.ReactNode;
    description?: React.ReactNode;
    /**
     * Skips aria-describedby on the trigger, for a tooltip that repeats the
     * trigger's accessible name (an icon button's label)
     */
    withoutTriggerDescription?: boolean;
}

// px
const GAP = 8;
const VIEWPORT_PADDING = 8;

function placeTooltip(trigger: HTMLElement, tooltip: HTMLElement) {
    const triggerRect = trigger.getBoundingClientRect();
    const tooltipRect = tooltip.getBoundingClientRect();

    const fitsBelow = triggerRect.bottom + GAP + tooltipRect.height
        <= window.innerHeight - VIEWPORT_PADDING;
    const fitsAbove = triggerRect.top - GAP - tooltipRect.height >= VIEWPORT_PADDING;
    const top = (fitsBelow || !fitsAbove)
        ? triggerRect.bottom + GAP
        : triggerRect.top - GAP - tooltipRect.height;
    const left = bound(
        triggerRect.left + (triggerRect.width - tooltipRect.width) / 2,
        VIEWPORT_PADDING,
        window.innerWidth - VIEWPORT_PADDING - tooltipRect.width,
    );

    // eslint-disable-next-line no-param-reassign
    tooltip.style.top = `${top}px`;
    // eslint-disable-next-line no-param-reassign
    tooltip.style.left = `${left}px`;
}

/**
 * A tooltip for its parent element (building block). It shows on hover and
 * keyboard focus, hides on leave, blur and Escape, and describes the parent
 * through aria-describedby. It is placed with JavaScript on a portal, so a
 * parent inside an <svg> (a chart point) works too. The parent must be
 * focusable for keyboard users to reach it.
 */
function TooltipLayout(props: Props) {
    const {
        className,
        heading,
        description,
        withoutTriggerDescription,
    } = props;

    const contentId = useId();
    const [visible, setVisible] = useState(false);
    const [hasParent, setHasParent] = useState(false);

    const anchorRef = useRef<HTMLSpanElement>(null);
    const parentRef = useRef<HTMLElement | null>(null);
    const tooltipRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const parentElement = anchorRef.current?.parentElement;
        if (isNotDefined(parentElement)) {
            return undefined;
        }
        parentRef.current = parentElement;

        const show = () => setVisible(true);
        const hide = () => setVisible(false);
        // NOTE: focusin and focusout bubble, so a focusable descendant works too
        parentElement.addEventListener('mouseenter', show);
        parentElement.addEventListener('mouseleave', hide);
        parentElement.addEventListener('focusin', show);
        parentElement.addEventListener('focusout', hide);
        // FIXME(frozenhelium): setState on mount signals that the parent is known
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setHasParent(true);

        return () => {
            parentElement.removeEventListener('mouseenter', show);
            parentElement.removeEventListener('mouseleave', hide);
            parentElement.removeEventListener('focusin', show);
            parentElement.removeEventListener('focusout', hide);
        };
    }, []);

    useEffect(() => {
        const parentElement = parentRef.current;
        if (!visible || isNotDefined(parentElement)) {
            return undefined;
        }

        if (!withoutTriggerDescription) {
            parentElement.setAttribute('aria-describedby', contentId);
        }
        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                setVisible(false);
            }
        };
        document.addEventListener('keydown', handleKeyDown);

        return () => {
            if (parentElement.getAttribute('aria-describedby') === contentId) {
                parentElement.removeAttribute('aria-describedby');
            }
            document.removeEventListener('keydown', handleKeyDown);
        };
    }, [visible, contentId, withoutTriggerDescription]);

    useLayoutEffect(() => {
        const parentElement = parentRef.current;
        const tooltipElement = tooltipRef.current;
        if (!visible || isNotDefined(parentElement) || isNotDefined(tooltipElement)) {
            return undefined;
        }

        const handlePlacement = () => placeTooltip(parentElement, tooltipElement);
        handlePlacement();
        window.addEventListener('scroll', handlePlacement, true);
        window.addEventListener('resize', handlePlacement);
        return () => {
            window.removeEventListener('scroll', handlePlacement, true);
            window.removeEventListener('resize', handlePlacement);
        };
    }, [visible]);

    return (
        <>
            {!hasParent && <span ref={anchorRef} className={styles.anchor} />}
            {visible && (
                <Portal>
                    <div
                        ref={tooltipRef}
                        id={contentId}
                        role="tooltip"
                        className={_cs(styles.tooltip, className)}
                    >
                        {heading && (
                            <TextLayout as="div" fontWeight="semibold">
                                {heading}
                            </TextLayout>
                        )}
                        {description && (
                            <TextLayout as="div">
                                {description}
                            </TextLayout>
                        )}
                    </div>
                </Portal>
            )}
        </>
    );
}

export default TooltipLayout;
