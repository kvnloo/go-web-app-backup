import type { DefaultMessages } from '#contexts/defaults';

import type {
    BlockLayoutOptions,
    GridLayoutOptions,
    GridWithSidebarLayoutOptions,
    InlineLayoutOptions,
} from '../base/ListLayout';

/** How a container lays out its children; options depend on the layout */
export type ContentLayoutProps =
    | { layout?: 'block'; layoutOptions?: BlockLayoutOptions }
    | { layout: 'inline'; layoutOptions?: InlineLayoutOptions }
    | { layout: 'grid'; layoutOptions?: GridLayoutOptions | GridWithSidebarLayoutOptions };

/**
 * The async state of a container's content. `pending` with content keeps it
 * under a spinner; `pending` and `empty` replace it with the loading message.
 */
export interface AsyncStateProps {
    pending?: boolean;
    errored?: boolean;
    empty?: boolean;
    filtered?: boolean;
    /** Wording for this instance; defaults come from the defaults context */
    messages?: DefaultMessages;
}

/** The ContainerLayout props for an async state */
export function getAsyncStateLayoutProps(props: AsyncStateProps) {
    const {
        pending = false,
        errored = false,
        empty = false,
        filtered = false,
        messages,
    } = props;

    return {
        pending,
        overlayPending: pending && !empty,
        errored,
        empty,
        filtered,
        messages,
    };
}
