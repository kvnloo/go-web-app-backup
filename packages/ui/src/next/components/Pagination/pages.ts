export type PageItem =
    | { type: 'page'; page: number }
    | { type: 'active'; page: number }
    | { type: 'gap'; key: 'start' | 'end' };

function range(start: number, end: number) {
    const pages: number[] = [];
    for (let i = start; i <= end; i += 1) {
        pages.push(i);
    }
    return pages;
}

/**
 * The pages to show for `numPages` pages around `activePage`, using at most
 * `capacity` slots: the first and last page stay reachable, and runs of
 * hidden pages collapse into a gap. Slots one side does not need go to the
 * other side.
 */
export function getPageItems(activePage: number, numPages: number, capacity = 7): PageItem[] {
    const sideCapacity = (capacity - 1) / 2;
    const numBefore = activePage - 1;
    const numAfter = numPages - activePage;

    let capacityBefore = sideCapacity;
    let capacityAfter = sideCapacity;
    if (numBefore < sideCapacity) {
        capacityAfter += sideCapacity - numBefore;
    } else if (numAfter < sideCapacity) {
        capacityBefore += sideCapacity - numAfter;
    }

    const toPages = (pages: number[]) => pages.map((page): PageItem => ({ type: 'page', page }));

    const before: PageItem[] = numBefore <= capacityBefore
        ? toPages(range(1, activePage - 1))
        : [
            { type: 'page', page: 1 },
            { type: 'gap', key: 'start' },
            ...toPages(range(activePage - (capacityBefore - 2), activePage - 1)),
        ];

    const after: PageItem[] = numAfter <= capacityAfter
        ? toPages(range(activePage + 1, numPages))
        : [
            ...toPages(range(activePage + 1, activePage + (capacityAfter - 2))),
            { type: 'gap', key: 'end' },
            { type: 'page', page: numPages },
        ];

    return [...before, { type: 'active', page: activePage }, ...after];
}
