import React from 'react';
import { _cs } from '@togglecorp/fujs';

import {
    TabTone,
    TabVariant,
} from '#contexts/tabs';
import { SpacingType } from '#utils/style';

import ListLayout from '../ListLayout';

import styles from './styles.module.css';

export interface Props extends React.HTMLProps<HTMLDivElement> {
    elementRef?: React.RefObject<HTMLDivElement | null>;
    className?: string;
    spacing?: SpacingType;
    children: React.ReactNode;
    variant?: TabVariant;
    tone?: TabTone;
    disabled?: boolean;
    /**
     * ARIA role for the inner list. The in-page tab widget (`Tabs/TabList`)
     * passes `'tablist'`; route-navigation lists (`NavigationTabList`) leave it
     * unset so the list is not falsely announced as a tab widget.
     */
    listRole?: React.AriaRole;
}

function TabListLayout(props: Props) {
    const {
        variant,
        tone,
        disabled,
        elementRef,
        children,
        className,
        spacing,
        listRole,
        ...otherProps
    } = props;

    return (
        <div
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...otherProps}
            ref={elementRef}
            className={_cs(
                className,
                styles.tabListLayout,
                disabled && styles.disabled,

                tone === 'primary' && styles.tonePrimary,
                tone === 'secondary' && styles.toneSecondary,
                tone === 'neutral' && styles.toneNeutral,

                variant === 'tab' && styles.variantTab,
                variant === 'pill' && styles.variantPill,
                variant === 'step' && styles.variantStep,
                variant === 'nav' && styles.variantNav,
                variant === 'vertical' && styles.variantVertical,
                variant === 'vertical-compact' && styles.variantVerticalCompact,
            )}
        >
            <div className={styles.additionalBorder} />
            {(variant === 'vertical' || variant === 'vertical-compact') ? (
                <ListLayout
                    layout="block"
                    role={listRole}
                    aria-orientation={listRole === 'tablist' ? 'vertical' : undefined}
                    spacing={variant === 'vertical' ? 'none' : spacing}
                    withoutSpacingOpticalCorrection={variant !== 'vertical-compact'}
                    spacingOffset={variant === 'vertical-compact' ? -2 : 0}
                >
                    {children}
                </ListLayout>
            ) : (
                <ListLayout
                    className={styles.content}
                    spacing={(variant === 'tab' || variant === 'pill' || variant === 'step')
                        ? 'none'
                        : spacing}
                    role={listRole}
                    wrap={variant === 'nav'}
                    alignItems={variant === 'step' ? 'start' : undefined}
                >
                    {children}
                </ListLayout>
            )}
            <div className={styles.additionalBorder} />
        </div>
    );
}

export default TabListLayout;
