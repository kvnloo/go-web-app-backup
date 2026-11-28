import {
    Fragment,
    useCallback,
    useContext,
    useMemo,
    useRef,
    useState,
} from 'react';
import {
    _cs,
    bound,
    isDefined,
    isNotDefined,
    listToMap,
} from '@togglecorp/fujs';

import LanguageContext from '#contexts/language';
import useSizeTracking from '#hooks/useSizeTracking';
import type { ChartSize } from '#next/base/ChartContainer';
import ChartPoint from '#next/base/ChartPoint';
import {
    getBounds,
    getPathData,
    getScaleFunction,
} from '#utils/chart';
import { formatDate } from '#utils/common';
import {
    formatNumberPreset,
    type NumberFormatPreset,
} from '#utils/format';

import styles from './styles.module.css';

// NOTE: room on the left for abbreviated labels such as "1.2M"
const X_AXIS_HEIGHT = 20;
const Y_AXIS_WIDTH = 24;
const CHART_OFFSET = 10;

const chartMargin = {
    left: 2 * Y_AXIS_WIDTH + CHART_OFFSET,
    top: CHART_OFFSET,
    right: CHART_OFFSET * 2,
    bottom: 2 * X_AXIS_HEIGHT + CHART_OFFSET,
};

const getFormattedKey = (dateFromProps: string | Date) => {
    const date = new Date(dateFromProps);
    return formatDate(date, 'yyyy-MM');
};

export interface Props<KEY extends string> {
    className?: string;
    /** Names the chart image for assistive technology */
    ariaLabel: string;
    /** One series per key */
    dataKeys: KEY[];
    timePoints: Date[];
    valueSelector: (dataKey: KEY, date: Date) => number | undefined;
    /** A CSS colour per series, a token or a colour from the data */
    colorSelector: (dataKey: KEY) => string;
    /** The highlighted time point, as yyyy-MM */
    activePointKey?: string;
    /** Called with the time point (yyyy-MM) that is clicked */
    onTimePointClick?: (dateKey: string) => void;
    xAxisFormatter: (date: Date) => string;
    /** Number format for the y-axis labels; defaults to compact */
    yAxisFormat?: NumberFormatPreset;
    /** Height from the chart height scale; defaults to md */
    size?: ChartSize;
}

const sizeToClassName: Record<ChartSize, string> = {
    sm: styles.sizeSm,
    md: styles.sizeMd,
    lg: styles.sizeLg,
    xl: styles.sizeXl,
};

/**
 * Series over monthly time points, one line per key with a point per month.
 * Pointing at a month highlights it; clicking reports it. The y-axis labels
 * are abbreviated (1.2M) so large values fit.
 */
