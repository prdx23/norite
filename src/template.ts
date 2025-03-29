


import * as fs from 'node:fs/promises'
import * as np from 'node:path'
// import Module from 'node:module'

import { noriteBundler } from './plugins/norite-bundler'

import * as esbuild from 'esbuild'
import { render } from 'preact-render-to-string'
import { Context } from 'norite'
// import { render } from 'preact-render-to-string/jsx'



export class TemplateEngine {

    templates: Record<string, {path: string, render?: Function}> = {}
    noDefaultImportFiles: string[] = []

    _sourceDir: string
    _cacheDir: string
    _esbuildContext: esbuild.BuildContext<any>
    // _require = Module.createRequire(import.meta.url)

    static templateDir: string = 'templates'
    static bundleDir: string = 'bundle'

    constructor(
        ctx: esbuild.BuildContext<any>,
        opts: { sourceDir: string, cacheDir: string }
    ) {
        this._esbuildContext = ctx
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
            assetNames: `${TemplateEngine.bundleDir}/[ext]/[name]-[hash]`,
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
                noriteBundler(
                    opts.sourceDir, opts.cacheDir, TemplateEngine.bundleDir
                ),
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

        // for (const key of Object.keys(this._require.cache)) {
        //     if (key.includes(this._cacheDir)) {
        //         delete this._require.cache[key]
        //     }
        // }

        this.templates = {}
        this.noDefaultImportFiles = []

        const result = await this._esbuildContext.rebuild()

        for (const [path, obj] of Object.entries(result.metafile!.outputs)) {
            const name = path
                .replace(`${this._cacheDir}/`, '')
                .replace(np.extname(path), '')

            const ext = np.extname(obj.entryPoint ?? '')
            if (ext != '.tsx' && ext != '.jsx') { continue }

            if (!obj.exports || !obj.exports.includes('default')) {
                this.noDefaultImportFiles.push(name)
                continue
            }

            const fullpath = `${np.resolve(path)}?d=${Date.now()}`
            // WARN: temporary workaround
            // causes small memory leak in dev mode as cache is never cleared
            // https://github.com/nodejs/node/issues/49442
            // https://nodejs.org/api/vm.html#class-vmscript

            // this.templates[name] = this._require(fullpath).default
            // const module = await import(fullpath)
            // this.templates[name] = module.default

            this.templates[name] = { path: fullpath }
        }

    }

    async render(templateName: string, context: Context): Promise<string> {

        if (this.noDefaultImportFiles.includes(templateName)) {
            throw new Error(
                `'${templateName}' does not have a default export, ` +
                'export a function that returns JSX or a string'
            )
        }

        if (!(templateName in this.templates)) {
            throw new Error(`template '${templateName}' not found`)
        }

        if (!this.templates[templateName].render) {
            const module = await import(this.templates[templateName].path)
            this.templates[templateName].render = module.default
        }

        if (typeof this.templates[templateName].render != 'function') {
            throw new Error(
                `default export of '${templateName}' is not a function, ` +
                'export a function that returns JSX or a string'
            )
        }

        const output = this.templates[templateName].render(context)

        if (typeof output == 'string') { return output }
        return render(output)
    }

}
