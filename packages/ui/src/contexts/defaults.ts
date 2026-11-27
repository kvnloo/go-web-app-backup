import { createContext } from 'react';

export interface DefaultMessages {
    empty?: React.ReactNode;
    filtered?: React.ReactNode;
    errored?: React.ReactNode;
    pending?: React.ReactNode;
}

export interface DefaultsContextProps {
    /** Shown by value displays and table cells when the value is missing */
    invalidText: string;
    /** Overrides for the library's default state messages (empty, filtered, errored, pending) */
    messages: DefaultMessages;
}

export const DEFAULT_INVALID_TEXT_NEXT = '--';

const DefaultsContext = createContext<DefaultsContextProps>({
    invalidText: DEFAULT_INVALID_TEXT_NEXT,
    messages: {},
});

export default DefaultsContext;
