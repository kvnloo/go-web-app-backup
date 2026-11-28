import {
    useCallback,
    useId,
    useMemo,
    useState,
} from 'react';

import TabContext, {
    type TabContextProps,
    type TabKey,
    type TabVariant,
} from '#contexts/tabs';

/** tab: underlined tabs (the default); pill: rounded tabs; step: numbered form steps */
export type TabsVariant = Exclude<TabVariant, 'nav'>;

export interface Props<VALUE extends TabKey> {
    value: VALUE | undefined;
    onChange: (value: VALUE) => void;
    variant?: TabsVariant;
    /** Disables every tab */
    disabled?: boolean;
    /** A TabList with Tabs, and the TabPanels */
    children: React.ReactNode;
}

/**
 * In-page tabs: a TabList of Tabs and a TabPanel per tab. Arrow keys move
 * between tabs (up and down for vertical tabs), Home and End jump to the
 * ends, and each tab is wired to its panel.
 */
function Tabs<const VALUE extends TabKey>(props: Props<VALUE>) {
    const {
        value,
        onChange,
        variant = 'tab',
        disabled = false,
        children,
    } = props;

    const [tabs, setTabs] = useState<TabKey[]>([]);
    const [step, setStep] = useState(0);
    const idBase = useId();

    const registerTab = useCallback((name: TabKey) => {
        setTabs((prevTabs) => (prevTabs.includes(name) ? prevTabs : [...prevTabs, name]));
    }, []);

    const unregisterTab = useCallback((name: TabKey) => {
        setTabs((prevTabs) => prevTabs.filter((tab) => tab !== name));
    }, []);

    const contextValue = useMemo<TabContextProps>(() => ({
        tone: variant === 'tab' ? 'neutral' : 'primary',
        variant,
        disabled,
        tabs,
        registerTab,
        unregisterTab,
        activeTab: value,
        setActiveTab: onChange as (key: TabKey) => void,
        step,
        setStep,
        idBase,
    }), [variant, disabled, tabs, registerTab, unregisterTab, value, onChange, step, idBase]);

    return (
        <TabContext.Provider value={contextValue}>
            {children}
        </TabContext.Provider>
    );
}

export default Tabs;
