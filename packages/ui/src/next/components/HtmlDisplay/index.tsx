import { useMemo } from 'react';
import {
    _cs,
    isNotDefined,
} from '@togglecorp/fujs';
import sanitizeHtml from 'sanitize-html';

import styles from './styles.module.css';

const sanitizeOptions: sanitizeHtml.IOptions = {
    allowedTags: [
        'p', 'br', 'hr', 'span', 'div',
        'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
        'strong', 'b', 'i', 'em', 'u',
        'li', 'ul', 'ol',
        'a',
        'table', 'thead', 'tbody', 'th', 'tr', 'td',
        'dd', 'dt', 'dl',
        'sub', 'sup',
        'img', 'svg',
        'pre', 'cite', 'code', 'q',
        // NOTE: some emergencies (for example 3972) embed a dashboard
        'iframe',
    ],
    allowedAttributes: {
        p: ['style'],
        span: ['style'],
        div: ['style'],
        img: ['style', 'src', 'width', 'height', 'alt', 'loading'],
        iframe: ['style', 'src', 'width', 'height', 'frameborder', 'title', 'loading'],
        a: ['style', 'href', 'target', 'rel'],
    },
    allowedSchemes: ['http', 'https', 'data', 'mailto', 'tel'],
    allowedStyles: {
        '*': {
            'padding-left': [/^\d+px$/],
            'font-size': [/^\d+px$/],
            'text-align': [/.+/],
        },
        iframe: {
            width: [/^\d+px$/],
            height: [/^\d+px$/],
            border: [/.+/],
        },
    },
    transformTags: {
        a: (tagName, attribs) => ({
            tagName,
            attribs: {
                ...attribs,
                target: '_blank',
                rel: 'noopener noreferrer',
            },
        }),
        img: (tagName, attribs) => ({
            tagName,
            attribs: { ...attribs, loading: 'lazy' },
        }),
        iframe: (tagName, attribs) => ({
            tagName,
            attribs: { ...attribs, loading: 'lazy' },
        }),
    },
};

export interface Props {
    className?: string;
    /** HTML from the server; it is sanitized before it is rendered */
    value: string | null | undefined;
}

/**
 * Rich text from the server (emergency descriptions, field report notes),
 * sanitized and styled to match the surrounding text.
 */
function HtmlDisplay(props: Props) {
    const {
        className,
        value,
    } = props;

    const sanitizedValue = useMemo(
        () => (isNotDefined(value) ? undefined : sanitizeHtml(value, sanitizeOptions)),
        [value],
    );

    if (isNotDefined(sanitizedValue)) {
        return null;
    }

    return (
        <div
            className={_cs(styles.htmlDisplay, className)}
            // eslint-disable-next-line react/no-danger
            dangerouslySetInnerHTML={{ __html: sanitizedValue }}
        />
    );
}

export default HtmlDisplay;
