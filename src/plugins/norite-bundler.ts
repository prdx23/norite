
import * as fs from 'node:fs/promises'
import * as np from 'node:path'
import * as esbuild from 'esbuild'

import { noritePostcss } from './norite-postcss'


export function noriteBundler(
    outBase: string, outDir: string, bundleDir: string,
    contextCache: Record<string, esbuild.BuildContext>,
): esbuild.Plugin {

    // const contextCache: Record<string, esbuild.BuildContext> = {}
    const noritePostcssPlugin = noritePostcss()

    async function onResolve(
        args: esbuild.OnResolveArgs, build: esbuild.PluginBuild
    ): Promise<esbuild.OnResolveResult> {

        let path = args.path.replace('bundle:', '')
        const ext = np.extname(path)

        if (ext != '.js' && ext != '.ts' && ext != '.css') {
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
        if (ext == '.ts') {
            path = np.join(
                np.dirname(result.path), `${np.basename(result.path, ext)}.js`,
            )
        }

        return {
            warnings: result.warnings,
            path: path,
            namespace: 'norite-bundle',
            pluginData: { norite: { originalPath: result.path } },
            // external: true,
        }

    }


    async function onLoad(
        args: esbuild.OnLoadArgs
    ): Promise<esbuild.OnLoadResult> {

        if (!contextCache[args.path]) {
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

            contextCache[args.path] = await esbuild.context({
                entryPoints: [args.path],
                outbase: outBase,
                outdir: outDir,
                assetNames: `${bundleDir}/[ext]/[name]-[hash]`,
                entryNames: `${bundleDir}/[ext]/[name]-[hash]`,
                format: 'esm',
                bundle: true,
                metafile: true,
                // write: false,
                loader: Object.fromEntries(
                    filetypes.map(x => [`.${x}`, 'file' as esbuild.Loader])
                ),
                // plugins: [noritePostcss()],
                plugins: [noritePostcssPlugin],
            })
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
            // resolveDir: np.dirname(args.path),
        }
    }


    return {
        name: 'norite-bundler',
        setup(build) {
            build.onResolve(
                { filter: /^bundle:.*$/ },
                async (args) => {
                    return await onResolve(args, build)
                }
            )
            build.onLoad(
                { filter: /^.*$/, namespace: 'norite-bundle' },
                async (args) => {
                    return await onLoad(args)
                }
            )
        },
    }
}
