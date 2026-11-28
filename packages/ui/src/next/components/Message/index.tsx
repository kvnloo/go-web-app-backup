import MessageLayout from '#next/base/MessageLayout';
import type { StatusType } from '#utils/style';

export interface Props {
    className?: string;
    /** The message itself */
    heading?: React.ReactNode;
    description?: React.ReactNode;
    icon?: React.ReactNode;
    actions?: React.ReactNode;
    /** negative highlights the heading */
    status?: StatusType;
    /** Shows a spinner in place of the icon */
    pending?: boolean;
    /** Smaller, for cards and other small surfaces */
    compact?: boolean;
}

/**
 * A centred message in place of content: an empty state, a loading or
 * failure notice, or a prompt with actions. It is announced politely.
 */
function Message(props: Props) {
    const {
        className,
        heading,
        description,
        icon,
        actions,
        status,
        pending,
        compact,
    } = props;

    return (
        <MessageLayout
            className={className}
            title={heading}
            description={description}
            icon={icon}
            actions={actions}
            status={status}
            pending={pending}
            compact={compact}
        />
    );
}

export default Message;
