
import * as fs from 'node:fs/promises'
import * as np from 'node:path'
import * as esbuild from 'esbuild'

import { noritePostcss } from './norite-postcss'


export function noriteBundler(
    outBase: string,
    outDir: string,
    bundleDir: string,
    enablePostCSS: boolean,
    contextCache: Record<string, esbuild.BuildContext>,
): esbuild.Plugin {

    // const contextCache: Record<string, esbuild.BuildContext> = {}
    const noritePostcssPlugin = noritePostcss()

    async function onResolve(
        prefix: string, args: esbuild.OnResolveArgs, build: esbuild.PluginBuild,
    ): Promise<esbuild.OnResolveResult> {

        let path = args.path.replace(`${prefix}:`, '')
        const ext = np.extname(path)

        if (prefix == 'bundle' && ext != '.js' && ext != '.ts' && ext != '.css') {
            return { errors: [{
                text: `filetype '${ext}' not supported in 'bundle:' paths`,
            }]}
        }

        const result = await build.resolve(path, {
            kind: args.kind,
            resolveDir: args.resolveDir,
            importer: args.importer,
        })

        if (result.errors.length > 0) {
            return { errors: result.errors }
        }

        path = result.path
        if (prefix == 'bundle' && ext == '.ts') {
            path = np.join(
                np.dirname(result.path), `${np.basename(result.path, ext)}.js`,
            )
        }

        return {
            warnings: result.warnings,
            path: path,
            namespace: `norite-${prefix}`,
            pluginData: { norite: { originalPath: result.path } },
        }

    }


    async function getBundledPath(
        esbuildOpts: esbuild.BuildOptions,
        args: esbuild.OnLoadArgs,
    ): Promise<esbuild.OnLoadResult> {

        if (!contextCache[args.path]) {
            contextCache[args.path] = await esbuild.context(esbuildOpts)
        }

        const result = await contextCache[args.path].rebuild()

        let bundlePath
        const originalPath = args.pluginData.norite.originalPath ?? ''
        for (const [path, obj] of Object.entries(result.metafile!.outputs)) {
            if (obj.entryPoint && np.resolve(obj.entryPoint) == originalPath) {
                bundlePath = path.replace(outDir, '')
                break
            }
        }

        return {
            contents: `export default '${bundlePath}'`,
            loader: 'js',
        }
    }


    async function onLoadBundle(
        args: esbuild.OnLoadArgs
    ): Promise<esbuild.OnLoadResult> {
        const filetypes = [
            // images
            'apng', 'bmp', 'png', 'jpg', 'jpeg', 'jfif', 'pjpeg',
            'pjp', 'gif', 'svg', 'ico', 'webp', 'avif', 'cur', 'jxl',
            // media
            'mp4', 'webm', 'ogg', 'mp3', 'wav', 'flac', 'aac',
            'opus', 'mov', 'm4a', 'vtt',
            // fonts
            'woff', 'woff2', 'eot', 'ttf', 'otf',
            // other
            'webmanifest', 'pdf', 'txt', 'vert', 'frag', 'glsl', 'comp',
        ]
        return getBundledPath({
            entryPoints: [args.path],
            outbase: outBase,
            outdir: outDir,
            assetNames: `${bundleDir}/[ext]/[name]-[hash]`,
            entryNames: `${bundleDir}/[ext]/[name]-[hash]`,
            format: 'esm',
            bundle: true,
            metafile: true,
            loader: Object.fromEntries(
                filetypes.map(x => [`.${x}`, 'file' as esbuild.Loader])
            ),
            plugins: enablePostCSS ? [noritePostcssPlugin] : [],
        }, args)
    }


    async function onLoadUrl(
        args: esbuild.OnLoadArgs
    ): Promise<esbuild.OnLoadResult> {
        const ext = np.extname(args.path)
        return getBundledPath({
            entryPoints: [args.path],
            outbase: outBase,
            outdir: outDir,
            entryNames: `${bundleDir}/[ext]/[name]-[hash]`,
            metafile: true,
            loader: { [ext]: 'copy' },
        }, args)
    }


    return {
        name: 'norite-bundler',
        setup(build) {

            build.onResolve(
                { filter: /^bundle:.*$/ },
                (args) => onResolve('bundle', args, build)
            )
            build.onLoad(
                { filter: /^.*$/, namespace: 'norite-bundle' },
                (args) => onLoadBundle(args)
            )

            build.onResolve(
                { filter: /^url:.*$/ },
                (args) => onResolve('url', args, build)
            )
            build.onLoad(
                { filter: /^.*$/, namespace: 'norite-url' },
                (args) => onLoadUrl(args)
            )

            build.onResolve(
                { filter: /^raw:.*$/ },
                (args) => onResolve('raw', args, build)
            )
            build.onLoad(
                { filter: /^.*$/, namespace: 'norite-raw' },
                async (args) => {
                    const text = await fs.readFile(args.path, 'utf8')
                    return {
                        contents: `export default ${JSON.stringify(text)}`,
                        loader: 'js',
                        watchFiles: [args.path],
                    }
                }
            )

        },
    }
}
