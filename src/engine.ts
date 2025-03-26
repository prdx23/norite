

import * as fs from 'node:fs/promises'
import * as np from 'node:path'

import { type Config } from './config'
import { type ContentNode, loadContentTree } from './content'
import { MarkdownEngine } from './markdown'
import { TemplateEngine } from './template'



export class Engine {

    config: Config
    nodes: ContentNode[]
    markdownEngine: MarkdownEngine
    templateEngine: TemplateEngine


    constructor(
        nodes: ContentNode[], config: Config,
        markdownEngine: MarkdownEngine,
        templateEngine: TemplateEngine
    ) {
        this.nodes = nodes
        this.config = config
        this.markdownEngine = markdownEngine
        this.templateEngine = templateEngine
    }


    async parseTemplates() {
        await this.templateEngine.parse()
    }

    async loadNodes() {

        const contentNodes = await loadContentTree({
            sourceDir: this.config.contentDir,
            initialPath: ''
        })

        const bundleNodes = await loadContentTree({
            sourceDir: np.join(
                this.config.internal.cacheDir, TemplateEngine.templateDir
            ),
            initialPath: TemplateEngine.bundleDir,
        })

        this.nodes = contentNodes.concat(bundleNodes)

        // for (const node of this.nodes) {
        //     console.log(`<${node.type} ${node.slug}>`)
        // }
    }

    async transform(opts: { dev: boolean }) {
        const tasks = []
        for (const node of this.nodes) {
            if (node.type == 'asset') { continue }
            tasks.push(node.transform({
                dev: opts.dev,
                mdEngine: this.markdownEngine,
                templateEngine: this.templateEngine
            }))
        }
        await Promise.all(tasks)
    }


    async build(opts: { outputDir: string, link: boolean }) {
        try {
            await fs.access(opts.outputDir)
            await fs.rm(opts.outputDir, { recursive: true })
        } catch { }

        await fs.mkdir(opts.outputDir, { recursive: true })

        const tasks = []
        for (const node of this.nodes) {
            tasks.push(node.build(opts))
        }
        await Promise.all(tasks)
    }


    dispose() {
        this.templateEngine._esbuildContext.dispose()
    }

}
