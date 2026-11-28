import {
    useCallback,
    useContext,
} from 'react';
import { isDefined } from '@togglecorp/fujs';

import RouteContext from '#contexts/route';
import { type WrappedRoutes } from '#routes';
import {
    resolvePath,
    type UrlParams,
} from '#utils/domain/link';

interface RouteTarget {
    to: keyof WrappedRoutes;
    urlParams?: UrlParams;
    urlSearch?: string;
    urlHash?: string;
}

/** The href of a route key, for the @ifrc-go/ui/next links and link columns */
function getRouteHref(routes: WrappedRoutes, target: RouteTarget) {
    const { resolvedPath } = resolvePath(target.to, routes, target.urlParams);
    if (!isDefined(resolvedPath)) {
        return undefined;
    }
    const search = target.urlSearch ? `?${target.urlSearch}` : '';
    const hash = target.urlHash ? `#${target.urlHash}` : '';
    return `${resolvedPath}${search}${hash}`;
}

/**
 * Resolves route keys into hrefs, for cells and other places outside a Link.
 * The resolver keeps its identity, so table columns built with it do too.
 */
function useRouteHref() {
    const routes = useContext(RouteContext);
    return useCallback((target: RouteTarget) => getRouteHref(routes, target), [routes]);
}

export type RouteHrefResolver = ReturnType<typeof useRouteHref>;

export default useRouteHref;
