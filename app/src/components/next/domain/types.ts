import { type SelectInputProps } from '@ifrc-go/ui/next';

/** Omit that keeps the branches of a union apart (a plain Omit merges them) */
type DistributiveOmit<T, K extends PropertyKey> = T extends unknown ? Omit<T, K> : never;

/**
 * The props of a select over a fixed set of GO records: the domain select
 * supplies the options and how to read them; the single or multiple value,
 * the name and the rest stay the library's
 */
export type DomainSelectInputProps<
    NAME,
    OPTION extends object,
    KEY extends string | number,
> = DistributiveOmit<
    SelectInputProps<NAME, OPTION, KEY>,
    'options' | 'keySelector' | 'labelSelector' | 'descriptionSelector'
>;
