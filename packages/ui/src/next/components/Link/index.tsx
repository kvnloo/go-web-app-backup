import { useContext } from 'react';
import {
    ArrowRightUpLineIcon,
    ChevronRightLineIcon,
} from '@ifrc-go/icons';
import { isFalsyString } from '@togglecorp/fujs';

import LinkContext, { getHrefKind } from '#contexts/link';
import ButtonLayout, { type Props as ButtonLayoutProps } from '#next/base/ButtonLayout';

import styles from './styles.module.css';

/**
 * text: reads like text, red on hover (the default);
 * underline: record names in tables, "View All" and sources;
 * primary and secondary: the filled and outlined button looks.
 */
export type LinkVariant = 'text' | 'underline' | 'primary' | 'secondary';

type LinkLook = Pick<ButtonLayoutProps, 'tone' | 'fill' | 'withBorder' | 'shape' | 'withUnderline'>;

const variantToLook: Record<LinkVariant, LinkLook> = {
    text: { tone: 'neutral', fill: 'none', shape: 'inline' },
    underline: {
        tone: 'neutral', fill: 'none', shape: 'inline', withUnderline: true,
    },
    primary: { tone: 'primary', fill: 'solid' },
    secondary: { tone: 'primary', fill: 'none', withBorder: true },
};

export interface Props {
    className?: string;
    /** Without an href the content renders as plain text */
    href: string | null | undefined;
    children?: React.ReactNode;
    variant?: LinkVariant;
    /**
     * Forces the external treatment (new tab, up-right arrow); by default it
     * applies to absolute URLs on another origin
     */
    external?: boolean;
    /** Adds a chevron after an internal link */
    withLinkIcon?: boolean;
    before?: React.ReactNode;
    disabled?: boolean;
}

function getOrigin() {
    return typeof window === 'undefined' ? 'http://localhost' : window.location.origin;
}

/**
 * A link. Internal links render through the router component given to the
 * link context, so navigation stays client-side; external links open in a
 * new tab and always show the up-right arrow. On a dark surface the colours
 * switch automatically.
 */
function Link(props: Props) {
    const {
        className,
        href,
        children,
        variant = 'text',
        external: externalFromProps,
        withLinkIcon,
        before,
        disabled,
    } = props;

    const { renderInternal: InternalLink } = useContext(LinkContext);

    const hrefKind = isFalsyString(href) ? undefined : getHrefKind(href, getOrigin());
    const external = externalFromProps ?? hrefKind === 'external';
    const inactive = disabled || isFalsyString(href);

    let icon: React.ReactNode;
    if (external) {
        icon = <ArrowRightUpLineIcon />;
    } else if (withLinkIcon) {
        icon = <ChevronRightLineIcon />;
    }

    const content = (
        <ButtonLayout
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...variantToLook[variant]}
            className={className}
            before={before}
            after={icon}
            disabled={disabled}
        >
            {children}
        </ButtonLayout>
    );

    if (inactive) {
        return <span className={styles.link}>{content}</span>;
    }

    if (external) {
        return (
            <a
                className={styles.link}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
            >
                {content}
            </a>
        );
    }

    if (hrefKind === 'internal' && InternalLink) {
        return (
            <InternalLink className={styles.link} href={href}>
                {content}
            </InternalLink>
        );
    }

    return (
        <a className={styles.link} href={href}>
            {content}
        </a>
    );
}

export default Link;
