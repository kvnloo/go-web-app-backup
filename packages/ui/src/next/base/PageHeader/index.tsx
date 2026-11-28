import { _cs } from '@togglecorp/fujs';

import SurfaceContext from '#contexts/surface';
import { getDarkSurfaceClassName } from '#utils/style';

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
    /** A photo behind the header; the header text switches to its on-dark colours */
    background?: React.ReactNode;
}

const darkSurface = { background: 'foreground', dark: true } as const;

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
        background,
    } = props;

    if (!(actions || breadcrumbs || backLink || info || description || heading || overline)) {
        return null;
    }

    const header = (
        <PageContainer
            containerAs="header"
            className={_cs(
                styles.pageHeader,
                background && getDarkSurfaceClassName(),
                className,
            )}
            background={background}
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

    if (!background) {
        return header;
    }

    return (
        <SurfaceContext.Provider value={darkSurface}>
            {header}
        </SurfaceContext.Provider>
    );
}

export default PageHeader;
