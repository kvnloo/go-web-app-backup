import { createContext } from 'react';

// NOTE: router state for the internal links inside a provider (a "new DREF"
// link carries the DREF type); read by the router link the library renders
const RouterStateContext = createContext<unknown>(undefined);

export default RouterStateContext;
