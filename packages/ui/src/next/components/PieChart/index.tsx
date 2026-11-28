import {
    _cs,
    isDefined,
} from '@togglecorp/fujs';

import RawDisplay from '#next/base/RawDisplay';
import TooltipLayout from '#next/base/TooltipLayout';

import LegendItem from '../LegendItem';

import styles from './styles.module.css';

const PIE_RADIUS = 70;
const CHART_PADDING = 40;

function round(n: number, precision = 1) {
    return Math.round(n * (10 ** precision)) / (10 ** precision);
}

function polarToCartesian(radius: number, angleInDegrees: number) {
    const radians = ((angleInDegrees - 90) * Math.PI) / 180;

    return {
        x: round(radius + (radius * Math.cos(radians))),
        y: round(radius + (radius * Math.sin(radians))),
    };
}

function getPathData(radius: number, startAngle: number, endAngleFromParams: number) {
    let endAngle = endAngleFromParams;
    const isCircle = endAngle - startAngle === 360;

    if (isCircle) {
        endAngle -= 1;
    }

    const start = polarToCartesian(radius, startAngle);
    const end = polarToCartesian(radius, endAngle);

    const largeArcFlag = endAngle - startAngle <= 180 ? 0 : 1;
    const d = [
        'M',
        start.x,
        start.y,
        'A',
        radius,
        radius,
        0,
        largeArcFlag,
        1,
        end.x,
        end.y,
    ];

    if (isCircle) {
        d.push('Z');
    } else {
        d.push('L', radius, radius, 'L', start.x, start.y, 'Z');
    }

    return d.join(' ');
}

interface BaseProps<DATUM> {
    className?: string;
    /** Names the chart image for assistive technology; the legend lists every value as text */
    ariaLabel: string;
    data: DATUM[] | null | undefined;
    keySelector: (datum: DATUM) => string | number;
    valueSelector: (datum: DATUM) => number | null | undefined;
    labelSelector: (datum: DATUM) => React.ReactNode;
    /** Adds each part's percentage to the legend */
    withPercentage?: boolean;
}

/** A colour per datum (from the data), or a palette used in turn */
type ColorProps<DATUM> =
    | { colorSelector: (datum: DATUM) => string; colors?: never }
    | { colorSelector?: never; colors: string[] };

export type Props<DATUM> = BaseProps<DATUM> & ColorProps<DATUM>;

/** Parts of a whole as pie segments, with a legend that lists them as text */
function PieChart<DATUM>(props: Props<DATUM>) {
    const {
        className,
        ariaLabel,
        data,
        keySelector,
        valueSelector,
        labelSelector,
        withPercentage,
        colorSelector,
        colors,
    } = props;

    const values = (data ?? []).map((datum) => ({ datum, value: valueSelector(datum) }));
    const total = values.reduce((sum, item) => sum + Math.max(item.value ?? 0, 0), 0);
    const totalSafe = total === 0 ? 1 : total;

    const segments = [];
    let endAngle = 0;
    for (let index = 0; index < values.length; index += 1) {
        const { datum, value } = values[index]!;
        if (isDefined(value)) {
            const angle = 360 * (Math.max(value, 0) / totalSafe);
            endAngle += angle;
            segments.push({
                key: keySelector(datum),
                value,
                label: labelSelector(datum),
                percentage: (Math.max(value, 0) / totalSafe) * 100,
                startAngle: endAngle - angle,
                endAngle,
                color: colorSelector ? colorSelector(datum) : colors[index % colors.length] ?? '',
            });
        }
    }

    const size = CHART_PADDING + PIE_RADIUS * 2;

    return (
        <div className={_cs(styles.pieChart, className)}>
            <svg
                className={styles.svg}
                width={size}
                height={size}
                role="img"
                aria-label={ariaLabel}
            >
                <g transform={`translate(${CHART_PADDING / 2} ${CHART_PADDING / 2})`}>
                    {segments.map((segment) => (
                        <path
                            key={segment.key}
                            d={getPathData(PIE_RADIUS, segment.startAngle, segment.endAngle)}
                            fill={segment.color}
                        >
                            <TooltipLayout
                                heading={segment.label}
                                description={(
                                    <RawDisplay valueType="number" value={segment.value} />
                                )}
                            />
                        </path>
                    ))}
                </g>
            </svg>
            <div className={styles.legend}>
                {segments.map((segment) => (
                    <LegendItem
                        key={segment.key}
                        color={segment.color}
                        label={withPercentage ? (
                            <>
                                {segment.label}
                                {' '}
                                <RawDisplay
                                    valueType="number"
                                    value={segment.percentage}
                                    formatOptions={{
                                        maximumFractionDigits: 0,
                                        prefix: '(',
                                        suffix: '%)',
                                    }}
                                />
                            </>
                        ) : segment.label}
                    />
                ))}
            </div>
        </div>
    );
}

export default PieChart;
