import TooltipLayout from '#next/base/TooltipLayout';

export interface Props {
    className?: string;
    heading?: React.ReactNode;
    description?: React.ReactNode;
}

/**
 * A tooltip for the element it is placed in: shown on hover and keyboard
 * focus of that element, which must be focusable for keyboard users.
 * For explanations a user may want to read at length, use MoreInfo.
 */
function Tooltip(props: Props) {
    const {
        className,
        heading,
        description,
    } = props;

    return (
        <TooltipLayout
            className={className}
            heading={heading}
            description={description}
        />
    );
}

export default Tooltip;
