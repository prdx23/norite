
import * as fs from 'node:fs/promises'
import * as np from 'node:path'

import { HtmlProcessor } from './processors'

import { Context } from 'norite'
import { Engine } from './engine'



type ContentNodeType = 'page' | 'asset'

export class ContentNode {

    type: ContentNodeType
    slug: string
    _path: string
    _sourcePath: string
    _outputPath: string
    _stage: 'loaded' | 'transformed' | 'rendered' | 'built'

    frontmatter: any = { template: '' }
    content: string = ''
    html: string = ''

    constructor(type: ContentNodeType, path: string, sourceDir: string) {
        this.type = type
        this._path = path
        this._sourcePath = np.join(sourceDir, path)
        this._outputPath = path
        this.slug = np.join('/', path)

        if (type == 'page') {

            let filename = `${np.basename(path, np.extname(path))}.html`

            if (path.startsWith('[') && path.endsWith('].json')) {
                filename = np.basename(path, np.extname(path))
                    .replace('[', '')
                    .replace(']', '')
            }

            this._outputPath = np.join(np.dirname(path), filename)

            if (filename == 'index.html') {
                this.slug = np.join('/', np.dirname(path))
            } else {
                this.slug = np.join('/', np.dirname(path), filename)
            }
        }

        this._stage = 'loaded'
    }


    async transform(engine: Engine) {

        this.frontmatter = { template: '' }
        this.content = ''
        this.html = ''

        if (this.type != 'page') {
            this._stage = 'transformed'
            return
        }

        const text = await fs.readFile(this._sourcePath, {encoding: 'utf8'})
        const ext = np.extname(this._sourcePath)

        if (ext == '.json') {
            Object.assign(this.frontmatter, JSON.parse(text))
        }

        if (ext == '.md') {
            const result = await engine.markdownProcessor.parse(text)
            this.content = result.content
            Object.assign(this.frontmatter, result.frontmatter)
        }

        this._stage = 'transformed'
    }

    async render(engine: Engine) {

        if (this.type != 'page') {
            this._stage = 'rendered'
            return
        }

        const context: Context = {
            content: this.content,
            frontmatter: this.frontmatter,
            meta: {
                slug: this.slug,
                origin: engine.config.origin,
            },
            nodes: engine.nodes,
        }
        let renderedText = await engine.templateEngine.render(
            this.frontmatter.template, context
        )

        if (np.extname(this._outputPath) != '.html') {
            this.html = renderedText
            this._stage = 'rendered'
            return
        }

        if (!renderedText.startsWith('<!DOCTYPE html>')) {
            renderedText = `<!DOCTYPE html>\n${renderedText}`
        }

        if (engine.mode == 'dev') {
            this.html = renderedText.replace(
                '</body>',
                `<script src='/${HtmlProcessor.scriptName}'></script>\n</body>`
            )
        } else {
            this.html = await engine.htmlProcessor.parse(renderedText)
        }

        this._stage = 'rendered'
    }


    async build(opts: { outputDir: string, link: boolean }) {

        const outPath = np.join(opts.outputDir, this._outputPath)

        const parent = np.dirname(outPath)
        await fs.access(parent).catch(async () => {
            await fs.mkdir(parent, { recursive: true })
        })

        if (this.type == 'asset') {
            if (opts.link) {
                await fs.symlink(np.resolve(this._sourcePath), outPath)
            } else {
                await fs.cp(this._sourcePath, outPath)
            }
        }

        if (this.type == 'page') {
            await fs.writeFile(outPath, this.html)
        }

        this._stage = 'built'
    }

}



function detectNodeType(path: string): ContentNodeType {
    const name = np.basename(path)
    if (
        name == 'index.json' ||
        np.extname(name) == '.md' ||
        (name.startsWith('[') && name.endsWith('].json'))
    ) {
        return 'page'
    }
    return 'asset'
}

export async function loadDirTree(
    opts: { sourceDir: string, initialPath: string}
): Promise<ContentNode[]> {

    const paths = [opts.initialPath]
    const nodes: ContentNode[] = []

    const testPath = np.join(opts.sourceDir, opts.initialPath)
    await fs.access(testPath).catch(() => {
        throw new Error(`'${testPath}' not found`)
    })

    while (paths.length > 0) {

        const route = paths.pop()!
        const path = np.join(opts.sourceDir, route)
        const lstat = await fs.lstat(path)

        if (lstat.isDirectory()) {
            const dir = await fs.opendir(path)
            for await (const file of dir) {
                paths.push(np.join(route, file.name))
            }
            continue
        }

        if (lstat.isFile() && detectNodeType(path) == 'page') {
            nodes.push(new ContentNode('page', route, opts.sourceDir))
            continue
        }

        nodes.push(new ContentNode('asset', route, opts.sourceDir))

    }

    for (let i = 0; i <= nodes.length - 2; i++) {
        for (let j = i + 1; j <= nodes.length - 1; j++) {
            if (nodes[i].slug == nodes[j].slug) {
                throw new Error(
                    `both '${np.join(opts.sourceDir, nodes[i]._path)}'` +
                    ` and '${np.join(opts.sourceDir, nodes[j]._path)}'` +
                    ` map to same output file`
                )
            }
        }
    }

    return nodes
}
