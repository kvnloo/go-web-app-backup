import { createContext } from 'react';

export interface ContainerStateContextProps {
    pending: boolean;
    errored: boolean;
    empty: boolean;
    filtered: boolean;
}

// NOTE: a Table or chart inside a section reads its async state from here
const ContainerStateContext = createContext<ContainerStateContextProps>({
    pending: false,
    errored: false,
    empty: false,
    filtered: false,
});

export default ContainerStateContext;
