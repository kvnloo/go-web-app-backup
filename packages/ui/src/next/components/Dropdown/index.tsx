import { _cs } from '@togglecorp/fujs';

import DropdownLayout from '#next/base/DropdownLayout';
import {
    type ButtonVariant,
    buttonVariantToLook,
} from '#next/utils/button';

import styles from './styles.module.css';

/** sm 20rem, md 30rem, lg 42rem; by default the trigger width, at least 16rem */
export type PopupSize = 'sm' | 'md' | 'lg';

const popupSizeToWidth: Record<PopupSize, number> = {
    sm: 20,
    md: 30,
    lg: 42,
};

type TriggerProps =
    | { label: React.ReactNode; icon?: never; ariaLabel?: never }
    | { icon: React.ReactNode; ariaLabel: string; label?: never };

interface BaseProps {
    className?: string;
    before?: React.ReactNode;
    /** Look of the trigger; defaults to secondary, tertiary for an icon */
    variant?: ButtonVariant;
    popupSize?: PopupSize;
    /** The popup content; clicks inside it keep the popup open */
    children: React.ReactNode;
    disabled?: boolean;
}

export type Props = BaseProps & TriggerProps;

/**
 * A button that shows content in a popup, such as share options or a
 * source list. For a list of actions or links, use Menu.
 */
function Dropdown(props: Props) {
    const {
        className,
        label,
        icon,
        ariaLabel,
        before,
        variant = icon ? 'tertiary' : 'secondary',
        popupSize,
        children,
        disabled,
    } = props;

    return (
        <DropdownLayout
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...buttonVariantToLook[variant]}
            className={_cs(icon && styles.iconTrigger, className)}
            label={label ?? icon}
            before={before}
            ariaLabel={ariaLabel}
            withoutDropdownIcon={!!icon}
            preferredPopupWidth={popupSize ? popupSizeToWidth[popupSize] : undefined}
            disabled={disabled}
            persistent
        >
            <div className={styles.content}>
                {children}
            </div>
        </DropdownLayout>
    );
}

export default Dropdown;
