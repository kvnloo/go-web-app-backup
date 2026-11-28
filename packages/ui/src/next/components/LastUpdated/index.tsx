import { _cs } from '@togglecorp/fujs';

import useTranslation from '#hooks/useTranslation';
import RawDisplay from '#next/base/RawDisplay';
import type { DateLike } from '#utils/common';

import i18n from './i18n.json';
import styles from './styles.module.css';

export interface Props {
    className?: string;
    date: DateLike | null | undefined;
}

/** A small "Last updated" date, for a heading row */
function LastUpdated(props: Props) {
    const { className, date } = props;
    const strings = useTranslation(i18n);

    return (
        <span className={_cs(styles.lastUpdated, className)}>
            <span className={styles.label}>{strings.lastUpdatedDateLabel}</span>
            <RawDisplay valueType="date" value={date} />
        </span>
    );
}

export default LastUpdated;
