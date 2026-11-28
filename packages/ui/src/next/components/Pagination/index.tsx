import {
    ChevronLeftLineIcon,
    ChevronRightLineIcon,
} from '@ifrc-go/icons';
import { _cs } from '@togglecorp/fujs';

import useTranslation from '#hooks/useTranslation';
import RawButton from '#next/base/RawButton';
import { resolveToString } from '#utils/translation';

import { getPageItems } from './pages';

import i18n from './i18n.json';
import styles from './styles.module.css';

export interface Props {
    className?: string;
    /** 1-based */
    activePage: number;
    onActivePageChange: (page: number) => void;
    /** Total number of items across all pages */
    numItems: number;
    numItemsPerPage: number;
    disabled?: boolean;
}

/**
 * Page navigation for a paged list, in a labelled <nav>. The current page
 * is marked with aria-current; long runs of pages collapse into gaps.
 * Renders nothing when everything fits on one page.
 */
function Pagination(props: Props) {
    const {
        className,
        activePage: activePageFromProps,
        onActivePageChange,
        numItems,
        numItemsPerPage,
        disabled = false,
    } = props;

    const strings = useTranslation(i18n);

    const numPages = Math.max(Math.ceil(numItems / numItemsPerPage), 1);
    const activePage = Math.min(Math.max(activePageFromProps, 1), numPages);

    if (numPages <= 1) {
        return null;
    }

    return (
        <nav className={_cs(styles.pagination, className)} aria-label={strings.paginationLabel}>
            <RawButton
                className={styles.pageButton}
                name={activePage - 1}
                onClick={onActivePageChange}
                disabled={disabled || activePage <= 1}
                aria-label={strings.paginationPreviousPageLabel}
            >
                <ChevronLeftLineIcon className={styles.icon} />
            </RawButton>
            {getPageItems(activePage, numPages).map((item) => {
                if (item.type === 'gap') {
                    return (
                        <span key={item.key} className={styles.pageButton} aria-hidden>
                            …
                        </span>
                    );
                }
                if (item.type === 'active') {
                    return (
                        <span
                            key={item.page}
                            className={_cs(
                                styles.pageButton,
                                styles.active,
                                String(item.page).length > 2 && styles.compact,
                            )}
                            aria-current="page"
                        >
                            {item.page}
                        </span>
                    );
                }
                return (
                    <RawButton
                        key={item.page}
                        className={_cs(
                            styles.pageButton,
                            String(item.page).length > 2 && styles.compact,
                        )}
                        name={item.page}
                        onClick={onActivePageChange}
                        disabled={disabled}
                        aria-label={resolveToString(
                            strings.paginationGoToPageLabel,
                            { page: item.page },
                        )}
                    >
                        {item.page}
                    </RawButton>
                );
            })}
            <RawButton
                className={styles.pageButton}
                name={activePage + 1}
                onClick={onActivePageChange}
                disabled={disabled || activePage >= numPages}
                aria-label={strings.paginationNextPageLabel}
            >
                <ChevronRightLineIcon className={styles.icon} />
            </RawButton>
        </nav>
    );
}

export default Pagination;
