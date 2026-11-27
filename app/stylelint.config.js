import path from 'path';

const __filename = new URL(import.meta.url).pathname;
const __dirname = path.dirname(__filename);

const cssPaths = [
    path.resolve(__dirname, './src/index.css'),
    path.resolve(__dirname, './node_modules/@ifrc-go/ui/dist/index.css'),
];

/** @type {import('stylelint').Config} */
const config = {
    extends: [
        'stylelint-config-recommended',
        'stylelint-config-concentric',
    ],
    plugins: [
        'stylelint-value-no-unknown-custom-properties',
        'stylelint-no-unsupported-browser-features',
    ],
    rules: {
        'csstools/value-no-unknown-custom-properties': [
            true,
            {
                importFrom: cssPaths,
            },
        ],
        // NOTE: CSS features are checked against the root browserslist (Baseline widely available)
        'plugin/no-unsupported-browser-features': [
            true,
            {
                severity: 'warning',
                ignorePartialSupport: true,
                // NOTE: cursors and resize handles have no meaning on touch browsers
                ignore: ['css3-cursors', 'css-resize'],
            },
        ],
        'selector-pseudo-class-no-unknown': [
            true,
            {
                ignorePseudoClasses: ['global'],
            },
        ],
    },
};

export default config;
