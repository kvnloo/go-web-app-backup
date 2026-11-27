import { renderToStaticMarkup } from 'react-dom/server';
import {
    expect,
    test,
} from 'vitest';

import DefaultsContext from '#contexts/defaults';

import StateMessage from '.';

test('renders nothing when there is content', () => {
    expect(renderToStaticMarkup(<StateMessage />)).toBe('');
});

test('pending wins over the other states, with one live region', () => {
    const html = renderToStaticMarkup(<StateMessage pending errored empty />);
    expect(html).toContain('Fetching data...');
    expect((html.match(/role="status"/g) ?? []).length).toBe(1);
});

test('filtered empty states explain the filter', () => {
    expect(renderToStaticMarkup(<StateMessage empty filtered />))
        .toContain('Data is not available for selected filter!');
});

test('instance messages beat context defaults, which beat library strings', () => {
    const withContext = (element: React.ReactElement) => renderToStaticMarkup(
        <DefaultsContext.Provider value={{ invalidText: '--', messages: { empty: 'Nothing here yet.' } }}>
            {element}
        </DefaultsContext.Provider>,
    );
    expect(withContext(<StateMessage empty />)).toContain('Nothing here yet.');
    expect(withContext(<StateMessage empty messages={{ empty: 'No field reports yet.' }} />))
        .toContain('No field reports yet.');
    expect(renderToStaticMarkup(<StateMessage empty />)).toContain('Data is not available!');
});
