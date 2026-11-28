import type { SetStateAction } from 'react';

import type { Sorting } from '#next/base/TableLayout/sorting';

export interface ListState<FILTER> {
    filter: FILTER;
    page: number;
    sorting: Sorting | undefined;
}

export type ListAction<FILTER> =
    | { type: 'set-filter'; value: SetStateAction<FILTER> }
    | { type: 'reset-filter'; value: FILTER }
    | { type: 'set-page'; value: number }
    | { type: 'set-sorting'; value: Sorting | undefined };

function listStateReducer<FILTER>(
    state: ListState<FILTER>,
    action: ListAction<FILTER>,
): ListState<FILTER> {
    // NOTE: a new filter or sort starts again from the first page
    if (action.type === 'set-filter') {
        const filter = typeof action.value === 'function'
            ? (action.value as (prev: FILTER) => FILTER)(state.filter)
            : action.value;
        return { ...state, filter, page: 1 };
    }
    if (action.type === 'reset-filter') {
        return { ...state, filter: action.value, page: 1 };
    }
    if (action.type === 'set-sorting') {
        return { ...state, sorting: action.value, page: 1 };
    }
    return { ...state, page: action.value };
}

export default listStateReducer;