function TimeSeriesChart<const KEY extends string>(props: Props<KEY>) {
    const {
        className,
        ariaLabel,
        dataKeys,
        timePoints,
        valueSelector,
        colorSelector,
        activePointKey,
        onTimePointClick,
        xAxisFormatter,
        yAxisFormat = 'compact',
        size = 'md',
    } = props;

    const { currentLanguage } = useContext(LanguageContext);

    const [hoveredPointKey, setHoveredPointKey] = useState<string | undefined>();

    // NOTE: the wrapper carries the size, so the chart is laid out to it
    const containerRef = useRef<HTMLDivElement>(null);
    const chartBounds = useSizeTracking(containerRef);

    const [
        chartPoints,
        yAxisPoints,
    ] = useMemo(
        () => {
            if (isNotDefined(chartBounds)) {
                return [
                    [],
                    [],
                ];
            }

            const timePointsWithData = timePoints.map((timePoint) => {
                const dataValues = dataKeys.map((dataKey) => ({
                    key: dataKey,
                    value: valueSelector(dataKey, timePoint),
                }));

                const valueList = dataValues.map((value) => value.value).filter(isDefined);
                const maxValue = valueList.length === 0 ? 0 : Math.max(...valueList);

                return {
                    date: timePoint,
                    numMonths: timePoint.getFullYear() * 12 + timePoint.getMonth(),
                    dataValues,
                    maxValue,
                };
            });

            const maxValueList = timePointsWithData.map((datum) => datum.maxValue);
            const maxValue = maxValueList.length === 0 ? 0 : Math.max(...maxValueList);
            const numMonthsList = timePointsWithData.map((datum) => datum.numMonths);

            const xBounds = getBounds(numMonthsList);
            const xScale = getScaleFunction(
                xBounds,
                { min: 0, max: chartBounds.width },
                { start: chartMargin.left, end: chartMargin.right },
            );

            const numYAxisPoints = 5;
            const approxYDiff = Math.ceil(maxValue / numYAxisPoints);
            const newMaxValue = approxYDiff * numYAxisPoints;

            const yBounds = {
                min: 0,
                max: newMaxValue,
            };
            const yScale = getScaleFunction(
                { min: 0, max: yBounds.max },
                { min: 0, max: chartBounds.height },
                { start: chartMargin.top, end: chartMargin.bottom },
                true,
            );

            const diff = newMaxValue / numYAxisPoints;
            const yAxisData = Array.from(Array(numYAxisPoints + 1).keys()).map((key) => {
                const value = yBounds.min + (diff * key);
                return {
                    key,
                    dataValue: value,
                    value: yScale(value),
                };
            });

            const chartData = timePointsWithData.map((timePoint, i) => {
                const x = xScale(timePoint.numMonths);

                const isStart = i === 0;
                const isEnd = i === (timePointsWithData.length - 1);

                const prevDatum = isStart ? timePoint : timePointsWithData[i - 1];
                const nextDatum = isEnd ? timePoint : timePointsWithData[i + 1];
                const rectStart = xScale(
                    (prevDatum.numMonths + timePoint.numMonths) / 2,
                ) + (isStart ? -CHART_OFFSET : 0);
                const rectEnd = xScale(
                    (timePoint.numMonths + nextDatum.numMonths) / 2,
                ) + (isEnd ? CHART_OFFSET : 0);

                return {
                    key: getFormattedKey(timePoint.date),
                    x,
                    yValues: listToMap(
                        timePoint.dataValues,
                        (datum) => datum.key,
                        (datum) => (isDefined(datum.value) ? yScale(datum.value) : undefined),
                    ),
                    rect: {
                        start: rectStart,
                        width: bound(rectEnd - rectStart, 0, chartBounds.width),
                    },
                    date: timePoint.date,
                    numMonths: timePoint.numMonths,
                    values: timePoint.dataValues,
                };
            });

            return [
                chartData,
                yAxisData,
            ] as const;
        },
        [chartBounds, dataKeys, timePoints, valueSelector],
    );

    const handleRectMouseClick: React.MouseEventHandler<SVGRectElement> = useCallback((e) => {
        const key = (e.target as HTMLElement).getAttribute('data-key');
        if (key && onTimePointClick) {
            onTimePointClick(key);
        }
    }, [onTimePointClick]);

    const handleRectMouseEnter: React.MouseEventHandler<SVGRectElement> = useCallback((e) => {
        setHoveredPointKey((e.target as HTMLElement).getAttribute('data-key') ?? undefined);
    }, []);

    const handleRectMouseOut: React.MouseEventHandler<SVGRectElement> = useCallback(() => {
        setHoveredPointKey(undefined);
    }, []);

    return (
        <div
            ref={containerRef}
            className={_cs(styles.timeSeriesChart, sizeToClassName[size], className)}
        >
            <svg
                className={styles.svg}
                role="img"
                aria-label={ariaLabel}
            >
                {yAxisPoints && yAxisPoints.map((point) => (
                    <Fragment key={point.key}>
                        {/* NOTE: right-aligned beside its grid line, abbreviated to fit */}
                        <text
                            className={styles.yAxisTickText}
                            x={chartMargin.left - CHART_OFFSET - 4}
                            y={point.value}
                        >
                            {formatNumberPreset(
                                point.dataValue,
                                yAxisFormat,
                                {},
                                currentLanguage,
                            )?.text}
                        </text>
                        <line
                            className={styles.xAxisGridLine}
                            x1={chartMargin.left - CHART_OFFSET}
                            y1={point.value}
                            x2={chartBounds.width - CHART_OFFSET}
                            y2={point.value}
                        />
                    </Fragment>
                ))}
                {dataKeys.map((dataKey) => (
                    <path
                        key={dataKey}
                        className={styles.path}
                        stroke={colorSelector(dataKey)}
                        d={getPathData(
                            chartPoints.map((point) => {
                                const { x } = point;
                                const y = point.yValues[dataKey];

                                if (isNotDefined(x) || isNotDefined(y)) {
                                    return undefined;
                                }

                                return {
                                    x,
                                    y: y as number,
                                };
                            }).filter(isDefined),
                        )}
                    />
                ))}
                {chartPoints.map((point) => {
                    const isActive = point.key === activePointKey;
                    const isHovered = point.key === hoveredPointKey;

                    return (
                        <Fragment key={point.key}>
                            <text
                                className={styles.xAxisTickText}
                                x={point.x}
                                y={chartBounds.height - X_AXIS_HEIGHT}
                                style={{
                                    transformOrigin: `${point.x}px ${chartBounds.height - X_AXIS_HEIGHT}px`,
                                }}
                            >
                                {xAxisFormatter(point.date)}
                            </text>
                            <line
                                className={_cs(
                                    styles.yAxisGridLine,
                                    hoveredPointKey === point.key && styles.hovered,
                                )}
                                x1={point.x}
                                y1={0}
                                x2={point.x}
                                y2={chartBounds.height - chartMargin.bottom + CHART_OFFSET}
                            />
                            {dataKeys.map((dataKey) => (
                                <g key={dataKey} style={{ color: colorSelector(dataKey) }}>
                                    <ChartPoint
                                        active={isActive}
                                        hovered={isHovered}
                                        x={point.x}
                                        y={point.yValues[dataKey]}
                                    />
                                </g>
                            ))}
                            <rect
                                className={styles.rect}
                                data-key={point.key}
                                x={point.rect.start}
                                y={CHART_OFFSET}
                                width={point.rect.width}
                                height={bound(
                                    chartBounds.height - chartMargin.bottom,
                                    0,
                                    chartBounds.height,
                                )}
                                onMouseEnter={handleRectMouseEnter}
                                onMouseOut={handleRectMouseOut}
                                onMouseDown={handleRectMouseClick}
                            />
                        </Fragment>
                    );
                })}
            </svg>
        </div>
    );
}

export default TimeSeriesChart;
