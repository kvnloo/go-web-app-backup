import { useContext } from 'react';
import { _cs } from '@togglecorp/fujs';

import DataDisplayListContext, { type DataDisplayVariant } from '#contexts/data-display-list';
import SurfaceContext, { getContrastBackground } from '#contexts/surface';
import RawDisplay, { type Props as RawDisplayProps } from '#next/base/RawDisplay';
import {
    getBackgroundColorClassName,
    getTextColorClassName,
    getTextSizeClassName,
    type StatusType,
    type TextSizeType,
} from '#utils/style';

import MoreInfo from '../MoreInfo';

import styles from './styles.module.css';

export type { DataDisplayVariant };

interface BaseProps {
    className?: string;
    label?: React.ReactNode;
    /** Shown before the label */
    icon?: React.ReactNode;
    /** Shown under the value */
    description?: React.ReactNode;
    /** An explanation, behind an info icon next to the label */
    info?: React.ReactNode;
    /**
     * Which part is emphasised; defaults to the surrounding DataDisplayList,
     * then strong-label
     */
    variant?: DataDisplayVariant;
    /** Colours the value with a status colour */
    status?: StatusType;
    /** Defaults to the surrounding DataDisplayList */
    textSize?: TextSizeType;
    /** inline: "Label: value" (the default); block: the label above the value */
    layout?: 'inline' | 'block';
    /** contrast: a rounded background that stands out from the surface */
    surface?: 'contrast';
    withoutLabelColon?: boolean;
}

export type Props = BaseProps & RawDisplayProps;

/**
 * A label and its value, with an optional icon, description and info. The
 * value is formatted by type (number, date, yes/no, text) and shows the
 * empty value when missing. Inside a DataDisplayList it becomes one
 * <dt>/<dd> group of the list; on its own it renders its own <dl>.
 */
function DataDisplay(props: Props) {
    const {
        className,
        label,
        icon,
        description,
        info,
        variant: variantFromProps,
        status,
        textSize: textSizeFromProps,
        layout = 'inline',
        surface,
        withoutLabelColon,
        ...rawDisplayProps
    } = props;

    const list = useContext(DataDisplayListContext);
    const { background } = useContext(SurfaceContext);

    const variant = variantFromProps ?? list?.variant ?? 'strong-label';
    const textSize = textSizeFromProps ?? list?.textSize;

    const Element = list ? 'div' : 'dl';
    const withColon = layout === 'inline' && !withoutLabelColon;

    return (
        <Element
            className={_cs(
                styles.dataDisplay,
                layout === 'block' && styles.blockLayout,
                getTextSizeClassName(textSize),
                surface === 'contrast' && styles.withSurface,
                surface === 'contrast' && getBackgroundColorClassName(getContrastBackground(background)),
                className,
            )}
        >
            {(label || icon) && (
                <dt
                    className={_cs(
                        styles.label,
                        variant === 'strong-label' && styles.strong,
                    )}
                >
                    {icon && <span className={styles.icon} aria-hidden>{icon}</span>}
                    {label && (
                        <span className={_cs(withColon && !info && styles.withColon)}>
                            {label}
                        </span>
                    )}
                    {/* NOTE: the colon follows the info icon, so the icon stays with its label */}
                    {info && (
                        <span className={_cs(styles.info, withColon && styles.withColon)}>
                            <MoreInfo heading={label}>{info}</MoreInfo>
                        </span>
                    )}
                </dt>
            )}
            <dd
                className={_cs(
                    styles.value,
                    rawDisplayProps.valueType === 'text' && styles.textValue,
                    variant === 'strong-value' && styles.strong,
                    getTextColorClassName(status),
                )}
            >
                {/* eslint-disable-next-line react/jsx-props-no-spreading */}
                <RawDisplay {...rawDisplayProps} />
            </dd>
            {description && (
                <dd className={styles.description}>
                    {description}
                </dd>
            )}
        </Element>
    );
}

export default DataDisplay;
