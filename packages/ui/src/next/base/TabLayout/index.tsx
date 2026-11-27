import {
    ChevronRightLineIcon,
    CloseLineIcon,
} from '@ifrc-go/icons';
import { _cs } from '@togglecorp/fujs';

import type {
    TabTone,
    TabVariant,
} from '#contexts/tabs';
import { getSpacingClassName } from '#utils/style';

import InlineLayout, { type Props as InlineLayoutProps } from '../InlineLayout';

import styles from './styles.module.css';

const toneToClassName: Record<TabTone, string> = {
    neutral: styles.toneNeutral,
    primary: styles.tonePrimary,
    secondary: styles.toneSecondary,
};

const variantToClassName: Record<TabVariant, string> = {
    tab: styles.variantTab,
    pill: styles.variantPill,
    step: styles.variantStep,
    nav: styles.variantNav,
    vertical: styles.variantVertical,
    'vertical-compact': styles.variantVerticalCompact,
};

const variantToSpacingOffset: Record<TabVariant, number> = {
    tab: 1,
    pill: 0,
    step: -1,
    nav: 0,
    vertical: 0,
    'vertical-compact': -2,
};

export interface Props extends Omit<InlineLayoutProps, 'withPadding'> {
    className?: string;
    tabWrapperClassName?: string;
    children?: React.ReactNode;
    tone?: TabTone;
    variant?: TabVariant;
    withoutPadding?: boolean;
    disabled?: boolean;
    active?: boolean;
    errored?: boolean;

    // FIXME: only for step variant
    stepCompleted?: boolean;
    isFirstStep?: boolean;
    isLastStep?: boolean;
}

function TabLayout(props: Props) {
    const {
        tone = 'primary',
        variant = 'nav',
        spacingOffset = variantToSpacingOffset[variant],
        className,
        disabled,
        children,
        withoutPadding = false,
        active,
        spacing,
        tabWrapperClassName,
        stepCompleted,
        isFirstStep,
        isLastStep,
        errored,
        after,
        ...inlineLayoutProps
    } = props;

    const wrapperSpacingClassName = getSpacingClassName({
        modes: ['padding-inline'],
        spacing,
        offset: -5,
    });

    const tabContent = (
        <InlineLayout
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...inlineLayoutProps}
            withPadding={!(withoutPadding
                || variant === 'vertical-compact'
                || variant === 'nav'
            )}
            className={_cs(
                styles.tabLayout,
                toneToClassName[tone],
                variantToClassName[variant],
                stepCompleted && styles.completed,
                disabled && styles.disabled,
                active && styles.active,
                errored && styles.errored,
                className,
            )}
            spacingOffset={spacingOffset}
            withAdditionalInlinePadding={variant === 'pill'}
            after={(
                <>
                    {after}
                    {variant === 'vertical-compact' && <ChevronRightLineIcon className={styles.forwardIcon} />}
                </>
            )}
        >
            {children}
        </InlineLayout>
    );

    if (variant === 'tab') {
        return (
            <div
                className={_cs(
                    styles.tabWrapper,
                    tabWrapperClassName,
                    active && styles.active,
                )}
            >
                <div className={_cs(styles.bottomBorder, wrapperSpacingClassName)} />
                {tabContent}
                <div className={_cs(styles.bottomBorder, wrapperSpacingClassName)} />
                {active && (
                    <div className={styles.activeBorder} />
                )}
            </div>
        );
    }

    if (variant === 'step') {
        return (
            <div
                className={_cs(
                    styles.stepWrapper,
                    active && styles.active,
                    stepCompleted && styles.completed,
                    isFirstStep && styles.firstStep,
                    isLastStep && styles.lastStep,
                )}
            >
                <div className={styles.dotWrapper}>
                    <div className={styles.beforeLine} />
                    <div className={styles.dot}>
                        {errored && <CloseLineIcon className={styles.icon} />}
                    </div>
                    <div className={styles.afterLine} />
                </div>
                {tabContent}
            </div>
        );
    }

    return tabContent;
}

export default TabLayout;
