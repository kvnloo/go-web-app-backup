import {
    expect,
    test,
} from 'vitest';

import listStateReducer from './listState';

interface Filter {
    search?: string;
    country?: number;
}

const start = { filter: {} as Filter, page: 3, sorting: undefined };

test('a new filter, a reset or a new sort returns to page 1', () => {
    expect(listStateReducer(start, { type: 'set-filter', value: { search: 'flood' } }).page).toBe(1);
    expect(listStateReducer(start, { type: 'reset-filter', value: {} }).page).toBe(1);
    expect(listStateReducer(start, { type: 'set-sorting', value: { name: 'date', direction: 'asc' } }).page).toBe(1);
});

test('a filter update can build on the previous filter', () => {
    const next = listStateReducer(
        { ...start, filter: { search: 'flood' } },
        { type: 'set-filter', value: (prev) => ({ ...prev, country: 4 }) },
    );
    expect(next.filter).toEqual({ search: 'flood', country: 4 });
});

test('changing the page keeps the filter', () => {
    const next = listStateReducer({ ...start, filter: { search: 'x' } }, { type: 'set-page', value: 5 });
    expect(next).toEqual({ filter: { search: 'x' }, page: 5, sorting: undefined });
});
