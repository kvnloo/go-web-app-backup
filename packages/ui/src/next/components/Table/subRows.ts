import { createContext } from 'react';

export interface SubRowContextProps {
    isExpanded: (rowKey: unknown) => boolean;
    hasSubRows: (datum: unknown) => boolean;
    toggle: (rowKey: unknown) => void;
}

// NOTE: private to a table; the expand cells read the expansion state from
// here, so the table's columns keep their identity while rows expand
const SubRowContext = createContext<SubRowContextProps>({
    isExpanded: () => false,
    hasSubRows: () => false,
    toggle: () => undefined,
});

export default SubRowContext;
