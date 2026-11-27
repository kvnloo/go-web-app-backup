import { useContext } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import {
    expect,
    test,
} from 'vitest';

import ContainerStateContext from '#contexts/container-state';
import SurfaceContext from '#contexts/surface';

import ContainerLayout from '.';

function StateProbe() {
    const state = useContext(ContainerStateContext);
    return <span>{JSON.stringify(state)}</span>;
}

function SurfaceProbe() {
    const surface = useContext(SurfaceContext);
    return <span>{`${surface.background}:${surface.dark}`}</span>;
}

test('children read the section state', () => {
    const html = renderToStaticMarkup(
        <ContainerLayout pending overlayPending filtered>
            <StateProbe />
        </ContainerLayout>,
    );
    expect(html).toContain('{&quot;pending&quot;:true,&quot;errored&quot;:false,&quot;empty&quot;:false,&quot;filtered&quot;:true}');
});

test('contrast surfaces alternate and dark surfaces pass down', () => {
    const html = renderToStaticMarkup(
        <SurfaceContext.Provider value={{ background: 'foreground', dark: false }}>
            <ContainerLayout surface="contrast">
                <SurfaceProbe />
                <ContainerLayout surface="contrast">
                    <SurfaceProbe />
                </ContainerLayout>
            </ContainerLayout>
            <ContainerLayout surface="dark">
                <SurfaceProbe />
            </ContainerLayout>
        </SurfaceContext.Provider>,
    );
    expect(html).toContain('background:false');
    expect(html).toContain('foreground:false');
    expect(html).toContain('foreground:true');
});

test('an empty section shows its message instead of its children', () => {
    const html = renderToStaticMarkup(
        <ContainerLayout empty messages={{ empty: 'No field reports yet.' }}>
            <span>table</span>
        </ContainerLayout>,
    );
    expect(html).toContain('No field reports yet.');
    expect(html).not.toContain('table');
});

test('pending with overlay keeps the children visible', () => {
    const html = renderToStaticMarkup(
        <ContainerLayout pending overlayPending>
            <span>table</span>
        </ContainerLayout>,
    );
    expect(html).toContain('table');
    expect(html).toContain('Fetching data...');
});
