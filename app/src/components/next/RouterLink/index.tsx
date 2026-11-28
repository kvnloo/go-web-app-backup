import { useContext } from 'react';
import { Link as ReactRouterLink } from 'react-router-dom';
import { type InternalLinkRendererProps } from '@ifrc-go/ui/contexts';

import RouterStateContext from '#contexts/router-state';

/**
 * Renders the internal links of @ifrc-go/ui/next through the router, so
 * navigation stays client-side. Registered once, in the link context at the
 * app root.
 */
function RouterLink(props: InternalLinkRendererProps) {
    const {
        href,
        children,
        ...anchorProps
    } = props;

    const state = useContext(RouterStateContext);

    return (
        <ReactRouterLink
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...anchorProps}
            to={href}
            state={state}
        >
            {children}
        </ReactRouterLink>
    );
}

export default RouterLink;
