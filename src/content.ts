
import * as fs from 'node:fs/promises'
import * as np from 'node:path'
import * as ps from 'node:process'
import { Config } from './config'



type ContentNodeType = 'page' | 'asset' | 'dir'

export class ContentNode {

    type: ContentNodeType
    path: string
    slug: string
    children: ContentNode[] = []

    static indexNames: string[] = ['index.json']
    static pageExts: string[] = ['.md']
    static isPage(name: string) {
        return (
            ContentNode.indexNames.includes(np.basename(name)) ||
            ContentNode.pageExts.includes(np.extname(name))
        )
    }


    constructor(path: string, type: ContentNodeType) {
        this.path = path
        this.type = type
        this.slug = path

        if (ContentNode.isPage(path)) {
            const filename = np.basename(path, np.extname(path))
            this.slug = np.join(np.dirname(path), `${filename}.html`)
        }

    }


    toString() {
        return `<${this.type} "${this.slug}">`
    }


    printTree(indent='') {
        console.log(`${indent}${this}`)
        this.children.forEach(x => x.printTree(indent + '    '))
    }


    async build(config: Config, opts: { link: boolean } = { link: true }) {

        if (this.type == 'dir') {
            const tasks = this.children.map(x => x.build(config, opts))
            await Promise.all(tasks)
            return
        }

        const parent = np.join(config.outputDir, np.dirname(this.path))
        await fs.access(parent).catch(async () => {
            await fs.mkdir(parent, { recursive: true })
        })

        if (this.type == 'asset') {
            if (opts.link) {
                await fs.symlink(
                    np.join(ps.cwd(), config.contentDir, this.path),
                    np.join(config.outputDir, this.path)
                )
            } else {
                await fs.cp(
                    np.join(config.contentDir, this.path),
                    np.join(config.outputDir, this.path)
                )
            }
        }

        if (this.type == 'page') {
            await fs.cp(
                np.join(config.contentDir, this.path),
                np.join(config.outputDir, this.path)
            )
        }

    }

}


export async function loadContentTree(fpath: string, route: string): Promise<ContentNode> {

    let lstat
    try {
        await fs.access(fpath)
        lstat = await fs.lstat(fpath)
    } catch(err) {
        throw new Error(`Error: no such file or directory: ${fpath}`)
    }

    if (lstat.isDirectory()) {

        const dir = await fs.opendir(fpath)
        const node = new ContentNode(route, 'dir')

        for await (const file of dir) {
            const cpath = np.join(fpath, file.name)
            const croute = np.join(route, file.name)
            node.children.push(await loadContentTree(cpath, croute))
        }

        return node
    }

    if (lstat.isFile() && ContentNode.isPage(fpath)) {
        return new ContentNode(route, 'page')
    }

    return new ContentNode(route, 'asset')

}
