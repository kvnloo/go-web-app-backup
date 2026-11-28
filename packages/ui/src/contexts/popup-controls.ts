import { createContext } from 'react';

export interface PopupControls {
    close: () => void;
    /** Moves focus back to the trigger (after Escape) */
    focusTrigger: () => void;
}

/** Lets popup content close its popup and return focus to the trigger */
const PopupControlsContext = createContext<PopupControls>({
    close: () => undefined,
    focusTrigger: () => undefined,
});

export default PopupControlsContext;
