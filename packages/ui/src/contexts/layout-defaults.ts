import { createContext } from 'react';

import type { SpacingType } from '#utils/style';

export interface LayoutDefaultsContextProps {
    /** Default spacing for layout primitives and container flavours in this subtree */
    spacing: SpacingType | undefined;
    /** Shift applied to the spacing of every block in this subtree */
    spacingOffset: number;
    /** Shift applied to the text size of every block in this subtree */
    textSizeOffset: number;
}

const LayoutDefaultsContext = createContext<LayoutDefaultsContextProps>({
    spacing: undefined,
    spacingOffset: 0,
    textSizeOffset: 0,
});

export default LayoutDefaultsContext;
