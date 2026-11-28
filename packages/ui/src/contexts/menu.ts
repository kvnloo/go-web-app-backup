import { createContext } from 'react';

export interface ConfirmationRequest {
    heading?: React.ReactNode;
    message: React.ReactNode;
    confirmLabel?: React.ReactNode;
    onConfirm: () => void;
}

export interface MenuContextProps {
    /** Closes the menu */
    close: () => void;
    /**
     * Asks the menu to confirm an action; the menu renders the dialog outside
     * its popup, so it stays open after the menu closes
     */
    requestConfirmation: (request: ConfirmationRequest) => void;
}

// NOTE: outside a Menu, a menu item confirms nothing and closes nothing
const MenuContext = createContext<MenuContextProps | undefined>(undefined);

export default MenuContext;
