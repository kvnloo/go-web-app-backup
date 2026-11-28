import { useState } from 'react';
import { _cs } from '@togglecorp/fujs';

import useTranslation from '#hooks/useTranslation';
import RawButton from '#next/base/RawButton';

import Dialog from '../Dialog';

import i18n from './i18n.json';
import styles from './styles.module.css';

export interface Props {
    className?: string;
    src: string | null | undefined;
    /** What the image shows; an empty string for a decorative image */
    alt: string;
    caption?: React.ReactNode;
    /** Height of the image; defaults to its natural height */
    size?: 'sm' | 'md' | 'lg';
    /** Fits the whole image in its box instead of filling the box */
    withContainedFit?: boolean;
    withoutBackground?: boolean;
    /** Opens the image full size in a dialog */
    expandable?: boolean;
}

/** An image with an optional caption, loaded lazily, in a <figure> */
function Image(props: Props) {
    const {
        className,
        src,
        alt,
        caption,
        size,
        withContainedFit,
        withoutBackground,
        expandable,
    } = props;

    const strings = useTranslation(i18n);
    const [expanded, setExpanded] = useState(false);

    if (!src) {
        return null;
    }

    const image = (
        <img
            className={styles.imgElement}
            src={src}
            alt={alt}
            loading="lazy"
            decoding="async"
        />
    );

    return (
        <>
            <figure
                className={_cs(
                    styles.image,
                    size === 'sm' && styles.smallSize,
                    size === 'md' && styles.mediumSize,
                    size === 'lg' && styles.largeSize,
                    withContainedFit && styles.withContainedFit,
                    withoutBackground && styles.withoutBackground,
                    className,
                )}
            >
                {expandable ? (
                    <RawButton
                        className={styles.expandButton}
                        name={undefined}
                        onClick={() => setExpanded(true)}
                        aria-label={strings.imageExpandLabel}
                    >
                        {image}
                    </RawButton>
                ) : image}
                {caption && <figcaption className={styles.caption}>{caption}</figcaption>}
            </figure>
            {/* NOTE: outside the figure, so the thumbnail size does not apply */}
            {expanded && (
                <Dialog
                    size="full"
                    ariaLabel={alt || strings.imageExpandLabel}
                    onClose={() => setExpanded(false)}
                >
                    <img className={styles.expandedImage} src={src} alt={alt} />
                </Dialog>
            )}
        </>
    );
}

export default Image;
