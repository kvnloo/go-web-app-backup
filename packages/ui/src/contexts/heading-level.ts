import { createContext } from 'react';

export type HeadingLevel = 1 | 2 | 3 | 4 | 5 | 6;

export interface HeadingLevelContextProps {
    /** Level of the nearest heading above; a heading inside renders one level deeper */
    level: HeadingLevel;
}

// NOTE: the page title is h1, so a top-level section heading resolves to h2
const HeadingLevelContext = createContext<HeadingLevelContextProps>({ level: 1 });

export function getNextHeadingLevel(level: HeadingLevel): HeadingLevel {
    return Math.min(level + 1, 6) as HeadingLevel;
}

export default HeadingLevelContext;
