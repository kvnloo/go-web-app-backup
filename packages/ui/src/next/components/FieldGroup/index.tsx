import {
    useContext,
    useId,
} from 'react';
import { _cs } from '@togglecorp/fujs';

import HeadingLevelContext from '#contexts/heading-level';
import InputError from '#next/base/InputError';
import ListLayout, { type NumColumns } from '#next/base/ListLayout';
import { useNestedHeadingLevel } from '#next/utils/heading';

import Description from '../Description';
import FlavourHeading from '../FlavourHeading';

import styles from './styles.module.css';

export interface Props {
    className?: string;
    heading?: React.ReactNode;
    description?: React.ReactNode;
    info?: React.ReactNode;
    actions?: React.ReactNode;
    /** Shows an asterisk after the heading */
    required?: boolean;
    /** An error for the group as a whole (an array field), shown under the inputs */
    error?: React.ReactNode;
    /** The inputs */
    children?: React.ReactNode;
    /** The inputs are laid out in a grid; defaults to one column */
    layoutOptions?: { numPreferredColumns?: NumColumns };
}

/**
 * Related inputs with their heading and description beside them (above
 * them on narrow screens), as a group named by its heading. It is the
 * building unit of a FormSection.
 */
function FieldGroup(props: Props) {
    const {
        className,
        heading,
        description,
        info,
        actions,
        required,
        error,
        children,
        layoutOptions,
    } = props;

    const headingId = useId();
    const { level, contextValue } = useNestedHeadingLevel();
    const parentHeadingLevel = useContext(HeadingLevelContext);

    const inputs = (
        <ListLayout layout="block" spacing="sm">
            <ListLayout
                layout="grid"
                numPreferredColumns={layoutOptions?.numPreferredColumns ?? 1}
            >
                <HeadingLevelContext.Provider value={heading ? contextValue : parentHeadingLevel}>
                    {children}
                </HeadingLevelContext.Provider>
            </ListLayout>
            {error && <InputError>{error}</InputError>}
        </ListLayout>
    );

    return (
        <div
            role={heading ? 'group' : undefined}
            aria-labelledby={heading ? headingId : undefined}
            className={_cs(styles.fieldGroup, className)}
        >
            {heading ? (
                <ListLayout
                    layout="grid"
                    sidebar={{ position: 'start' }}
                    spacing="lg"
                >
                    <div className={styles.header}>
                        <div className={styles.headingRow}>
                            <FlavourHeading
                                id={headingId}
                                level={level}
                                variant="group"
                                info={info}
                                required={required}
                            >
                                {heading}
                            </FlavourHeading>
                            {actions}
                        </div>
                        <Description variant="light" textSize="sm">
                            {description}
                        </Description>
                    </div>
                    {inputs}
                </ListLayout>
            ) : inputs}
        </div>
    );
}

export default FieldGroup;
