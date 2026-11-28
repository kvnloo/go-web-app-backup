import { useContext } from 'react';
import { _cs } from '@togglecorp/fujs';

import HeadingLevelContext, {
    getNextHeadingLevel,
    type HeadingLevel,
} from '#contexts/heading-level';
import TextLayout from '#next/base/TextLayout';

import styles from './styles.module.css';

/**
 * display: large heading for prominent content blocks;
 * section: uppercase heading of a page or tab section;
 * card: heading of a card, form section or dialog;
 * group: small heading of a group of fields or facts.
 */
export type HeadingVariant = 'display' | 'section' | 'card' | 'group';

export interface Props {
    className?: string;
    /** Id of the heading element, for aria-labelledby */
    id?: string;
    children?: React.ReactNode;
    /** Defaults to the look that matches the resolved level */
    variant?: HeadingVariant;
    /**
     * Forces the level. Normally it is derived from nesting: one below the
     * nearest heading above (the page title is h1)
     */
    level?: HeadingLevel;
}

const variantToClassName: Record<HeadingVariant, string> = {
    display: styles.display,
    section: styles.section,
    card: styles.card,
    group: styles.group,
};

function getDefaultHeadingVariant(level: HeadingLevel): HeadingVariant {
    if (level <= 2) {
        return 'section';
    }
    if (level === 3) {
        return 'card';
    }
    return 'group';
}

/**
 * A section heading. Its level follows from where it sits (one below the
 * nearest heading above), and its look from `variant`, so the document
 * outline stays correct whatever the look. Renders nothing without children.
 */
function Heading(props: Props) {
    const {
        className,
        id,
        children,
        variant: variantFromProps,
        level: levelFromProps,
    } = props;

    const { level: parentLevel } = useContext(HeadingLevelContext);
    const level = levelFromProps ?? getNextHeadingLevel(parentLevel);
    const variant = variantFromProps ?? getDefaultHeadingVariant(level);

    if (!children) {
        return null;
    }

    return (
        <TextLayout
            as={`h${level}`}
            id={id}
            className={_cs(styles.heading, variantToClassName[variant], className)}
            textWrap="balance"
        >
            {children}
        </TextLayout>
    );
}

export default Heading;
