import { renderToStaticMarkup } from 'react-dom/server';
import {
    describe,
    expect,
    test,
} from 'vitest';

import { getPageItems } from './pages';
import Pagination from '.';

function labels(activePage: number, numPages: number) {
    return getPageItems(activePage, numPages).map((item) => {
        if (item.type === 'gap') {
            return '…';
        }
        return item.type === 'active' ? `[${item.page}]` : String(item.page);
    }).join(' ');
}

describe('page items', () => {
    test('all pages fit', () => {
        expect(labels(2, 5)).toBe('1 [2] 3 4 5');
    });
    test('gaps on both sides keep the first and last page', () => {
        expect(labels(10, 20)).toBe('1 … 9 [10] 11 … 20');
    });
    test('unused slots move to the other side', () => {
        expect(labels(1, 20)).toBe('[1] 2 3 4 5 … 20');
        expect(labels(20, 20)).toBe('1 … 16 17 18 19 [20]');
    });
});

function noop() {}

test('the active page is current and not a button', () => {
    const html = renderToStaticMarkup(
        <Pagination activePage={2} onActivePageChange={noop} numItems={100} numItemsPerPage={25} />,
    );
    expect(html).toContain('aria-label="Pagination"');
    expect(html).toMatch(/<span[^>]*aria-current="page"[^>]*>2<\/span>/);
    expect(html).toContain('aria-label="Go to page 3"');
});

test('a single page renders nothing', () => {
    expect(renderToStaticMarkup(
        <Pagination activePage={1} onActivePageChange={noop} numItems={10} numItemsPerPage={25} />,
    )).toBe('');
});
