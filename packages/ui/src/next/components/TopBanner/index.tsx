import { _cs } from '@togglecorp/fujs';

import type { StatusType } from '#utils/style';

import styles from './styles.module.css';

type LookProps =
    /** A tinted strip in a status colour (information by default) */
    | { variant?: 'default'; status?: StatusType }
    /** The solid red announcement strip */
    | { variant: 'brand'; status?: never };

interface BaseProps {
    className?: string;
    children?: React.ReactNode;
}

export type Props = BaseProps & LookProps;

const statusToClassName: Record<StatusType, string> = {
    positive: styles.positive,
    information: styles.information,
    warning: styles.warning,
    negative: styles.negative,
};

/** A full-width strip at the top of a page for a site-wide announcement */
function TopBanner(props: Props) {
    const {
        className,
        children,
        variant = 'default',
        status = 'information',
    } = props;

    return (
        <div
            role="status"
            className={_cs(
                styles.topBanner,
                variant === 'brand' ? styles.brand : statusToClassName[status],
                className,
            )}
        >
            {children}
        </div>
    );
}

export default TopBanner;
