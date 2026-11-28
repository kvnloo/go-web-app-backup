import {
    useContext,
    useId,
} from 'react';

import HeadingLevelContext from '#contexts/heading-level';
import ContainerLayout from '#next/base/ContainerLayout';
import {
    type AsyncStateProps,
    type ContentLayoutProps,
    getAsyncStateLayoutProps,
} from '#next/utils/container';
import { useNestedHeadingLevel } from '#next/utils/heading';

import FlavourHeading from '../FlavourHeading';

interface BaseProps extends AsyncStateProps {
    className?: string;
    heading?: React.ReactNode;
    description?: React.ReactNode;
    info?: React.ReactNode;
    /** Shown before the heading */
    icon?: React.ReactNode;
    actions?: React.ReactNode;
    footer?: React.ReactNode;
    footerActions?: React.ReactNode;
    children?: React.ReactNode;
}

export type Props = BaseProps & ContentLayoutProps;

/**
 * A white, raised surface for one item: a resource, a record, a key figure.
 * It stays white wherever it sits (elevation sets it apart, not
 * alternation) and shows compact state messages.
 */
function Card(props: Props) {
    const {
        className,
        heading,
        description,
        info,
        icon,
        actions,
        footer,
        footerActions,
        children,
        layout = 'block',
        layoutOptions,
        ...asyncStateProps
    } = props;

    const headingId = useId();
    const { level, contextValue } = useNestedHeadingLevel();
    const parentHeadingLevel = useContext(HeadingLevelContext);

    return (
        <ContainerLayout
            className={className}
            heading={heading && (
                <FlavourHeading id={headingId} level={level} variant="card" info={info}>
                    {heading}
                </FlavourHeading>
            )}
            description={description}
            icon={icon}
            actions={actions}
            withCompactActions
            withHeaderBorder={!!heading}
            footer={footer}
            footerActions={footerActions}
            backgroundColor="foreground"
            boxShadow="md"
            withPadding
            withCompactMessage
            layout={layout}
            layoutOptions={layoutOptions}
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...getAsyncStateLayoutProps(asyncStateProps)}
        >
            <HeadingLevelContext.Provider value={heading ? contextValue : parentHeadingLevel}>
                {children}
            </HeadingLevelContext.Provider>
        </ContainerLayout>
    );
}

export default Card;
