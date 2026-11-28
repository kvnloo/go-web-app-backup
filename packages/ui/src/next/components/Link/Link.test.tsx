import { renderToStaticMarkup } from 'react-dom/server';
import {
    expect,
    test,
} from 'vitest';

import LinkContext, { type InternalLinkRendererProps } from '#contexts/link';
import buttonLayoutStyles from '#next/base/ButtonLayout/styles.module.css';

import Link from '.';

function RouterLink(props: InternalLinkRendererProps) {
    const { href, className, children } = props;
    return <a data-router href={href} className={className}>{children}</a>;
}

test('internal links render through the router from context', () => {
    const html = renderToStaticMarkup(
        <LinkContext.Provider value={{ renderInternal: RouterLink }}>
            <Link href="/emergencies/">Emergencies</Link>
        </LinkContext.Provider>,
    );
    expect(html).toContain('data-router');
    expect(html).not.toContain('target="_blank"');
});

test('external links open in a new tab with the arrow', () => {
    const html = renderToStaticMarkup(<Link href="https://ifrc.org">IFRC</Link>);
    expect(html).toContain('target="_blank"');
    expect(html).toContain('rel="noopener noreferrer"');
    expect(html).toContain('<svg');
});

test('mailto links are plain anchors', () => {
    const html = renderToStaticMarkup(<Link href="mailto:a@b.org">Mail</Link>);
    expect(html).toContain('href="mailto:a@b.org"');
    expect(html).not.toContain('target=');
});

test('without an href the content renders as text', () => {
    const missingHref: string | undefined = undefined;
    const html = renderToStaticMarkup(<Link href={missingHref}>Nowhere</Link>);
    expect(html).not.toContain('<a');
});

test('the underline variant underlines', () => {
    const html = renderToStaticMarkup(<Link href="/a" variant="underline">A</Link>);
    expect(html).toContain(buttonLayoutStyles.withUnderline);
});
