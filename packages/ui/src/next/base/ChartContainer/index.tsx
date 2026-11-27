import { _cs } from '@togglecorp/fujs';

import styles from './styles.module.css';

/** Steps of the --go-ui-height-chart-* scale (10, 16, 20, 24rem) */
export type ChartSize = 'sm' | 'md' | 'lg' | 'xl';

export interface Props {
    className?: string;
    children: React.ReactNode;
    size?: ChartSize;
    /**
     * Short summary of what the chart shows; exposes the SVG as one image to
     * assistive technology. Without it the SVG has no role.
     */
    ariaLabel?: string;
    chartData: {
        containerRef: React.RefCallback<HTMLDivElement>;
    },
}

const sizeToClassName: Record<ChartSize, string> = {
    sm: styles.sizeSm,
    md: styles.sizeMd,
    lg: styles.sizeLg,
    xl: styles.sizeXl,
};

/** The SVG frame of a chart, sized from the chart-height tokens (building block) */
function ChartContainer(props: Props) {
    const {
        className,
        children,
        size = 'md',
        ariaLabel,
        chartData,
    } = props;

    return (
        <div
            className={_cs(styles.chartContainer, sizeToClassName[size], className)}
            // NOTE: containerRef is a callback ref, which the refs lint rule misreads
            // eslint-disable-next-line react-hooks/refs
            ref={chartData.containerRef}
        >
            <svg
                className={styles.svg}
                role={ariaLabel ? 'img' : undefined}
                aria-label={ariaLabel}
            >
                {children}
            </svg>
        </div>
    );
}

export default ChartContainer;
