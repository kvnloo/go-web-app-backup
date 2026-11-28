import { useContext } from 'react';
import { isFalsyString } from '@togglecorp/fujs';

import LinkContext, { getHrefKind } from '#contexts/link';
import TabLayout from '#next/base/TabLayout';

import NavigationContext from '../NavigationTabList/navigation';

import styles from './styles.module.css';

export interface Props {
    className?: string;
    href: string | null | undefined;
    /** The tab of the current page; the app's wrapper matches it against the route */
    active?: boolean;
    children: React.ReactNode;
    disabled?: boolean;
    /** Marks the tab as having errors (a form step with invalid fields) */
    errored?: boolean;
    before?: React.ReactNode;
}

function getOrigin() {
    return typeof window === 'undefined' ? 'http://localhost' : window.location.origin;
}

/** One link of a NavigationTabList, routed through the link context */
function NavigationTab(props: Props) {
    const {
        className,
        href,
        active = false,
        children,
        disabled,
        errored,
        before,
    } = props;

    const { tone, variant } = useContext(NavigationContext);
    const { renderInternal: InternalLink } = useContext(LinkContext);

    const look = (
        <TabLayout
            className={className}
            tone={tone}
            variant={variant}
            active={active}
            disabled={disabled}
            errored={errored}
            before={before}
        >
            {children}
        </TabLayout>
    );

    if (disabled || isFalsyString(href)) {
        return <span className={styles.navigationTab}>{look}</span>;
    }

    const linkProps = {
        className: styles.navigationTab,
        'aria-current': active ? 'page' as const : undefined,
    };

    if (InternalLink && getHrefKind(href, getOrigin()) === 'internal') {
        return (
            // eslint-disable-next-line react/jsx-props-no-spreading
            <InternalLink {...linkProps} href={href}>
                {look}
            </InternalLink>
        );
    }

    return (
        // eslint-disable-next-line react/jsx-props-no-spreading
        <a {...linkProps} href={href}>
            {look}
        </a>
    );
}

export default NavigationTab;
