import {
    MenuItem as MenuItemBase,
    type MenuItemProps as MenuItemBaseProps,
} from '@ifrc-go/ui/next';

import RouterStateContext from '#contexts/router-state';
import useLink from '#hooks/domain/useLink';
import { type WrappedRoutes } from '#routes';
import { type UrlParams } from '#utils/domain/link';

type CommonProps = Pick<
    MenuItemBaseProps<undefined>,
    'className' | 'children' | 'before' | 'disabled' | 'persist'
>;

interface RouteProps extends CommonProps {
    /** A route key, never a path */
    to: keyof WrappedRoutes | undefined | null;
    urlParams?: UrlParams;
    urlSearch?: string;
    urlHash?: string;
    /** Router state for the target page */
    state?: unknown;
    href?: never;
    name?: never;
    onClick?: never;
    onConfirm?: never;
    confirmMessage?: never;
    confirmHeading?: never;
}

type LibraryProps<NAME> = MenuItemBaseProps<NAME> & {
    to?: never;
    urlParams?: never;
    urlSearch?: never;
    urlHash?: never;
    state?: never;
};

type Props<NAME> = RouteProps | LibraryProps<NAME>;

function isRouteItem<NAME>(props: Props<NAME>): props is RouteProps {
    return 'to' in props;
}

function RouteMenuItem(props: RouteProps) {
    const {
        to,
        urlParams,
        urlSearch,
        urlHash,
        state,
        disabled,
        ...itemProps
    } = props;

    const { to: path, disabled: routeDisabled } = useLink({ external: false, to, urlParams });

    const search = urlSearch ? `?${urlSearch}` : '';
    const hash = urlHash ? `#${urlHash}` : '';
    const item = (
        <MenuItemBase
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...itemProps}
            href={path ? `${path}${search}${hash}` : undefined}
            disabled={disabled || routeDisabled}
        />
    );

    if (state === undefined) {
        return item;
    }

    return (
        <RouterStateContext.Provider value={state}>
            {item}
        </RouterStateContext.Provider>
    );
}

/**
 * The library MenuItem with route keys: it resolves the route into an href
 * and disables links the user cannot open. Actions, confirmations and
 * external links pass through unchanged.
 */
function MenuItem<const NAME>(props: Props<NAME>) {
    if (isRouteItem(props)) {
        // eslint-disable-next-line react/jsx-props-no-spreading
        return <RouteMenuItem {...props} />;
    }
    // eslint-disable-next-line react/jsx-props-no-spreading
    return <MenuItemBase {...props} />;
}

export default MenuItem;
