import { _cs } from '@togglecorp/fujs';

import InlineLayout from '#next/base/InlineLayout';
import type {
    NumberFormatOptions,
    NumberFormatPreset,
} from '#utils/format';
import type { TextSizeType } from '#utils/style';

import Card from '../Card';
import KeyFigure from '../KeyFigure';
import MoreInfo from '../MoreInfo';
import ProgressBar from '../ProgressBar';

import styles from './styles.module.css';

export interface Props {
    className?: string;
    value: number | null | undefined;
    format?: NumberFormatPreset;
    formatOptions?: NumberFormatOptions;
    label: React.ReactNode;
    supplement?: React.ReactNode;
    /** Size of the value; defaults to 3xl */
    textSize?: TextSizeType;
    /** A brand icon above the figure */
    icon?: React.ReactNode;
    /** An explanation, behind an info icon */
    info?: React.ReactNode;
    /** A percentage bar under the figure, such as funding coverage */
    progress?: {
        /** 0 to 100 */
        value: number | null | undefined;
        heading?: React.ReactNode;
        description?: React.ReactNode;
    };
}

/**
 * A key figure on a card, with an optional icon, explanation and progress
 * bar (funding coverage, people reached).
 */
function KeyFigureCard(props: Props) {
    const {
        className,
        value,
        format,
        formatOptions,
        label,
        supplement,
        textSize,
        icon,
        info,
        progress,
    } = props;

    const infoNode = info && <MoreInfo heading={label}>{info}</MoreInfo>;
    const figure = (
        <KeyFigure
            value={value}
            format={format}
            formatOptions={formatOptions}
            label={label}
            supplement={supplement}
            textSize={textSize}
        />
    );

    return (
        <Card className={_cs(styles.keyFigureCard, className)}>
            {icon && (
                <InlineLayout after={infoNode} contentAlignment="start">
                    <span className={styles.icon}>{icon}</span>
                </InlineLayout>
            )}
            {icon ? figure : (
                <InlineLayout after={infoNode} contentAlignment="start">
                    {figure}
                </InlineLayout>
            )}
            {progress && (
                <ProgressBar
                    className={styles.progress}
                    heading={progress.heading}
                    description={progress.description}
                    value={progress.value}
                    totalValue={100}
                    withPercentage
                />
            )}
        </Card>
    );
}

export default KeyFigureCard;
