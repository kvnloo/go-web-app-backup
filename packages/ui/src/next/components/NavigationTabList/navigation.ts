import { createContext } from 'react';

import type {
    TabTone,
    TabVariant,
} from '#contexts/tabs';

export interface NavigationContextProps {
    tone: TabTone;
    variant: TabVariant;
}

// NOTE: private to a navigation tab list; its tabs read their look from here
const NavigationContext = createContext<NavigationContextProps>({
    tone: 'primary',
    variant: 'nav',
});

export default NavigationContext;
