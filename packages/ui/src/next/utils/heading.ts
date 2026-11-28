import {
    useContext,
    useMemo,
} from 'react';

import HeadingLevelContext, { getNextHeadingLevel } from '#contexts/heading-level';

/**
 * The heading level for a container's own heading (one below the nearest
 * heading above) and the context value its content should see
 */
// eslint-disable-next-line import/prefer-default-export
export function useNestedHeadingLevel() {
    const { level: parentLevel } = useContext(HeadingLevelContext);
    const level = getNextHeadingLevel(parentLevel);
    const contextValue = useMemo(() => ({ level }), [level]);
    return { level, contextValue };
}
