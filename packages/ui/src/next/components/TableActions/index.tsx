import { Children } from 'react';
import { MoreFillIcon } from '@ifrc-go/icons';
import { _cs } from '@togglecorp/fujs';

import useTranslation from '#hooks/useTranslation';
import ListLayout from '#next/base/ListLayout';

import Menu from '../Menu';

import i18n from './i18n.json';
import styles from './styles.module.css';

export interface Props {
    className?: string;
    /** Controls shown in the row, before the menu, such as an edit link */
    actions?: React.ReactNode;
    /** MenuItems of the row's "More actions" menu; without any, there is no menu */
    children?: React.ReactNode;
}

/**
 * The actions of a table row: a few controls in the row and the rest in a
 * "More actions" menu. Aligned to the end of the cell and as wide as its
 * content, so the menus of all rows line up.
 */
function TableActions(props: Props) {
    const {
        className,
        actions,
        children,
    } = props;

    const strings = useTranslation(i18n);
    const withMenu = Children.toArray(children).length > 0;

    if (!actions && !withMenu) {
        return null;
    }

    return (
        <ListLayout
            className={_cs(styles.tableActions, className)}
            layout="inline"
            align="end"
            spacing="sm"
        >
            {actions}
            {withMenu && (
                <Menu
                    icon={<MoreFillIcon />}
                    ariaLabel={strings.tableMoreActionsLabel}
                >
                    {children}
                </Menu>
            )}
        </ListLayout>
    );
}

export default TableActions;
