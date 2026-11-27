import { createContext } from 'react';

import type { SortDirection } from './types';

export interface Sorting {
    name: string;
    direction: SortDirection;
}

export interface TableSortingContextProps {
    sorting: Sorting | undefined;
    onSortingChange: ((sorting: Sorting | undefined) => void) | undefined;
}

// NOTE: private to a table; the table's sorting props fill it so header
// cells can show and change the sort without a provider in app code
const TableSortingContext = createContext<TableSortingContextProps>({
    sorting: undefined,
    onSortingChange: undefined,
});

export default TableSortingContext;
