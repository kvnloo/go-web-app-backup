import { createContext } from 'react';

// NOTE: the next library's tab context (v2 keeps contexts/tab.tsx until 3.0);
// adds the id prefix that wires each tab to its panel

export type TabKey = string | number;

export type TabTone = 'primary' | 'secondary' | 'neutral';
export type TabVariant = 'tab' | 'pill' | 'nav' | 'step' | 'vertical' | 'vertical-compact';

export interface TabContextProps {
    tone: TabTone;
    variant: TabVariant;
    disabled: boolean;
    tabs: TabKey[];
    registerTab: (tab: TabKey) => void;
    unregisterTab: (tab: TabKey) => void;
    activeTab: TabKey | undefined;
    setActiveTab: (key: TabKey) => void;
    step: number | undefined;
    setStep: React.Dispatch<React.SetStateAction<number>>;
    /** Stable id prefix used to wire each tab to its panel (aria-controls/labelledby). */
    idBase: string;
}

/** DOM id for a tab button, referenced by its panel's aria-labelledby. */
export function getTabNodeId(idBase: string, key: TabKey) {
    return `${idBase}-tab-${key}`;
}

/** DOM id for a tab panel, referenced by its tab's aria-controls. */
export function getTabPanelNodeId(idBase: string, key: TabKey) {
    return `${idBase}-panel-${key}`;
}

const TabContext = createContext<TabContextProps>({
    tone: 'primary',
    variant: 'tab',
    disabled: false,
    tabs: [],
    activeTab: undefined,
    step: undefined,
    idBase: '',

    // eslint-disable-next-line no-console
    setActiveTab: () => { console.warn('TabContext::setActiveTab called before it was initialized'); },
    // eslint-disable-next-line no-console
    registerTab: () => { console.warn('TabContext::registerTab called before it was initialized'); },
    // eslint-disable-next-line no-console
    unregisterTab: () => { console.warn('TabContext::unregisterTab called before it was initialized'); },
    // eslint-disable-next-line no-console
    setStep: () => { console.warn('TabContext::setStep called before it was initialized'); },
});

export default TabContext;
