const config  = {
    plugins: [
        'stylelint-value-no-unknown-custom-properties',
        'stylelint-no-unsupported-browser-features',
    ],
    extends: [
        'stylelint-config-recommended',
        'stylelint-config-concentric',
    ],
    rules: {
        // https://stylelint.io/migration-guide/to-15
        // indentation: 4,
        'csstools/value-no-unknown-custom-properties': [
            true, {
                importFrom: ['./src/index.css']
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
