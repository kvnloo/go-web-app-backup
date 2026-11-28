import {
    Link as LinkBase,
    type LinkProps as LinkBaseProps,
} from '@ifrc-go/ui/next';

import RouterStateContext from '#contexts/router-state';
import useLink from '#hooks/domain/useLink';
import { type WrappedRoutes } from '#routes';
import { type UrlParams } from '#utils/domain/link';

interface RouteProps {
    /** A route key, never a path */
    to: keyof WrappedRoutes | undefined | null;
    urlParams?: UrlParams;
    urlSearch?: string;
    urlHash?: string;
    /** Router state for the target page */
    state?: unknown;
    href?: never;
}

interface HrefProps {
    /** An external URL, or mailto: and tel: links */
    href: string | undefined | null;
    to?: never;
    urlParams?: never;
    urlSearch?: never;
    urlHash?: never;
    state?: never;
}

type Props = Omit<LinkBaseProps, 'href'> & (RouteProps | HrefProps);

/**
 * The library Link with route keys: it resolves the route into an href and
 * disables links the user cannot open. The look comes from the library.
 */
function Link(props: Props) {
    const {
        to,
        urlParams,
        urlSearch,
        urlHash,
        state,
        href,
        disabled: disabledFromProps,
        ...linkProps
    } = props;

    const internal = !href;
    const { to: path, disabled: routeDisabled } = useLink(
        internal
            ? { external: false, to, urlParams }
            : { external: true, href },
    );

    let resolvedHref = path;
    if (internal && path) {
        const search = urlSearch ? `?${urlSearch}` : '';
        const hash = urlHash ? `#${urlHash}` : '';
        resolvedHref = `${path}${search}${hash}`;
    }

    const link = (
        <LinkBase
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...linkProps}
            href={resolvedHref}
            disabled={disabledFromProps || routeDisabled}
        />
    );

    if (state === undefined) {
        return link;
    }

    return (
        <RouterStateContext.Provider value={state}>
            {link}
        </RouterStateContext.Provider>
    );
}

export default Link;
