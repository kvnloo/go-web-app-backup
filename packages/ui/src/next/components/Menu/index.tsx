import {
    useContext,
    useMemo,
    useState,
} from 'react';
import { _cs } from '@togglecorp/fujs';

import MenuContext, {
    type ConfirmationRequest,
    type MenuContextProps,
} from '#contexts/menu';
import PopupControlsContext from '#contexts/popup-controls';
import DropdownLayout from '#next/base/DropdownLayout';
import {
    type ButtonVariant,
    buttonVariantToLook,
} from '#next/utils/button';

import ConfirmDialog from '../ConfirmDialog';
import MenuList from './MenuList';

import styles from './styles.module.css';

type TriggerProps =
    | { label: React.ReactNode; icon?: never; ariaLabel?: never }
    /** An icon-only trigger (such as a "more" menu) needs a name and shows no arrow */
    | { icon: React.ReactNode; ariaLabel: string; label?: never };

interface BaseProps {
    className?: string;
    before?: React.ReactNode;
    /** Look of the trigger; defaults to secondary, tertiary for an icon */
    variant?: ButtonVariant;
    /** MenuItems */
    children: React.ReactNode;
    disabled?: boolean;
}

export type Props = BaseProps & TriggerProps;

interface MenuPopupProps {
    onConfirmationRequest: (request: ConfirmationRequest) => void;
    children: React.ReactNode;
}

function MenuPopup(props: MenuPopupProps) {
    const {
        onConfirmationRequest,
        children,
    } = props;

    const { close, focusTrigger } = useContext(PopupControlsContext);
    const value = useMemo<MenuContextProps>(() => ({
        // NOTE: the chosen item unmounts with the menu, so focus goes back to
        // the trigger first; a dialog the item opens then restores it there
        close: () => {
            focusTrigger();
            close();
        },
        requestConfirmation: onConfirmationRequest,
    }), [close, focusTrigger, onConfirmationRequest]);

    return (
        <MenuContext.Provider value={value}>
            <MenuList
                className={styles.menuList}
                onRequestClose={close}
                focusTrigger={focusTrigger}
            >
                {children}
            </MenuList>
        </MenuContext.Provider>
    );
}

/**
 * A button that opens a list of MenuItems, with the menu keyboard model.
 * Items close the menu when chosen; an item that asks for confirmation gets
 * its dialog from the menu, so it outlives the closed popup.
 */
function Menu(props: Props) {
    const {
        className,
        label,
        icon,
        ariaLabel,
        before,
        variant = icon ? 'tertiary' : 'secondary',
        children,
        disabled,
    } = props;

    const [confirmation, setConfirmation] = useState<ConfirmationRequest>();

    return (
        <>
            <DropdownLayout
                // eslint-disable-next-line react/jsx-props-no-spreading
                {...buttonVariantToLook[variant]}
                className={_cs(icon && styles.iconTrigger, className)}
                label={label ?? icon}
                before={before}
                ariaLabel={ariaLabel}
                ariaHasPopup="menu"
                withoutDropdownIcon={!!icon}
                disabled={disabled}
            >
                <MenuPopup onConfirmationRequest={setConfirmation}>
                    {children}
                </MenuPopup>
            </DropdownLayout>
            {confirmation && (
                <ConfirmDialog
                    name={undefined}
                    heading={confirmation.heading}
                    message={confirmation.message}
                    confirmLabel={confirmation.confirmLabel}
                    onConfirm={() => {
                        setConfirmation(undefined);
                        confirmation.onConfirm();
                    }}
                    onCancel={() => setConfirmation(undefined)}
                />
            )}
        </>
    );
}

export default Menu;
