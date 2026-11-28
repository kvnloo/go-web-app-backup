import { renderToStaticMarkup } from 'react-dom/server';
import {
    expect,
    test,
} from 'vitest';

import Button from '../Button';
import MenuItem from '../MenuItem';
import TableActions from '.';

function noop() {}

test('row actions show their controls and a named menu for the MenuItems', () => {
    const html = renderToStaticMarkup(
        <TableActions actions={<Button name="edit" onClick={noop}>Edit</Button>}>
            <MenuItem name="export" onClick={noop}>Export</MenuItem>
        </TableActions>,
    );
    expect(html).toContain('Edit');
    expect(html).toContain('aria-label="More actions"');
    expect(html).toContain('aria-haspopup="menu"');
});

test('without MenuItems there is no menu, and without anything nothing renders', () => {
    const html = renderToStaticMarkup(
        <TableActions actions={<Button name="edit" onClick={noop}>Edit</Button>}>
            {false}
            {null}
        </TableActions>,
    );
    expect(html).toContain('Edit');
    expect(html).not.toContain('aria-haspopup');
    expect(renderToStaticMarkup(<TableActions />)).toBe('');
});
