

import * as fs from 'node:fs/promises'
import * as np from 'node:path'
import * as ps from 'node:process'

import colors from 'yoctocolors'

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


    static async new(config: Config): Promise<Engine> {

        await fs.access(np.join(ps.cwd(), 'norite.config.js')).catch(() => {
            throw new Error(
                colors.red('norite.config.js not found.\n') +
                colors.yellow(`run 'npx norite init' or create a blank `) +
                colors.yellow(`in project root to use defaults\n`)
            )
        })

        const nodes = await loadContentTree(config.contentDir, config.outputDir)
        // for (const node of nodes) {
        //     console.log(`<${node.type} ${node.slug}>`)
        // }

        const templateEngine = await TemplateEngine.new({
            sourceDir: config.templatesDir,
            cacheDir: np.join(config.cacheDir, 'templates'),
        })

        const markdownEngine = new MarkdownEngine()

        return new Engine(nodes, config, markdownEngine, templateEngine)
    }



    async parseTemplates() {
        await this.templateEngine.parse()
    }


    async transform() {
        const tasks = []
        for (const node of this.nodes) {
            if (node.type == 'asset') { continue }
            tasks.push(node.transform(this.markdownEngine, this.templateEngine))
        }
        await Promise.all(tasks)
    }


    async build() {
        try {
            await fs.access(this.config.outputDir)
            await fs.rm(this.config.outputDir, { recursive: true })
        } catch { }

        await fs.mkdir(this.config.outputDir, { recursive: true })

        const bundleNodes = await loadContentTree(
            np.join(this.config.cacheDir, 'templates', 'bundle'),
            np.join(this.config.outputDir, 'bundle'),
        )

        const tasks = []
        const nodes = this.nodes.concat(bundleNodes)
        for (const node of nodes) {
            tasks.push(node.build({ link: true }))
        }
        await Promise.all(tasks)
    }


    dispose() {
        this.templateEngine._context.dispose()
    }

}
