import { createContext } from 'react';

export interface InternalLinkRendererProps {
    href: string;
    className?: string;
    children?: React.ReactNode;
}

export interface LinkContextProps {
    /** Renders same-origin links (the app passes its router's link here) */
    renderInternal: React.ComponentType<InternalLinkRendererProps> | undefined;
}

const LinkContext = createContext<LinkContextProps>({
    renderInternal: undefined,
});

export type HrefKind = 'internal' | 'external' | 'other';

/**
 * internal: a path or same-origin URL, rendered through the router;
 * external: another origin, opened in a new tab with the external-link icon;
 * other: mailto:, tel:, fragments and the like, rendered as a plain anchor.
 */
export function getHrefKind(href: string, origin: string): HrefKind {
    if (href.startsWith('#')) {
        return 'other';
    }
    if (href.startsWith('/') && !href.startsWith('//')) {
        return 'internal';
    }
    let url: URL;
    try {
        url = new URL(href, origin);
    } catch {
        return 'other';
    }
    if (url.protocol !== 'http:' && url.protocol !== 'https:') {
        return 'other';
    }
    return url.origin === new URL(origin).origin ? 'internal' : 'external';
}

export default LinkContext;
