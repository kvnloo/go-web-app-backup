import { useContext } from 'react';

import TabContext, {
    getTabNodeId,
    getTabPanelNodeId,
    type TabKey,
} from '#contexts/tabs';

export interface Props {
    className?: string;
    name: TabKey;
    children?: React.ReactNode;
}

/** The content of one tab, shown while its tab is active and named by it */
function TabPanel(props: Props) {
    const { className, name, children } = props;
    const { activeTab, idBase } = useContext(TabContext);

    if (activeTab !== name) {
        return null;
    }

    return (
        <div
            id={getTabPanelNodeId(idBase, name)}
            className={className}
            role="tabpanel"
            aria-labelledby={getTabNodeId(idBase, name)}
            // NOTE: the panel is focusable so keyboard users reach it from the tab list
            tabIndex={0}
        >
            {children}
        </div>
    );
}

export default TabPanel;
