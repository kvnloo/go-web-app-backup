import { Children } from 'react';
import { ChevronRightLineIcon } from '@ifrc-go/icons';
import { _cs } from '@togglecorp/fujs';

import useTranslation from '#hooks/useTranslation';

import i18n from './i18n.json';
import styles from './styles.module.css';

export interface Props {
    className?: string;
    /** Links to the pages above this one, then the current page's name */
    children: React.ReactNode;
}

/**
 * The trail of pages above the current one, in a labelled <nav> list. The
 * last item is the current page. On a dark surface the colours switch
 * automatically.
 */
function Breadcrumbs(props: Props) {
    const { className, children } = props;
    const strings = useTranslation(i18n);
    const items = Children.toArray(children);

    return (
        <nav
            className={_cs(styles.breadcrumbs, className)}
            aria-label={strings.breadcrumbsNavigationLabel}
        >
            <ol className={styles.list}>
                {items.map((item, index) => {
                    const last = index === items.length - 1;
                    return (
                        <li
                            // eslint-disable-next-line react/no-array-index-key
                            key={index}
                            className={styles.item}
                            aria-current={last ? 'page' : undefined}
                        >
                            {item}
                            {!last && (
                                <ChevronRightLineIcon className={styles.separator} aria-hidden />
                            )}
                        </li>
                    );
                })}
            </ol>
        </nav>
    );
}

export default Breadcrumbs;
