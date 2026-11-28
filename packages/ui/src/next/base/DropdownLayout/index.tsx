import {
    useCallback,
    useId,
    useMemo,
    useRef,
    useState,
} from 'react';
import {
    ArrowDownSmallFillIcon,
    ArrowUpSmallFillIcon,
} from '@ifrc-go/icons';
import { _cs } from '@togglecorp/fujs';

import PopupControlsContext from '#contexts/popup-controls';
import useBlurEffect from '#hooks/useBlurEffect';

import ButtonLayout, { type Props as ButtonLayoutProps } from '../ButtonLayout';
import Popover from '../Popover';
import RawButton from '../RawButton';

import styles from './styles.module.css';

export interface Props extends Pick<ButtonLayoutProps, 'tone' | 'fill' | 'withBorder' | 'shape'> {
    className?: string;
    popupClassName?: string;
    /** Popup width in rem; defaults to the trigger width, at least 16rem */
    preferredPopupWidth?: number;
    label?: React.ReactNode;
    before?: React.ReactNode;
    /** Trailing content, shown before the dropdown icon */
    after?: React.ReactNode;
    withoutDropdownIcon?: boolean;
    /** Accessible name for a trigger without visible text */
    ariaLabel?: string;
    /** The kind of popup the trigger opens */
    ariaHasPopup?: 'menu' | 'dialog' | 'true';
    /** Keeps the popup open on clicks inside it */
    persistent?: boolean;
    disabled?: boolean;
    /** The popup content; it can read PopupControlsContext */
    children: React.ReactNode;
}

/**
 * A trigger button that toggles a popup (building block). The trigger
 * reports its popup with aria-haspopup, aria-expanded and aria-controls;
 * Escape and clicks outside close the popup. Menu, Dropdown and MoreInfo
 * add their own semantics on top.
 */
function DropdownLayout(props: Props) {
    const {
        className,
        popupClassName,
        preferredPopupWidth,
        label,
        before,
        after,
        withoutDropdownIcon,
        ariaLabel,
        ariaHasPopup = 'true',
        persistent,
        disabled,
        children,
        tone,
        fill,
        withBorder,
        shape,
    } = props;

    const popupId = useId();
    const triggerRef = useRef<HTMLButtonElement>(null);
    const popupRef = useRef<HTMLDivElement>(null);
    const [open, setOpen] = useState(false);

    const close = useCallback(() => setOpen(false), []);
    const focusTrigger = useCallback(() => triggerRef.current?.focus(), []);
    const controls = useMemo(() => ({ close, focusTrigger }), [close, focusTrigger]);

    const handleBlur = useCallback(
        (clickedInside: boolean, clickedInParent: boolean) => {
            if (clickedInParent || (clickedInside && persistent)) {
                return;
            }
            setOpen(false);
        },
        [persistent],
    );
    useBlurEffect(open, handleBlur, popupRef, triggerRef);

    const handleKeyDown = (event: React.KeyboardEvent) => {
        if (event.key === 'Escape' && open) {
            event.stopPropagation();
            setOpen(false);
            focusTrigger();
        }
    };

    let dropdownIcon: React.ReactNode;
    if (!withoutDropdownIcon) {
        dropdownIcon = open
            ? <ArrowUpSmallFillIcon className={styles.dropdownIcon} />
            : <ArrowDownSmallFillIcon className={styles.dropdownIcon} />;
    }

    return (
        <>
            <RawButton
                className={styles.trigger}
                elementRef={triggerRef}
                name={undefined}
                onClick={() => setOpen((prevOpen) => !prevOpen)}
                onKeyDown={handleKeyDown}
                aria-haspopup={ariaHasPopup}
                aria-expanded={open}
                aria-controls={open ? popupId : undefined}
                aria-label={ariaLabel}
                disabled={disabled}
            >
                <ButtonLayout
                    className={className}
                    tone={tone}
                    fill={fill}
                    withBorder={withBorder}
                    shape={shape}
                    before={before}
                    after={(after || dropdownIcon) && (
                        <>
                            {after}
                            {dropdownIcon}
                        </>
                    )}
                    disabled={disabled}
                >
                    {label}
                </ButtonLayout>
            </RawButton>
            {open && (
                <Popover
                    id={popupId}
                    elementRef={popupRef}
                    parentRef={triggerRef}
                    className={_cs(styles.popup, popupClassName)}
                    preferredWidth={preferredPopupWidth}
                >
                    {/* eslint-disable-next-line jsx-a11y/no-static-element-interactions */}
                    <div className={styles.popupContent} onKeyDown={handleKeyDown}>
                        <PopupControlsContext.Provider value={controls}>
                            {children}
                        </PopupControlsContext.Provider>
                    </div>
                </Popover>
            )}
        </>
    );
}

export default DropdownLayout;
