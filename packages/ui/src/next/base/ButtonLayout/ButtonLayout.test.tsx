import { renderToStaticMarkup } from 'react-dom/server';
import {
    expect,
    test,
} from 'vitest';

import SurfaceContext from '#contexts/surface';
import specs from '#utils/specs.module.css';

import ButtonLayout from '.';

import styles from './styles.module.css';

test('maps tone, fill, border and shape to their classes', () => {
    const html = renderToStaticMarkup(
        <ButtonLayout tone="primary" fill="solid" withBorder shape="inline" withUnderline>
            Create
        </ButtonLayout>,
    );
    [
        styles.tonePrimary,
        styles.fillSolid,
        styles.withBorder,
        styles.shapeInline,
        styles.withUnderline,
    ].forEach((className) => expect(html).toContain(className));
});

test('switches to on-dark colours inside a dark surface', () => {
    const html = renderToStaticMarkup(
        <SurfaceContext.Provider value={{ background: 'foreground', dark: true }}>
            <ButtonLayout tone="primary">Apply</ButtonLayout>
        </SurfaceContext.Provider>,
    );
    expect(html).toContain(styles.onDark);
});

test('pills sit three spacing steps below md (2xs), text-like buttons five (4xs)', () => {
    expect(renderToStaticMarkup(<ButtonLayout>Save</ButtonLayout>)).toContain(specs.spacing2Xs);
    expect(renderToStaticMarkup(<ButtonLayout shape="inline">Save</ButtonLayout>))
        .toContain(specs.spacing4Xs);
});
