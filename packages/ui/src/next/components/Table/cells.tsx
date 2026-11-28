import { useContext } from 'react';
import {
    ChevronDownLineIcon,
    ChevronUpLineIcon,
} from '@ifrc-go/icons';
import { _cs } from '@togglecorp/fujs';

import ButtonLayout from '#next/base/ButtonLayout';
import RawButton from '#next/base/RawButton';
import RawDisplay from '#next/base/RawDisplay';
import type { DateLike } from '#utils/common';
import type {
    NumberFormatOptions,
    NumberFormatPreset,
} from '#utils/format';
import type { StatusType } from '#utils/style';

import Link from '../Link';
import TableActions from '../TableActions';
import Tag from '../Tag';
import SubRowContext from './subRows';

import styles from './styles.module.css';

// NOTE: the table also passes the column id as `name`; the cells ignore it
interface CellBase {
    className?: string;
}

export function TextCell(props: CellBase & { value: string | null | undefined }) {
    const { className, value } = props;
    return <RawDisplay className={className} valueType="text" value={value} />;
}

export function NumberCell(props: CellBase & {
    value: number | null | undefined;
    format?: NumberFormatPreset;
    formatOptions?: NumberFormatOptions;
}) {
    const {
        className,
        value,
        format,
        formatOptions,
    } = props;
    return (
        <RawDisplay
            className={className}
            valueType="number"
            value={value}
            format={format}
            formatOptions={formatOptions}
        />
    );
}

export function DateCell(props: CellBase & {
    value: DateLike | null | undefined;
    format?: string;
}) {
    const { className, value, format } = props;
    return <RawDisplay className={className} valueType="date" value={value} format={format} />;
}

export function BooleanCell(props: CellBase & { value: boolean | null | undefined }) {
    const { className, value } = props;
    return <RawDisplay className={className} valueType="boolean" value={value} />;
}

export function LinkCell(props: CellBase & {
    label: React.ReactNode;
    href: string | null | undefined;
}) {
    const { className, label, href } = props;
    if (!label) {
        return <RawDisplay className={className} value={undefined} />;
    }
    return (
        <Link className={className} href={href} variant="underline">
            {label}
        </Link>
    );
}

export function TagCell(props: CellBase & { label: React.ReactNode; status?: StatusType }) {
    const { className, label, status } = props;
    if (!label) {
        return <RawDisplay className={className} value={undefined} />;
    }
    return <Tag className={className} label={label} status={status} />;
}

export function ActionCell(props: CellBase & {
    items: React.ReactNode;
    actions: React.ReactNode;
}) {
    const { className, items, actions } = props;
    return (
        <TableActions className={className} actions={actions}>
            {items}
        </TableActions>
    );
}

export function ExpandCell(props: CellBase & {
    rowKey: unknown;
    datum: unknown;
    expandLabel: string;
    collapseLabel: string;
}) {
    const {
        className,
        rowKey,
        datum,
        expandLabel,
        collapseLabel,
    } = props;

    const { isExpanded, hasSubRows, toggle } = useContext(SubRowContext);
    const expanded = isExpanded(rowKey);
    const disabled = !hasSubRows(datum);
    const label = expanded ? collapseLabel : expandLabel;

    return (
        <RawButton
            className={_cs(styles.expandButton, className)}
            name={rowKey}
            onClick={toggle}
            disabled={disabled}
            aria-expanded={expanded}
            aria-label={label}
            title={label}
        >
            <ButtonLayout shape="inline" disabled={disabled}>
                {expanded ? <ChevronUpLineIcon /> : <ChevronDownLineIcon />}
            </ButtonLayout>
        </RawButton>
    );
}

export type IndicatorPosition = 'single' | 'start' | 'mid' | 'end';

/** The line that ties expanded sub-rows to their row */
export function IndicatorCell(props: CellBase & { position: IndicatorPosition | undefined }) {
    const { className, position } = props;
    if (!position) {
        return null;
    }
    return (
        <div
            className={_cs(
                styles.indicator,
                position === 'start' && styles.start,
                position === 'end' && styles.end,
                position === 'single' && styles.single,
                className,
            )}
            aria-hidden
        >
            <div className={styles.startBorder} />
            <div className={styles.dot} />
            <div className={styles.endBorder} />
        </div>
    );
}
