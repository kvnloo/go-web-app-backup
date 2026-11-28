import {
    useContext,
    useEffect,
} from 'react';
import { isNotDefined } from '@togglecorp/fujs';

import TabContext, {
    getTabNodeId,
    getTabPanelNodeId,
    type TabKey,
} from '#contexts/tabs';
import RawButton from '#next/base/RawButton';
import TabLayout from '#next/base/TabLayout';

import styles from './styles.module.css';

export interface Props<NAME extends TabKey> {
    className?: string;
    name: NAME;
    children: React.ReactNode;
    disabled?: boolean;
    /** Marks the tab as having errors (a form step with invalid fields) */
    errored?: boolean;
    /** Position of the tab in step tabs, from 1 */
    step?: number;
    before?: React.ReactNode;
}

/** One tab of a Tabs; its look and state come from the Tabs around it */
function Tab<const NAME extends TabKey>(props: Props<NAME>) {
    const {
        className,
        name,
        children,
        disabled: disabledFromProps,
        errored,
        step = 0,
        before,
    } = props;

    const {
        tone,
        variant,
        disabled: disabledFromContext,
        registerTab,
        unregisterTab,
        setStep,
        step: currentStep,
        tabs,
        idBase,
        activeTab,
        setActiveTab,
    } = useContext(TabContext);

    useEffect(() => {
        registerTab(name);
        return () => unregisterTab(name);
    }, [registerTab, unregisterTab, name]);

    const active = activeTab === name;
    useEffect(() => {
        if (active) {
            setStep(step);
        }
    }, [active, setStep, step]);

    const vertical = variant === 'vertical' || variant === 'vertical-compact';
    // NOTE: roving tabindex; with no active tab the first one stays reachable
    const focusable = active || (isNotDefined(activeTab) && tabs[0] === name);

    const handleKeyDown = (event: React.KeyboardEvent<HTMLButtonElement>) => {
        const currentIndex = tabs.indexOf(name);
        if (currentIndex === -1) {
            return;
        }
        const lastIndex = tabs.length - 1;
        let nextIndex: number | undefined;
        if (event.key === (vertical ? 'ArrowDown' : 'ArrowRight')) {
            nextIndex = currentIndex === lastIndex ? 0 : currentIndex + 1;
        } else if (event.key === (vertical ? 'ArrowUp' : 'ArrowLeft')) {
            nextIndex = currentIndex === 0 ? lastIndex : currentIndex - 1;
        } else if (event.key === 'Home') {
            nextIndex = 0;
        } else if (event.key === 'End') {
            nextIndex = lastIndex;
        } else {
            return;
        }
        event.preventDefault();
        const nextTab = tabs[nextIndex];
        if (nextTab !== undefined) {
            setActiveTab(nextTab);
            document.getElementById(getTabNodeId(idBase, nextTab))?.focus();
        }
    };

    const disabled = disabledFromContext || disabledFromProps;

    return (
        <RawButton
            id={getTabNodeId(idBase, name)}
            className={styles.tab}
            name={name}
            onClick={setActiveTab}
            disabled={disabled}
            role="tab"
            aria-selected={active}
            aria-controls={active ? getTabPanelNodeId(idBase, name) : undefined}
            tabIndex={focusable ? 0 : -1}
            onKeyDown={handleKeyDown}
        >
            <TabLayout
                className={className}
                tone={tone}
                variant={variant}
                active={active}
                disabled={disabled}
                errored={errored}
                before={before}
                stepCompleted={variant === 'step' && (currentStep ?? 0) > step}
                isFirstStep={variant === 'step' && step === 1}
                isLastStep={variant === 'step' && step === tabs.length}
            >
                {children}
            </TabLayout>
        </RawButton>
    );
}

export default Tab;
