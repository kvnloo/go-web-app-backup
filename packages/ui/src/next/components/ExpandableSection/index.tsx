import { useContext } from 'react';
import { ArrowDownSmallFillIcon } from '@ifrc-go/icons';
import { _cs } from '@togglecorp/fujs';

import HeadingLevelContext from '#contexts/heading-level';
import ListLayout, { type Props as ListLayoutProps } from '#next/base/ListLayout';
import type { ContentLayoutProps } from '#next/utils/container';
import { useNestedHeadingLevel } from '#next/utils/heading';

import Description from '../Description';
import Heading from '../Heading';

import styles from './styles.module.css';

interface BaseProps {
    className?: string;
    /** The always-visible summary */
    heading: React.ReactNode;
    description?: React.ReactNode;
    /** Shown before the heading */
    icon?: React.ReactNode;
    children?: React.ReactNode;
    /** Sections with the same name form a group where only one is open (a FAQ) */
    name?: string;
    initiallyExpanded?: boolean;
    onExpansionChange?: (expanded: boolean) => void;
}

export type Props = BaseProps & ContentLayoutProps;

/**
 * A disclosure on the native <details> element: the heading toggles the
 * content, find-in-page opens it, and sections sharing a `name` close each
 * other.
 */
function ExpandableSection(props: Props) {
    const {
        className,
        heading,
        description,
        icon,
        children,
        name,
        initiallyExpanded,
        onExpansionChange,
        layout = 'block',
        layoutOptions,
    } = props;

    const { level, contextValue } = useNestedHeadingLevel();
    const parentHeadingLevel = useContext(HeadingLevelContext);

    // NOTE: the layout union pairs each layout with its options
    const contentLayoutProps = { layout, ...layoutOptions } as ListLayoutProps;

    return (
        <details
            className={_cs(styles.expandableSection, className)}
            name={name}
            open={initiallyExpanded}
            onToggle={(event) => onExpansionChange?.(event.currentTarget.open)}
        >
            <summary className={styles.summary}>
                {icon && <span className={styles.icon} aria-hidden>{icon}</span>}
                <Heading level={level} variant="card">
                    {heading}
                </Heading>
                <ArrowDownSmallFillIcon className={styles.indicator} />
            </summary>
            <ListLayout
                // eslint-disable-next-line react/jsx-props-no-spreading
                {...contentLayoutProps}
                className={styles.content}
            >
                <Description variant="light">{description}</Description>
                <HeadingLevelContext.Provider value={heading ? contextValue : parentHeadingLevel}>
                    {children}
                </HeadingLevelContext.Provider>
            </ListLayout>
        </details>
    );
}

export default ExpandableSection;
