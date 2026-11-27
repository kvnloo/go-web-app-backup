import { useContext } from 'react';
import { AnalysisIcon } from '@ifrc-go/icons';

// NOTE: shares the v2 message strings (same "common" namespace keys); the
// file moves here when v2 is removed
import i18n from '#components/DefaultMessage/i18n.json';
import DefaultsContext, { type DefaultMessages } from '#contexts/defaults';
import useTranslation from '#hooks/useTranslation';

import MessageLayout from '../MessageLayout';

export interface Props {
    className?: string;
    pending?: boolean;
    errored?: boolean;
    empty?: boolean;
    filtered?: boolean;
    /** Wording for this instance; falls back to the context defaults, then the library strings */
    messages?: DefaultMessages;
    compact?: boolean;
    withoutIcon?: boolean;
}

/**
 * The message for an async state: loading, failed, nothing matches the
 * filters, or nothing yet (building block). Renders nothing when there is
 * content to show.
 */
function StateMessage(props: Props) {
    const {
        className,
        pending = false,
        errored = false,
        empty = false,
        filtered = false,
        messages,
        compact,
        withoutIcon,
    } = props;

    const strings = useTranslation(i18n);
    const { messages: defaultMessages } = useContext(DefaultsContext);

    if (!pending && !errored && !empty) {
        return null;
    }

    if (pending) {
        return (
            <MessageLayout
                className={className}
                compact={compact}
                pending={!withoutIcon}
                title={messages?.pending ?? defaultMessages.pending ?? strings.messageTitleFetching}
            />
        );
    }

    if (errored) {
        return (
            <MessageLayout
                className={className}
                compact={compact}
                status="negative"
                icon={withoutIcon ? undefined : <AnalysisIcon />}
                title={messages?.errored
                    ?? defaultMessages.errored
                    ?? strings.messageTitleDataFailedToFetch}
            />
        );
    }

    if (filtered) {
        return (
            <MessageLayout
                className={className}
                compact={compact}
                icon={withoutIcon ? undefined : <AnalysisIcon />}
                title={messages?.filtered
                    ?? defaultMessages.filtered
                    ?? strings.messageTitleFilteredDataNotAvailable}
            />
        );
    }

    return (
        <MessageLayout
            className={className}
            compact={compact}
            icon={withoutIcon ? undefined : <AnalysisIcon />}
            title={messages?.empty ?? defaultMessages.empty ?? strings.messageTitleDataNotAvailable}
        />
    );
}

export default StateMessage;
