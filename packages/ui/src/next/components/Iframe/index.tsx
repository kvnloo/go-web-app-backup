import { _cs } from '@togglecorp/fujs';

import styles from './styles.module.css';

export interface Props {
    className?: string;
    src: string;
    /** What the embedded page is, for assistive technology */
    title: string;
    allowFullScreen?: boolean;
}

/** An embedded page (a dashboard or a video), loaded lazily */
function Iframe(props: Props) {
    const {
        className,
        src,
        title,
        allowFullScreen,
    } = props;

    return (
        <iframe
            className={_cs(styles.iframe, className)}
            src={src}
            title={title}
            loading="lazy"
            allowFullScreen={allowFullScreen}
            referrerPolicy="strict-origin-when-cross-origin"
        />
    );
}

export default Iframe;
