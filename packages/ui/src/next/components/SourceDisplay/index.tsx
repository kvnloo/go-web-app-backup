import { _cs } from '@togglecorp/fujs';

import useTranslation from '#hooks/useTranslation';

import Link from '../Link';

import i18n from './i18n.json';
import styles from './styles.module.css';

export interface Source {
    label: React.ReactNode;
    href: string | null | undefined;
}

export interface Props {
    className?: string;
    sources: Source[];
}

/** "Source:" followed by links to where the figures come from */
function SourceDisplay(props: Props) {
    const { className, sources } = props;
    const strings = useTranslation(i18n);

    if (sources.length === 0) {
        return null;
    }

    return (
        <p className={_cs(styles.sourceDisplay, className)}>
            <span className={styles.label}>{strings.sourceDisplayLabel}</span>
            {sources.map((source, index) => (
                // eslint-disable-next-line react/no-array-index-key
                <span key={index} className={styles.source}>
                    <Link href={source.href} variant="underline">{source.label}</Link>
                </span>
            ))}
        </p>
    );
}

export default SourceDisplay;
