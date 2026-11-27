import { createContext } from 'react';

/** The two neutral surfaces that alternate: the page gray and the white foreground */
export type SurfaceBackground = 'background' | 'foreground';

export interface SurfaceContextProps {
    background: SurfaceBackground;
    /** Inside a dark surface, text, links, buttons and icons use their on-dark colours */
    dark: boolean;
}

const SurfaceContext = createContext<SurfaceContextProps>({
    background: 'foreground',
    dark: false,
});

/** The neutral surface that contrasts with its parent (white on gray, gray on white) */
export function getContrastBackground(parent: SurfaceBackground): SurfaceBackground {
    return parent === 'background' ? 'foreground' : 'background';
}

export default SurfaceContext;
