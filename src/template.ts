


import * as fs from 'node:fs/promises'
import * as np from 'node:path'
import * as ps from 'node:process'
import Module from 'node:module'

import * as esbuild from 'esbuild'
import { render } from 'preact-render-to-string'
import { Context } from './main'
// import { render } from 'preact-render-to-string/jsx'




function noriteBundler(outBase: string, outDir: string): esbuild.Plugin {

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

        const result = await esbuild.build({
            entryPoints: [args.path],
            outbase: outBase,
            outdir: outDir,
            assetNames: 'bundle/[ext]/[name]-[hash]',
            format: 'esm',
            bundle: true,
            metafile: true,
            // write: false,
            loader: Object.fromEntries(
                filetypes.map(x => [`.${x}`, 'file' as esbuild.Loader])
            ),
        })

        let contents
        const originalPath = args.pluginData.norite.originalPath ?? ''
        for (const [path, obj] of Object.entries(result.metafile.outputs)) {
            if (obj.entryPoint && np.resolve(obj.entryPoint) == originalPath) {
                contents = await fs.readFile(path, 'utf8')
                break
            }
        }

        return {
            contents: contents,
            loader: 'file',
            // resolveDir: np.dirname(args.path),
        }
    }


    return {
        name: 'norite-loader',
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





export class TemplateEngine {

    templates: Record<string, Function> = {}
    noDefaultImportFiles: string[] = []

    _sourceDir: string
    _cacheDir: string
    _context: esbuild.BuildContext<any>
    _require = Module.createRequire(import.meta.url)


    constructor(
        ctx: esbuild.BuildContext<any>,
        opts: { sourceDir: string, cacheDir: string }
    ) {
        this._context = ctx
        this._sourceDir = opts.sourceDir
        this._cacheDir = opts.cacheDir
    }


    static async new(opts: { sourceDir: string, cacheDir: string }) {

        const ctx = await esbuild.context({
            entryPoints: [
                // np.join(opts.sourceDir, '/**/*.js'),
                // np.join(opts.sourceDir, '/**/*.ts'),
                np.join(opts.sourceDir, '/**/*.jsx'),
                np.join(opts.sourceDir, '/**/*.tsx'),
            ],
            outbase: opts.sourceDir,
            outdir: opts.cacheDir,
            assetNames: 'bundle/[ext]/[name]-[hash]',
            // chunkNames: 'chunks/[name]-[hash]',

            format: 'esm',
            bundle: true,
            metafile: true,
            logOverride: {
                'empty-glob': 'info',
            },
            // write: false,

            jsx: 'automatic',
            jsxFactory: 'h',
            jsxFragment: 'Fragment',
            jsxImportSource: 'norite',
            external: ['norite/jsx-runtime'],

            plugins: [
                noriteBundler(opts.sourceDir, opts.cacheDir),
            ],
        })
        return new TemplateEngine(ctx, opts)
    }

    async parse() {

        await fs.access(this._sourceDir)

        try {
            await fs.access(this._cacheDir)
            await fs.rm(this._cacheDir, { recursive: true })
        } catch { }

        await fs.mkdir(this._cacheDir, { recursive: true })

        for (const key of Object.keys(this._require.cache)) {
            if (key.includes(this._cacheDir)) {
                delete this._require.cache[key]
            }
        }

        this.templates = {}
        this.noDefaultImportFiles = []

        const result = await this._context.rebuild()

        for (const [path, obj] of Object.entries(result.metafile!.outputs)) {
            const name = np.basename(
                path.replace(`${this._cacheDir}/`, ''), np.extname(path)
            )

            const ext = np.extname(obj.entryPoint ?? '')
            if (ext != '.tsx' && ext != '.jsx') { continue }

            if (!obj.exports || !obj.exports.includes('default')) {
                this.noDefaultImportFiles.push(name)
                continue
            }

            const fullpath = np.join(ps.cwd(), path)
            this.templates[name] = this._require(fullpath).default
        }

    }

    render(
        templateName: string,
        opts: { content: string, frontmatter: any, slug: string }
    ): string {

        if (this.noDefaultImportFiles.includes(templateName)) {
            throw new Error(
                `'${templateName}' does not have a default export, ` +
                'export a function that returns JSX or a string'
            )
        }

        if (!(templateName in this.templates)) {
            throw new Error(`template '${templateName}' not found`)
        }

        if (typeof this.templates[templateName] != 'function') {
            throw new Error(
                `default export of '${templateName}' is not a function, ` +
                'export a function that returns JSX or a string'
            )
        }

        const ctx: Context = {
            content: opts.content,
            frontmatter: opts.frontmatter,
            meta: {
                slug: opts.slug,
                origin: '',
            }
        }
        const output = this.templates[templateName](ctx)

        if (typeof output == 'string') { return output }
        return render(output)
    }

}
