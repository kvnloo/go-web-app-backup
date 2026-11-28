import {
    useEffect,
    useId,
    useRef,
} from 'react';
import { CloseLineIcon } from '@ifrc-go/icons';
import { _cs } from '@togglecorp/fujs';

// NOTE: shares the v2 close label (same "common" namespace key); the file
// moves here when v2 is removed
import i18n from '#components/Modal/i18n.json';
import HeadingLevelContext from '#contexts/heading-level';
import useTranslation from '#hooks/useTranslation';
import ContainerLayout from '#next/base/ContainerLayout';
import {
    type AsyncStateProps,
    type ContentLayoutProps,
    getAsyncStateLayoutProps,
} from '#next/utils/container';

import Heading from '../Heading';
import IconButton from '../IconButton';

import styles from './styles.module.css';

/** sm: confirmations; md: the default; lg and xl: wide content; full: long lists */
export type DialogSize = 'sm' | 'md' | 'lg' | 'xl' | 'full';

const sizeToClassName: Record<DialogSize, string> = {
    sm: styles.sizeSm,
    md: styles.sizeMd,
    lg: styles.sizeLg,
    xl: styles.sizeXl,
    full: styles.sizeFull,
};

interface BaseProps extends AsyncStateProps {
    className?: string;
    description?: React.ReactNode;
    /** Controls on the heading row, before the close button */
    actions?: React.ReactNode;
    footer?: React.ReactNode;
    footerActions?: React.ReactNode;
    children?: React.ReactNode;
    size?: DialogSize;
    /** Called by the close button and Escape; without it the dialog cannot be dismissed */
    onClose?: () => void;
}

type NameProps =
    | { heading: React.ReactNode; ariaLabel?: never }
    | { heading?: never; ariaLabel: string };

export type Props = BaseProps & NameProps & ContentLayoutProps;

// NOTE: a dialog starts its own outline: its heading is h2 and what it holds sits below it
const dialogHeadingLevel = { level: 2 } as const;

/**
 * A modal dialog on the native <dialog> element: it is shown while mounted,
 * traps focus, restores it on close and inerts the page behind it. Escape
 * and the close button call `onClose`; the owner unmounts the dialog. It
 * needs a heading, or an `ariaLabel` when it has none.
 */
function Dialog(props: Props) {
    const {
        className,
        heading,
        ariaLabel,
        description,
        actions,
        footer,
        footerActions,
        children,
        size = 'md',
        onClose,
        layout = 'block',
        layoutOptions,
        ...asyncStateProps
    } = props;

    const strings = useTranslation(i18n);
    const dialogRef = useRef<HTMLDialogElement>(null);
    const headingId = useId();

    useEffect(() => {
        const dialogElement = dialogRef.current;
        dialogElement?.showModal();
        // NOTE: focus the dialog, not its first control (the close button), so
        // it is announced by name and no focus ring shows on open
        dialogElement?.focus();

        // NOTE: showModal() inerts the page but does not stop it scrolling
        const prevOverflow = document.body.style.overflow;
        document.body.style.overflow = 'hidden';

        return () => {
            document.body.style.overflow = prevOverflow;
            dialogElement?.close();
        };
    }, []);

    const handleCancel = (event: React.SyntheticEvent<HTMLDialogElement>) => {
        // NOTE: the owner closes the dialog by unmounting it, so React stays in charge
        event.preventDefault();
        onClose?.();
    };

    return (
        <dialog
            ref={dialogRef}
            className={_cs(styles.dialog, sizeToClassName[size])}
            aria-labelledby={heading ? headingId : undefined}
            aria-label={heading ? undefined : ariaLabel}
            tabIndex={-1}
            onCancel={handleCancel}
        >
            <HeadingLevelContext.Provider value={dialogHeadingLevel}>
                <ContainerLayout
                    className={_cs(styles.content, className)}
                    heading={heading && (
                        <Heading id={headingId} level={dialogHeadingLevel.level} variant="card">
                            {heading}
                        </Heading>
                    )}
                    description={description}
                    actions={(actions || onClose) && (
                        <>
                            {actions}
                            {onClose && (
                                <IconButton
                                    name={undefined}
                                    onClick={onClose}
                                    label={strings.closeButtonLabel}
                                >
                                    <CloseLineIcon />
                                </IconButton>
                            )}
                        </>
                    )}
                    headerWrapBreakpoint="none"
                    footer={footer}
                    footerActions={footerActions}
                    footerWrapBreakpoint="none"
                    backgroundColor="foreground"
                    withPadding
                    withContentOverflow
                    layout={layout}
                    layoutOptions={layoutOptions}
                    // eslint-disable-next-line react/jsx-props-no-spreading
                    {...getAsyncStateLayoutProps(asyncStateProps)}
                >
                    {children}
                </ContainerLayout>
            </HeadingLevelContext.Provider>
        </dialog>
    );
}

export default Dialog;
