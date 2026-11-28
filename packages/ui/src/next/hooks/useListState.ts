import {
    type SetStateAction,
    useCallback,
    useReducer,
} from 'react';

import useDebouncedValue from '#hooks/useDebouncedValue';
import type { Sorting } from '#next/base/TableLayout/sorting';
import { hasSomeDefinedValue } from '#utils/common';

import listStateReducer from './listState';

interface Options<FILTER> {
    /** The filter the list starts from and resets to */
    filter: FILTER;
    sorting?: Sorting;
    /** Items per page; defaults to 10 */
    pageSize?: number;
    /** Delay before `filter` follows typing, in milliseconds; defaults to 200 */
    debounceTime?: number;
}

/**
 * The state of a filtered, paged and sorted list. `rawFilter` follows the
 * inputs at once; `filter`, `offset` and the rest follow after a short
 * delay, for the request. Changing a filter or the sort returns to page 1.
 */
function useListState<FILTER extends object>(options: Options<FILTER>) {
    const {
        filter: initialFilter,
        sorting: initialSorting,
        pageSize = 10,
        debounceTime = 200,
    } = options;

    const [state, dispatch] = useReducer(
        listStateReducer<FILTER>,
        { filter: initialFilter, page: 1, sorting: initialSorting },
    );
    const debouncedState = useDebouncedValue(state, debounceTime);

    const setFilter = useCallback((value: SetStateAction<FILTER>) => {
        dispatch({ type: 'set-filter', value });
    }, []);

    const setFilterField = useCallback(
        <KEY extends keyof FILTER>(value: FILTER[KEY], name: KEY) => {
            dispatch({
                type: 'set-filter',
                value: (prevFilter) => ({ ...prevFilter, [name]: value }),
            });
        },
        [],
    );

    const resetFilter = useCallback(() => {
        dispatch({ type: 'reset-filter', value: initialFilter });
    }, [initialFilter]);

    const setPage = useCallback((page: number) => {
        dispatch({ type: 'set-page', value: page });
    }, []);

    const setSorting = useCallback((sorting: Sorting | undefined) => {
        dispatch({ type: 'set-sorting', value: sorting });
    }, []);

    return {
        rawFilter: state.filter,
        filter: debouncedState.filter,
        /** Some filter field has a value, for the Section's filtered state */
        filtered: hasSomeDefinedValue(state.filter),
        setFilter,
        setFilterField,
        resetFilter,

        page: state.page,
        setPage,
        offset: pageSize * (debouncedState.page - 1),
        limit: pageSize,

        sorting: state.sorting,
        setSorting,
    };
}

export default useListState;
