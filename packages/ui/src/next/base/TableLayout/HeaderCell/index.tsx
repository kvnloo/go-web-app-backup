import {
    useCallback,
    useContext,
    useRef,
} from 'react';
import {
    ArrowDropDownLineIcon,
    ArrowDropUpLineIcon,
    TableSortingLineIcon,
} from '@ifrc-go/icons';
import {
    _cs,
    isNotDefined,
} from '@togglecorp/fujs';

// NOTE: shares the v2 strings (same "common" namespace keys)
import i18n from '#components/Table/HeaderCell/i18n.json';
import useTranslation from '#hooks/useTranslation';

import ButtonLayout from '../../ButtonLayout';
import RawButton from '../../RawButton';
import TableSortingContext from '../sorting';
import type {
    BaseHeader,
    SortDirection,
} from '../types';

import styles from './styles.module.css';

export interface HeaderCellProps extends BaseHeader {
    /** Show the sort toggle, wired to the table's sorting props */
    sortable?: boolean;
    /** Direction applied on the first sort interaction (default 'asc') */
    defaultSortDirection?: SortDirection;
    /** A rendered explanation marker (the exposed Table passes a MoreInfo) */
    info?: React.ReactNode;
}

/**
 * Specific component for a table column header cell with optional
 * sorting control and info popup.
 */
function HeaderCell(props: HeaderCellProps) {
    const {
        className,
        titleClassName,
        title,
        name,

        sortable,
        defaultSortDirection = 'asc',
        info,
    } = props;

    const {
        sorting,
        onSortingChange: onSortChange,
    } = useContext(TableSortingContext);
    const strings = useTranslation(i18n);

    const sortDirection = sorting?.name === name
        ? sorting.direction
        : undefined;

    const containerRef = useRef<HTMLDivElement>(null);

    const handleSortClick = useCallback(
        () => {
            if (isNotDefined(onSortChange)) {
                return;
            }
            let newSortDirection: SortDirection | undefined;
            if (isNotDefined(sortDirection)) {
                newSortDirection = defaultSortDirection;
            } else if (sortDirection === 'asc') {
                newSortDirection = 'dsc';
            } else if (sortDirection === 'dsc') {
                newSortDirection = 'asc';
            }

            if (newSortDirection) {
                onSortChange({ name, direction: newSortDirection });
            } else {
                onSortChange(undefined);
            }
        },
        [name, onSortChange, sortDirection, defaultSortDirection],
    );

    return (
        <div
            ref={containerRef}
            className={_cs(
                className,
                styles.headerCell,
            )}
        >
            {sortable && (
                <RawButton
                    name={undefined}
                    onClick={handleSortClick}
                    title={strings.sortTableButtonTitle}
                    aria-label={strings.sortTableButtonTitle}
                    className={styles.sortButton}
                >
                    <ButtonLayout shape="inline">
                        {isNotDefined(sortDirection)
                            && <TableSortingLineIcon className={styles.icon} />}
                        {sortDirection === 'asc' && <ArrowDropUpLineIcon className={styles.icon} />}
                        {sortDirection === 'dsc' && <ArrowDropDownLineIcon className={styles.icon} />}
                    </ButtonLayout>
                </RawButton>
            )}
            <div className={_cs(titleClassName, styles.title)}>
                {title}
            </div>
            {info && (
                <span className={styles.infoPopupIcon}>
                    {info}
                </span>
            )}
        </div>
    );
}

export default HeaderCell;
