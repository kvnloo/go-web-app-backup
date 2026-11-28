import { _cs } from '@togglecorp/fujs';

import ListLayout from '#next/base/ListLayout';
import TextLayout from '#next/base/TextLayout';

import LegendItem from '../LegendItem';

import styles from './styles.module.css';

export interface Props<ITEM> {
    className?: string;
    /** A heading for the legend, such as "Hazard" */
    label?: React.ReactNode;
    items: ITEM[] | null | undefined;
    keySelector: (item: ITEM) => React.Key;
    labelSelector: (item: ITEM) => React.ReactNode;
    /** A CSS colour per item, a token or a colour from the data */
    colorSelector: (item: ITEM) => string;
}

/** The colours of a chart or map with what they stand for */
function Legend<ITEM>(props: Props<ITEM>) {
    const {
        className,
        label,
        items,
        keySelector,
        labelSelector,
        colorSelector,
    } = props;

    return (
        <div className={_cs(styles.legend, className)}>
            {label && (
                <TextLayout as="div" fontWeight="medium" textSize="sm">
                    {label}
                </TextLayout>
            )}
            <ListLayout wrap spacing="sm">
                {items?.map((item) => (
                    <LegendItem
                        key={keySelector(item)}
                        color={colorSelector(item)}
                        label={labelSelector(item)}
                    />
                ))}
            </ListLayout>
        </div>
    );
}

export default Legend;
