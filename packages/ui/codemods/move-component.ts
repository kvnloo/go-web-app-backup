/**
 * Move a component import from one module to another, optionally renaming it.
 *
 * Usage (from packages/ui):
 *   pnpm codemod:move-component --from @ifrc-go/ui --to @ifrc-go/ui/next \
 *     --name Modal --rename Dialog "../../app/src/views/**\/*.tsx"
 *
 * - Rewrites `import { Modal } from '@ifrc-go/ui'` to `import { Dialog } from '@ifrc-go/ui/next'`,
 *   merging into an existing import of the target module.
 * - Renames every reference in the file (JSX tags included) when the import is not aliased,
 *   and the matching `<Name>Props` type import.
 * - Leaves aliased imports (`Modal as Foo`) referenced by their alias.
 * Re-runnable: files without the import are left untouched.
 */
import { parseArgs } from 'node:util';
import {
    Project,
    QuoteKind,
    type SourceFile,
} from 'ts-morph';

interface Options {
    fromModule: string;
    toModule: string;
    name: string;
    rename: string;
}

function moveSpecifier(sourceFile: SourceFile, options: Options, importedName: string, newName: string) {
    const fromImport = sourceFile.getImportDeclaration(
        (declaration) => declaration.getModuleSpecifierValue() === options.fromModule,
    );
    const specifier = fromImport?.getNamedImports()
        .find((namedImport) => namedImport.getName() === importedName);
    if (!fromImport || !specifier) {
        return false;
    }

    const alias = specifier.getAliasNode()?.getText();
    const isTypeOnly = specifier.isTypeOnly() || fromImport.isTypeOnly();
    if (!alias && importedName !== newName) {
        // NOTE: renames the local binding and every reference to it in this file
        specifier.getNameNode().rename(newName);
    }
    specifier.remove();
    if (fromImport.getNamedImports().length === 0
        && !fromImport.getDefaultImport()
        && !fromImport.getNamespaceImport()) {
        fromImport.remove();
    }

    const toImport = sourceFile.getImportDeclaration(
        (declaration) => declaration.getModuleSpecifierValue() === options.toModule,
    );
    const spec = { name: newName, alias, isTypeOnly: isTypeOnly && !toImport?.isTypeOnly() };
    if (toImport) {
        toImport.addNamedImport(spec);
    } else {
        sourceFile.addImportDeclaration({
            moduleSpecifier: options.toModule,
            namedImports: [spec],
        });
    }
    return true;
}

function run() {
    const { values, positionals } = parseArgs({
        options: {
            from: { type: 'string' },
            to: { type: 'string' },
            name: { type: 'string' },
            rename: { type: 'string' },
            'dry-run': { type: 'boolean', default: false },
        },
        allowPositionals: true,
    });
    if (!values.from || !values.to || !values.name || positionals.length === 0) {
        throw new Error('Usage: --from <module> --to <module> --name <Component> [--rename <NewName>] [--dry-run] <globs...>');
    }
    const options: Options = {
        fromModule: values.from,
        toModule: values.to,
        name: values.name,
        rename: values.rename ?? values.name,
    };

    const project = new Project({
        skipAddingFilesFromTsConfig: true,
        manipulationSettings: { quoteKind: QuoteKind.Single },
    });
    project.addSourceFilesAtPaths(positionals);

    const changed: string[] = [];
    project.getSourceFiles().forEach((sourceFile) => {
        const movedComponent = moveSpecifier(sourceFile, options, options.name, options.rename);
        const movedProps = moveSpecifier(sourceFile, options, `${options.name}Props`, `${options.rename}Props`);
        if (movedComponent || movedProps) {
            changed.push(sourceFile.getFilePath());
        }
    });

    if (!values['dry-run']) {
        project.saveSync();
    }
    // eslint-disable-next-line no-console
    console.info(`${values['dry-run'] ? 'Would change' : 'Changed'} ${changed.length} file(s)`);
    // eslint-disable-next-line no-console
    changed.forEach((file) => console.info(`  ${file}`));
}

run();
