import { useContext } from 'react';
import { ArrowRightUpLineIcon } from '@ifrc-go/icons';
import { isFalsyString } from '@togglecorp/fujs';

import LinkContext, { getHrefKind } from '#contexts/link';
import MenuContext from '#contexts/menu';
import ButtonLayout from '#next/base/ButtonLayout';
import RawButton from '#next/base/RawButton';

import styles from './styles.module.css';

interface BaseProps {
    className?: string;
    children: React.ReactNode;
    before?: React.ReactNode;
    disabled?: boolean;
    /** Keeps the menu open after the item is chosen */
    persist?: boolean;
}

interface LinkProps {
    href: string | null | undefined;
    name?: never;
    onClick?: never;
    onConfirm?: never;
    confirmMessage?: never;
    confirmHeading?: never;
}

interface ActionProps<NAME> {
    href?: never;
    name: NAME;
    onClick: (name: NAME, event: React.MouseEvent<HTMLButtonElement>) => void;
    onConfirm?: never;
    confirmMessage?: never;
    confirmHeading?: never;
}

interface ConfirmProps<NAME> {
    href?: never;
    name: NAME;
    onClick?: never;
    /** Called once the user confirms; the item label is the confirming action */
    onConfirm: (name: NAME) => void;
    confirmMessage: React.ReactNode;
    confirmHeading?: React.ReactNode;
}

export type Props<NAME> = BaseProps & (LinkProps | ActionProps<NAME> | ConfirmProps<NAME>);

function getOrigin() {
    return typeof window === 'undefined' ? 'http://localhost' : window.location.origin;
}

/**
 * One entry of a Menu. With `href` it is a link (internal links go through
 * the router from the link context), with `onClick` an action, and with
 * `onConfirm` an action that asks first. Choosing it closes the menu.
 */
function MenuItem<const NAME>(props: Props<NAME>) {
    const {
        className,
        children,
        before,
        disabled,
        persist,
        href,
        name,
        onClick,
        onConfirm,
        confirmMessage,
        confirmHeading,
    } = props;

    const menu = useContext(MenuContext);
    const { renderInternal: InternalLink } = useContext(LinkContext);

    const closeMenu = () => {
        if (!persist) {
            menu?.close();
        }
    };

    const external = !isFalsyString(href) && getHrefKind(href, getOrigin()) === 'external';

    const content = (
        <ButtonLayout
            className={className}
            tone="neutral"
            fill="none"
            before={before}
            after={external ? <ArrowRightUpLineIcon /> : undefined}
            disabled={disabled}
            withFullWidth
        >
            {children}
        </ButtonLayout>
    );

    if (onClick || onConfirm) {
        const handleClick = (itemName: NAME, event: React.MouseEvent<HTMLButtonElement>) => {
            closeMenu();
            if (onConfirm) {
                menu?.requestConfirmation({
                    heading: confirmHeading,
                    message: confirmMessage,
                    confirmLabel: children,
                    onConfirm: () => onConfirm(itemName),
                });
                return;
            }
            onClick?.(itemName, event);
        };

        return (
            <RawButton
                className={styles.menuItem}
                role="menuitem"
                name={name as NAME}
                onClick={handleClick}
                disabled={disabled}
            >
                {content}
            </RawButton>
        );
    }

    if (disabled || isFalsyString(href)) {
        return (
            <span className={styles.menuItem} role="menuitem" aria-disabled>
                {content}
            </span>
        );
    }

    const linkProps = {
        className: styles.menuItem,
        role: 'menuitem',
        onClick: closeMenu,
    };

    if (external) {
        return (
            <a
                // eslint-disable-next-line react/jsx-props-no-spreading
                {...linkProps}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
            >
                {content}
            </a>
        );
    }

    if (InternalLink && getHrefKind(href, getOrigin()) === 'internal') {
        return (
            // eslint-disable-next-line react/jsx-props-no-spreading
            <InternalLink {...linkProps} href={href}>
                {content}
            </InternalLink>
        );
    }

    return (
        // eslint-disable-next-line react/jsx-props-no-spreading
        <a {...linkProps} href={href}>
            {content}
        </a>
    );
}

export default MenuItem;
