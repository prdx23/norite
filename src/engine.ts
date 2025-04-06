

import * as fs from 'node:fs/promises'
import * as np from 'node:path'
import assert from 'node:assert'

import { type Config } from './config'
import { type ContentNode, loadDirTree } from './content'
import { MarkdownProcessor, HtmlProcessor } from './processors'
import { TemplateEngine } from './template'
import { createDevServer } from './server'

import colors from 'yoctocolors'
import chokidar from 'chokidar'



type Mode = 'dev' | 'build'
type BuildLevel = 'full' | 'content' | 'transform'

export class Engine {

    config: Config
    nodes: ContentNode[]
    markdownProcessor: MarkdownProcessor
    htmlProcessor: HtmlProcessor
    templateEngine: TemplateEngine
    mode: Mode
    _devOutputDir: string


    constructor(
        config: Config,
        mode: Mode,
        markdownProcessor: MarkdownProcessor,
        HtmlProcessor: HtmlProcessor,
        templateEngine: TemplateEngine,
    ) {
        this.nodes = []
        this.config = config
        this.markdownProcessor = markdownProcessor
        this.htmlProcessor = HtmlProcessor
        this.templateEngine = templateEngine
        this.mode = mode
        this._devOutputDir = np.join(config.internal.cacheDir, 'output')
    }


    static async new(config: Config, mode: Mode) {
        return new Engine(
            config,
            mode,
            new MarkdownProcessor(config.markdown),
            new HtmlProcessor(mode),
            await TemplateEngine.new({
                sourceDir: config.templatesDir,
                cacheDir: np.join(config.internal.cacheDir, 'templates'),
            }),
        )
    }


    async _loadNodes() {

        const contentNodes = await loadDirTree({
            sourceDir: this.config.contentDir,
            initialPath: ''
        })

        const bundleNodes = await loadDirTree({
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


    async _transformAndRenderNodes() {
        const tasks = []
        for (const node of this.nodes) {
            tasks.push(node.transform(this))
        }
        await Promise.all(tasks)

        for (const node of this.nodes) {
            assert(
                node._stage != 'loaded',
                'attempt to render nodes before all nodes transformed'
            )
        }

        tasks.splice(0, tasks.length)
        for (const node of this.nodes) {
            tasks.push(node.render(this))
        }
        await Promise.all(tasks)
    }


    async _buildNodes() {

        const opts = this.mode == 'dev' ? {
            outputDir: this._devOutputDir,
            link: true,
        } : {
            outputDir: this.config.outputDir,
            link: false,
        }

        try {
            await fs.access(opts.outputDir)
            await fs.rm(opts.outputDir, { recursive: true })
        } catch { }

        await fs.mkdir(opts.outputDir, { recursive: true })

        for (const node of this.nodes) {
            assert(
                node._stage != 'loaded' && node._stage != 'transformed',
                'attempt to build nodes before all nodes rendered'
            )
        }

        const tasks = []
        for (const node of this.nodes) {
            tasks.push(node.build(opts))
        }
        await Promise.all(tasks)
    }

    _dispose() {
        this.templateEngine.dispose()
    }


    async _run(level: BuildLevel) {
        console.time('build')

        try {

            if (level == 'full') {
                await this.templateEngine.parse()
            }

            if (level == 'full' || level == 'content') {
                await this._loadNodes()
            }

            await this._transformAndRenderNodes()
            await this._buildNodes()

        } catch(err: any) {
            console.error(colors.red(err))
            // console.error(err.stack)
        }

        console.timeEnd('build')
        console.log()
    }


    async build() {
        await this._run('full')
        this._dispose()
    }


    async dev() {

        const broadcastReload = createDevServer(this._devOutputDir, this.config)

        await this._run('full')

        const queue: BuildLevel[] = []
        let isProcessing = false;

        const processQueue = async (
            type: BuildLevel, event: string, path: string
        ) => {
            console.log(`${colors.cyan(event)}: ${path}`)
            queue.push(type)
            if (isProcessing) { return }

            isProcessing = true
            while (queue.length > 0) {
                if (queue.length > 4) {
                    queue.splice(0, queue.length)
                    await this._run('full')
                } else {
                    await this._run(queue.shift()!)
                }
                broadcastReload()
            }
            isProcessing = false
        }

        const contentWatcher = chokidar.watch(this.config.contentDir, {
            persistent: true,
            ignoreInitial: true,
            awaitWriteFinish: { stabilityThreshold: 200 },
        })
        contentWatcher.on('add', (path) => {
            processQueue('content', 'add', path)
        })
        contentWatcher.on('change', (path) => {
            processQueue('transform', 'change', path)
        })
        contentWatcher.on('unlink', (path) => {
            processQueue('content', 'remove', path)
        })

        const templatesWatcher = chokidar.watch(this.config.templatesDir, {
            persistent: true,
            ignoreInitial: true,
            awaitWriteFinish: { stabilityThreshold: 200 },
        })
        templatesWatcher.on('add', (path) => {
            processQueue('full', 'add', path)
        })
        templatesWatcher.on('change', (path) => {
            processQueue('full', 'change', path)
        })
        templatesWatcher.on('unlink', (path) => {
            processQueue('full', 'remove', path)
        })

        process.on('SIGINT', () => {
            console.log('\nExiting...')
            this._dispose()
            process.exit(0)
        })

    }

}
