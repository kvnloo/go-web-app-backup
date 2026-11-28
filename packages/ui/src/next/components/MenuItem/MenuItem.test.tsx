import { renderToStaticMarkup } from 'react-dom/server';
import { MoreFillIcon } from '@ifrc-go/icons';
import {
    expect,
    test,
} from 'vitest';

import LinkContext, { type InternalLinkRendererProps } from '#contexts/link';

import Dropdown from '../Dropdown';
import Menu from '../Menu';
import MoreInfo from '../MoreInfo';
import MenuItem from '.';

function noop() {}

function RouterLink(props: InternalLinkRendererProps) {
    const { href, children, ...otherProps } = props;
    // eslint-disable-next-line react/jsx-props-no-spreading
    return <a data-router href={href} {...otherProps}>{children}</a>;
}

function forbiddenCombinations() {
    return (
        <>
            <MenuItem href="/reports/">Reports</MenuItem>
            <MenuItem name="x" onClick={noop}>Export</MenuItem>
            <MenuItem name="x" onConfirm={noop} confirmMessage="Delete?">Delete</MenuItem>
            {/* @ts-expect-error an item is a link or an action, not both */}
            <MenuItem href="/a/" name="x" onClick={noop}>Both</MenuItem>
            {/* @ts-expect-error a confirmation needs its message */}
            <MenuItem name="x" onConfirm={noop}>Delete</MenuItem>
            {/* @ts-expect-error type is reserved for HTML; the props decide the form */}
            <MenuItem type="link" href="/a/">Old</MenuItem>
            <Menu label="Actions"><span /></Menu>
            <Menu icon={<MoreFillIcon />} ariaLabel="More actions"><span /></Menu>
            {/* @ts-expect-error an icon-only trigger needs a name */}
            <Menu icon={<MoreFillIcon />}><span /></Menu>
            {/* @ts-expect-error a trigger has a label or an icon */}
            <Dropdown label="Share" icon={<MoreFillIcon />} ariaLabel="Share"><span /></Dropdown>
        </>
    );
}

test('the forbidden combinations are compile errors', () => {
    expect(forbiddenCombinations).toBeTypeOf('function');
});

test('items render as menu items through the router or as buttons', () => {
    const html = renderToStaticMarkup(
        <LinkContext.Provider value={{ renderInternal: RouterLink }}>
            <MenuItem href="/reports/">Reports</MenuItem>
            <MenuItem name="x" onClick={noop}>Export</MenuItem>
        </LinkContext.Provider>,
    );
    expect(html).toMatch(/<a data-router="true" href="\/reports\/"[^>]*role="menuitem"/);
    expect(html).toMatch(/<button[^>]*role="menuitem"/);
});

test('a menu trigger reports its popup; icon-only triggers are named', () => {
    const html = renderToStaticMarkup(
        <Menu icon={<MoreFillIcon />} ariaLabel="More actions"><span /></Menu>,
    );
    expect(html).toContain('aria-haspopup="menu"');
    expect(html).toContain('aria-expanded="false"');
    expect(html).toContain('aria-label="More actions"');
});

test('an icon-only MoreInfo has a name', () => {
    expect(renderToStaticMarkup(<MoreInfo>Why</MoreInfo>))
        .toContain('aria-label="More information"');
    expect(renderToStaticMarkup(<MoreInfo label="Methodology">Why</MoreInfo>))
        .not.toContain('aria-label=');
});
