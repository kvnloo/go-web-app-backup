import { ValidateEnv as validateEnv } from '@togglecorp/vite-plugin-validate-env';
import { isDefined } from '@togglecorp/fujs';
import { defineConfig, loadEnv } from 'vite';
import tsconfigPaths from 'vite-tsconfig-paths';
import webfontDownload from 'vite-plugin-webfont-dl';
import reactSwc from '@vitejs/plugin-react-swc';
import { execSync } from 'child_process';
import { existsSync } from 'node:fs';
import { extname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { visualizer } from 'rollup-plugin-visualizer';
import checker from 'vite-plugin-checker';
import { compression } from 'vite-plugin-compression2';
import { VitePluginRadar } from 'vite-plugin-radar';
import svgr from 'vite-plugin-svgr';
import pkg from './package.json';
import uiPkg from '../packages/ui/package.json';

import envConfig from './env';

/* Get commit hash */
const commitHash = execSync('git rev-parse --short HEAD').toString();

/*
 * NOTE: the dev server compiles @ifrc-go/ui from its source, so a library edit
 * hot-reloads like an app edit without rebuilding the library. Each entry in
 * the library's `exports` maps to the source file its dist file is built
 * from; the library's own `#components/*`-style aliases resolve through its
 * tsconfig, which vite-tsconfig-paths picks up for files under packages/ui.
 * Builds, tests and typecheck keep using dist; set GO_UI_FROM_DIST=true to
 * serve dist instead.
 */
const uiRoot = fileURLToPath(new URL('../packages/ui', import.meta.url));
function getUiSourceAliases() {
    return Object.entries(uiPkg.exports).map(([subpath, target]) => {
        const sourceBase = join(uiRoot, target.import.replace(/^\.\/dist\//, 'src/').replace(/\.js$/, ''));
        const sourcePath = ['', '.tsx', '.ts']
            .map((extension) => `${sourceBase}${extension}`)
            .find((candidate) => extname(candidate) !== '' && existsSync(candidate));
        const specifier = `@ifrc-go/ui${subpath.slice(1)}`.replace(/[.*+?^${}()|[\]\\/]/g, '\\$&');
        return { find: new RegExp(`^${specifier}$`), replacement: sourcePath ?? sourceBase };
    });
}

export default defineConfig(({ command, mode }) => {
    const isProd = mode === 'production';
    const env = loadEnv(mode, process.cwd(), '')
    const serveUiSource = command === 'serve'
        && mode !== 'test'
        && process.env.GO_UI_FROM_DIST !== 'true';

    return {
        define: {
            'import.meta.env.APP_COMMIT_HASH': JSON.stringify(commitHash),
            'import.meta.env.APP_VERSION': JSON.stringify(env.npm_package_version),
            'import.meta.env.APP_PACKAGE_NAME': JSON.stringify(env.npm_package_name),
            'import.meta.env.APP_REPOSITORY_URL': JSON.stringify(pkg.repository.url.match(/https:\/\/github\.com\/[^ ]+/)?.[0].replace(/\.git$/, '')),
            // NOTE: To fix 'global is not defined' issue after migration from yarn to pnpm
            global: {},
        },
        plugins: [
            isProd ? checker({
                // typescript: true,
                eslint: {
                    useFlatConfig: true,
                    lintCommand: 'eslint ./src',
                },
                // TODO: Enable this once https://github.com/fi3ework/vite-plugin-checker/issues/260 is fixed
                // stylelint: {
                //     lintCommand: 'stylelint "./src/**/*.css"',
                // },
            }) : undefined,
            svgr(),
            reactSwc(),
            tsconfigPaths(),
            webfontDownload(),
            validateEnv(envConfig),
            isProd ? compression() : undefined,
            isProd ? visualizer({ sourcemap: true }) : undefined,
            VitePluginRadar({
                analytics: {
                    id: env.APP_GOOGLE_ANALYTICS_ID,
                },
                hotjar: isDefined(env.APP_HOTJAR_ID) ? ({
                    id: Number(env.APP_HOTJAR_ID),
                }) : undefined,
            })
        ],
        css: {
            devSourcemap: isProd,
            modules: {
                scopeBehaviour: 'local',
                localsConvention: 'camelCaseOnly',
            },
        },
        resolve: {
            alias: serveUiSource ? getUiSourceAliases() : [],
        },
        envPrefix: 'APP_',
        server: {
            port: 3000,
            allowedHosts: ["host.docker.internal"],
            strictPort: true,
            // The Malawi backend sends no CORS headers, so the dev server proxies
            // its GraphQL API; links such as the admin still use the domain directly
            proxy: {
                '/malawi-backend': {
                    target: env.APP_MALAWI_RISK_WATCH_DOMAIN || 'http://localhost:8060',
                    changeOrigin: true,
                    rewrite: (path) => path.replace(/^\/malawi-backend/, ''),
                },
            },
        },
        build: {
            outDir: '../build',
            sourcemap: isProd,
            emptyOutDir: true,
            rollupOptions: {
                output: {
                    chunkFileNames: `${env.npm_package_version}/chunk-[name].[hash].js`,
                    entryFileNames: `${env.npm_package_version}/entry-[name].[hash].js`,
                    assetFileNames: `${env.npm_package_version}/asset-[name]-[hash].[ext]`,
                    manualChunks: {
                        'mapbox-gl': ['mapbox-gl'],
                        'exceljs': ['exceljs'],
                    }
                    // experimentalMinChunkSize: 500_000,
                },
            },
        },
        test: {
            environment: 'happy-dom',
            coverage: {
                enabled: true,
                reporter: 'html',
            },
        },
    };
});
