import { _cs } from '@togglecorp/fujs';

import InlineLayout from '../InlineLayout';
import ListLayout from '../ListLayout';
import PageContainer from '../PageContainer';
import TextLayout from '../TextLayout';

import styles from './styles.module.css';

export interface Props {
    className?: string;
    breadcrumbs?: React.ReactNode;
    /** A link back to the parent page, shown above the heading */
    backLink?: React.ReactNode;
    /** Short category shown above the heading in red capitals */
    overline?: React.ReactNode;
    heading?: React.ReactNode;
    description?: React.ReactNode;
    actions?: React.ReactNode;
    /** A summary row under the description (key facts) */
    info?: React.ReactNode;
}

/**
 * The page header: breadcrumbs or back link with page actions, then the
 * overline, page title (h1) and description grouped in an <hgroup>, then the
 * info row (building block, composed by Page).
 */
function PageHeader(props: Props) {
    const {
        className,
        breadcrumbs,
        backLink,
        overline,
        heading,
        description,
        actions,
        info,
    } = props;

    if (!(actions || breadcrumbs || backLink || info || description || heading || overline)) {
        return null;
    }

    return (
        <PageContainer
            containerAs="header"
            className={_cs(styles.pageHeader, className)}
        >
            <ListLayout layout="block" spacing="xl">
                {(breadcrumbs || backLink || actions) && (
                    <InlineLayout
                        wrapBreakpoint="lg"
                        after={actions && (
                            <ListLayout wrap spacing="sm">
                                {actions}
                            </ListLayout>
                        )}
                    >
                        {breadcrumbs ?? backLink}
                    </InlineLayout>
                )}
                {(overline || heading || description) && (
                    <hgroup className={styles.headingGroup}>
                        <ListLayout layout="block" align="center">
                            {overline && (
                                <TextLayout
                                    as="p"
                                    className={styles.overline}
                                    textColor="brand"
                                    textSize="sm"
                                    fontWeight="semibold"
                                    textTransform="uppercase"
                                >
                                    {overline}
                                </TextLayout>
                            )}
                            {heading && (
                                <TextLayout
                                    as="h1"
                                    className={styles.heading}
                                    textAlign="center"
                                    textWrap="balance"
                                    fontWeight="semibold"
                                >
                                    {heading}
                                </TextLayout>
                            )}
                            {description && (
                                <TextLayout
                                    as="p"
                                    className={styles.description}
                                    textAlign="center"
                                >
                                    {description}
                                </TextLayout>
                            )}
                        </ListLayout>
                    </hgroup>
                )}
                {info}
            </ListLayout>
        </PageContainer>
    );
}

export default PageHeader;
