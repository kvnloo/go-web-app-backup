import { createContext } from 'react';

import type { TextSizeType } from '#utils/style';

/** Which part of a label and value pair carries the emphasis */
export type DataDisplayVariant = 'strong-label' | 'strong-value' | 'plain';

export interface DataDisplayListContextProps {
    variant: DataDisplayVariant | undefined;
    textSize: TextSizeType | undefined;
}

// NOTE: undefined outside a DataDisplayList; a DataDisplay then renders its own <dl>
const DataDisplayListContext = createContext<DataDisplayListContextProps | undefined>(undefined);

export default DataDisplayListContext;
