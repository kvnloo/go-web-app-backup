import { useMemo } from 'react';

import TabListLayout from '#next/base/TabListLayout';

import NavigationContext from './navigation';

/** nav: the page navigation look (the default); tab, pill and step as in Tabs */
export type NavigationTabListVariant = 'nav' | 'tab' | 'pill' | 'step' | 'vertical';

export interface Props {
    className?: string;
    /** Names the navigation landmark, such as "Emergency sections" */
    ariaLabel: string;
    variant?: NavigationTabListVariant;
    /** NavigationTabs */
    children: React.ReactNode;
}

/**
 * Tabs that are links to sub-pages, in a labelled <nav>. The tab for the
 * current page is marked with aria-current.
 */
function NavigationTabList(props: Props) {
    const {
        className,
        ariaLabel,
        variant = 'nav',
        children,
    } = props;

    const contextValue = useMemo(() => ({
        tone: variant === 'tab' ? 'neutral' as const : 'primary' as const,
        variant,
    }), [variant]);

    return (
        <nav aria-label={ariaLabel}>
            <NavigationContext.Provider value={contextValue}>
                <TabListLayout
                    className={className}
                    tone={contextValue.tone}
                    variant={variant}
                >
                    {children}
                </TabListLayout>
            </NavigationContext.Provider>
        </nav>
    );
}

export default NavigationTabList;
