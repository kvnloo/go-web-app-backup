import {
    useCallback,
    useMemo,
    useState,
} from 'react';

/** Open and close state for a Dialog opened from a button */
function useDialogState(initiallyOpen = false) {
    const [isOpen, setIsOpen] = useState(initiallyOpen);

    const open = useCallback(() => setIsOpen(true), []);
    const close = useCallback(() => setIsOpen(false), []);
    const toggle = useCallback(() => setIsOpen((prevIsOpen) => !prevIsOpen), []);

    return useMemo(() => ({
        isOpen,
        open,
        close,
        toggle,
    }), [isOpen, open, close, toggle]);
}

export default useDialogState;
