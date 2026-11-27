import type { ESLint, Rule } from 'eslint';

const NEXT_ENTRY = '@ifrc-go/ui/next';
const STYLING_PROPS = new Set(['className', 'style']);

// NOTE: ESLint's core types do not cover JSX nodes
interface JsxAttributeNode {
    name: { type: string, name?: string };
    parent?: { name?: { type: string, name?: string } };
}

// NOTE: exposed next components take variants, status and layout options
// instead of styling props; a view that needs className is a missing library
// feature, so it is surfaced for review rather than forbidden
const noStylingProps: Rule.RuleModule = {
    meta: {
        type: 'suggestion',
        docs: {
            description: `Disallow className and style on components from ${NEXT_ENTRY}`,
        },
        messages: {
            stylingProp: '"{{prop}}" on <{{component}}> styles a library component by hand; prefer a variant, layoutOptions or a library feature.',
        },
        schema: [],
    },
    create(context) {
        const nextComponents = new Set<string>();

        return {
            ImportDeclaration(node) {
                if (node.source.value !== NEXT_ENTRY) {
                    return;
                }
                node.specifiers.forEach((specifier) => {
                    nextComponents.add(specifier.local.name);
                });
            },
            JSXAttribute(node: JsxAttributeNode) {
                const propName = node.name.name;
                if (node.name.type !== 'JSXIdentifier' || !propName || !STYLING_PROPS.has(propName)) {
                    return;
                }
                const elementName = node.parent?.name;
                if (elementName?.type !== 'JSXIdentifier' || !elementName.name) {
                    return;
                }
                if (!nextComponents.has(elementName.name)) {
                    return;
                }
                context.report({
                    node: node as unknown as Rule.Node,
                    messageId: 'stylingProp',
                    data: { prop: propName, component: elementName.name },
                });
            },
        } as Rule.RuleListener;
    },
};

const plugin: ESLint.Plugin = {
    rules: {
        'no-styling-props': noStylingProps,
    },
};

export default plugin;
