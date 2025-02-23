
import * as fs from 'node:fs/promises'
import * as np from 'node:path'
import * as ps from 'node:process'

import { MarkdownEngine } from './markdown'
import { TemplateEngine } from './template'



type ContentNodeType = 'page' | 'asset'

export class ContentNode {

    type: ContentNodeType
    slug: string
    path: string
    _contentDir: string
    _outputPath: string

    content: string = ''

    constructor(
        type: ContentNodeType, path: string,
        contentDir: string, outputDir: string,
    ) {
        this.type = type
        this.path = path
        this._contentDir = contentDir
        this._outputPath = np.join(outputDir, path)
        this.slug = np.join('/', path)

        if (type == 'page') {

            const filename = `${np.basename(path, np.extname(path))}.html`
            this._outputPath = np.join(outputDir, np.dirname(path), filename)

            if (filename == 'index.html') {
                this.slug = np.join('/', np.dirname(path))
            } else {
                this.slug = np.join('/', np.dirname(path), filename)
            }
        }

    }


    async transform(mdEngine: MarkdownEngine, templateEngine: TemplateEngine) {

        if (this.type == 'asset') { return }

        const text = await fs.readFile(
            np.join(this._contentDir, this.path), {encoding: 'utf8'}
        )

        let parsed = ''
        let frontmatter = {}

        if (np.basename(this.path) == 'index.json') {
            frontmatter = {
                template: '',
                ...JSON.parse(text)
            }
        }

        if (np.extname(this.path) == '.md') {
            const result = await mdEngine.parse(text)
            parsed = result.content
            frontmatter = {
                template: '',
                ...result.frontmatter
            }
        }

        this.content = templateEngine.render('Test', {
            content: parsed, frontmatter, slug: this.slug
        })

    }


    async build(opts: { link: boolean }) {

        const parent = np.dirname(this._outputPath)
        await fs.access(parent).catch(async () => {
            await fs.mkdir(parent, { recursive: true })
        })

        if (this.type == 'asset') {
            if (opts.link) {
                await fs.symlink(
                    np.join(ps.cwd(), this._contentDir, this.path),
                    this._outputPath
                )
            } else {
                await fs.cp(
                    np.join(this._contentDir, this.path),
                    this._outputPath
                )
            }
        }

        if (this.type == 'page') {
            await fs.writeFile(this._outputPath, this.content)
        }

    }

}



function detectNodeType(path: string): ContentNodeType {
    const name = np.basename(path)
    if (name == 'index.json' || np.extname(name) == '.md') {
        return 'page'
    }
    return 'asset'
}

export async function loadContentTree(
    contentDir: string, outputDir: string,
): Promise<ContentNode[]> {

    const paths = ['']
    const nodes: ContentNode[] = []

    await fs.access(contentDir).catch(() => {
        throw new Error(`'${contentDir}' not found`)
    })

    while (paths.length > 0) {

        const route = paths.pop()!
        const path = np.join(contentDir, route)
        const lstat = await fs.lstat(path)

        if (lstat.isDirectory()) {
            const dir = await fs.opendir(path)
            for await (const file of dir) {
                paths.push(np.join(route, file.name))
            }
            continue
        }

        if (lstat.isFile() && detectNodeType(path) == 'page') {
            nodes.push(new ContentNode('page', route, contentDir, outputDir))
            continue
        }

        nodes.push(new ContentNode('asset', route, contentDir, outputDir))

    }

    for (let i = 0; i <= nodes.length - 2; i++) {
        for (let j = i + 1; j <= nodes.length - 1; j++) {
            if (nodes[i].slug == nodes[j].slug) {
                throw new Error(
                    `both '${np.join(contentDir, nodes[i].path)}'` +
                    ` and '${np.join(contentDir, nodes[j].path)}'` +
                    ` map to same output file`
                )
            }
        }
    }

    return nodes
}
