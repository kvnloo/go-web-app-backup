import { _cs } from '@togglecorp/fujs';

import ButtonLayout from '#next/base/ButtonLayout';
import RawButton from '#next/base/RawButton';
import TooltipLayout from '#next/base/TooltipLayout';
import {
    type ButtonVariant,
    buttonVariantToLook,
} from '#next/utils/button';

import styles from './styles.module.css';

export interface Props<NAME> {
    className?: string;
    elementRef?: React.Ref<HTMLButtonElement>;
    name: NAME;
    onClick?: (name: NAME, event: React.MouseEvent<HTMLButtonElement>) => void;
    /** Shown as the tooltip, and the accessible name unless `ariaLabel` is set */
    label: string;
    /** A more specific accessible name ("Remove source 2" under the tooltip "Remove source") */
    ariaLabel?: string;
    /** The icon */
    children: React.ReactNode;
    /** Defaults to tertiary: a bare icon */
    variant?: ButtonVariant;
    disabled?: boolean;
    type?: 'button' | 'submit';
}

/**
 * A button that shows only an icon. Its label is required: it is the
 * tooltip and the name screen readers announce.
 */
function IconButton<const NAME>(props: Props<NAME>) {
    const {
        className,
        elementRef,
        name,
        onClick,
        label,
        ariaLabel,
        children,
        variant = 'tertiary',
        disabled,
        type = 'button',
    } = props;

    const accessibleName = ariaLabel ?? label;

    return (
        <RawButton
            className={styles.iconButton}
            elementRef={elementRef}
            name={name}
            onClick={onClick}
            disabled={disabled}
            type={type}
            aria-label={accessibleName}
        >
            <ButtonLayout
                // eslint-disable-next-line react/jsx-props-no-spreading
                {...buttonVariantToLook[variant]}
                className={_cs(styles.layout, className)}
                disabled={disabled}
            >
                {children}
            </ButtonLayout>
            <TooltipLayout
                description={label}
                withoutTriggerDescription={accessibleName === label}
            />
        </RawButton>
    );
}

export default IconButton;
