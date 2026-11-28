import type { HeadingLevel } from '#contexts/heading-level';

import Heading, { type HeadingVariant } from '../Heading';
import MoreInfo from '../MoreInfo';

import styles from './styles.module.css';

interface Props {
    id: string;
    level: HeadingLevel;
    variant: HeadingVariant;
    children: React.ReactNode;
    info?: React.ReactNode;
    /** Shows an asterisk after the heading */
    required?: boolean;
}

/** The heading of a container flavour, with its info trigger (internal) */
function FlavourHeading(props: Props) {
    const {
        id,
        level,
        variant,
        children,
        info,
        required,
    } = props;

    const heading = (
        <Heading
            className={info ? styles.inlineHeading : undefined}
            id={id}
            level={level}
            variant={variant}
        >
            {children}
            {required && <span className={styles.asterisk} aria-hidden>*</span>}
        </Heading>
    );

    if (!info) {
        return heading;
    }

    // NOTE: the heading and the icon flow inline, so the icon follows the
    // last word of a wrapped heading; it stays outside the heading element so
    // its name is not read as part of the heading
    return (
        <div>
            {heading}
            <span className={styles.info}>
                <MoreInfo heading={children}>{info}</MoreInfo>
            </span>
        </div>
    );
}

export default FlavourHeading;
