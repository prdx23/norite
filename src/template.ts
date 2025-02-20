


import * as fs from 'node:fs/promises'
import * as np from 'node:path'
import * as ps from 'node:process'
import Module from 'node:module'

import { Config } from './config'
import * as esbuild from 'esbuild'



export class TemplateEngine {

    templates: Record<string, Function> = {}
    cacheDir: string
    context: esbuild.BuildContext<any>
    require = Module.createRequire(import.meta.url)

    constructor(ctx: esbuild.BuildContext<any>, cacheDir: string) {
        this.context = ctx
        this.cacheDir = cacheDir
    }

    static async new(config: Config) {

        fs.access(config.templatesDir)

        const ctx = await esbuild.context({
            entryPoints: [
                np.join(config.templatesDir, '/**/*.js'),
                np.join(config.templatesDir, '/**/*.ts'),
                np.join(config.templatesDir, '/**/*.jsx'),
                np.join(config.templatesDir, '/**/*.tsx'),
            ],

            format: 'esm',
            bundle: true,
            outbase: config.templatesDir,
            outdir: config._templatesCacheDir,
            logOverride: {
                'empty-glob': 'info',
            },
            // write: false,

            jsx: 'automatic',
            jsxFactory: 'h',
            jsxFragment: 'Fragment',
            jsxImportSource: 'norite',
            external: ['norite/jsx-runtime'],
        })

        return new TemplateEngine(ctx, config._templatesCacheDir)
    }

    async parse() {

        try {
            await fs.access(this.cacheDir)
            await fs.rm(this.cacheDir, { recursive: true })
        } catch { }

        await fs.mkdir(this.cacheDir, { recursive: true })
        this.templates = {}

        await this.context.rebuild()

        for (const key of Object.keys(this.require.cache)) {
            if (key.includes(this.cacheDir)) {
                delete this.require.cache[key]
            }
        }

        const templatesDir = await fs.opendir(this.cacheDir, { recursive: true })

        for await (const file of templatesDir) {

            const ext = np.extname(file.name)
            if (ext != '.js') { continue }
            if (file.isDirectory()) { continue }

            const name = np.join(file.parentPath, file.name.replace(ext, ''))
            const path = np.join(ps.cwd(), file.parentPath, file.name)
            this.templates[name] = this.require(path).default

        }

    }

    load(name: string) {
        return this.templates[np.join(this.cacheDir, name)]
    }

}
