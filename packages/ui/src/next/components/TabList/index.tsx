import { useContext } from 'react';

import TabContext from '#contexts/tabs';
import TabListLayout from '#next/base/TabListLayout';

export interface Props {
    className?: string;
    elementRef?: React.RefObject<HTMLDivElement | null>;
    /** Tabs */
    children: React.ReactNode;
}

/** The row (or column) of Tabs, announced as a tab list */
function TabList(props: Props) {
    const { className, elementRef, children } = props;
    const { tone, variant, disabled } = useContext(TabContext);

    return (
        <TabListLayout
            elementRef={elementRef}
            className={className}
            tone={tone}
            variant={variant}
            disabled={disabled}
            listRole="tablist"
        >
            {children}
        </TabListLayout>
    );
}

export default TabList;
