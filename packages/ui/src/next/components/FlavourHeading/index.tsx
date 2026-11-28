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
        <Heading id={id} level={level} variant={variant}>
            {children}
            {required && <span className={styles.asterisk} aria-hidden>*</span>}
        </Heading>
    );

    if (!info) {
        return heading;
    }

    return (
        <div className={styles.headingWithInfo}>
            {heading}
            <MoreInfo heading={children}>{info}</MoreInfo>
        </div>
    );
}

export default FlavourHeading;
