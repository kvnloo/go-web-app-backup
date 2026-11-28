import { InformationLineIcon } from '@ifrc-go/icons';

import useTranslation from '#hooks/useTranslation';
import DropdownLayout from '#next/base/DropdownLayout';
import TextLayout from '#next/base/TextLayout';

import i18n from './i18n.json';
import styles from './styles.module.css';

export interface Props {
    className?: string;
    /** Visible text before the info icon; without it the trigger is the icon alone */
    label?: React.ReactNode;
    heading?: React.ReactNode;
    /** The explanation */
    children: React.ReactNode;
}

/**
 * An info icon that opens an explanation in a popup. Components with an
 * `info` slot (Section, Card, DataDisplay, table columns) render it for you.
 */
function MoreInfo(props: Props) {
    const {
        className,
        label,
        heading,
        children,
    } = props;

    const strings = useTranslation(i18n);

    return (
        <DropdownLayout
            className={className}
            tone="neutral"
            fill="none"
            shape="inline"
            label={label}
            before={label ? undefined : <InformationLineIcon className={styles.icon} />}
            after={label ? <InformationLineIcon className={styles.icon} /> : undefined}
            ariaLabel={label ? undefined : strings.moreInfoButtonLabel}
            ariaHasPopup="dialog"
            popupClassName={styles.popup}
            withoutDropdownIcon
            persistent
        >
            <div className={styles.content}>
                {heading && (
                    <TextLayout as="div" fontWeight="semibold">
                        {heading}
                    </TextLayout>
                )}
                <TextLayout as="div" textSize="sm">
                    {children}
                </TextLayout>
            </div>
        </DropdownLayout>
    );
}

export default MoreInfo;
