
import * as fs from 'node:fs/promises'
import * as np from 'node:path'
// import { Config } from './config'



type NodeType = 'page' | 'asset' | 'dir'

class Node {

    type: NodeType
    path: string
    slug: string
    children: Node[] = []

    static indexNames: string[] = ['index.json', 'index.toml']
    static pageExts: string[] = ['.md']
    static isPage(name: string) {
        return (
            Node.indexNames.includes(np.basename(name)) ||
            Node.pageExts.includes(np.extname(name))
        )
    }


    constructor(path: string, type: NodeType) {
        this.path = path
        this.type = type
        this.slug = path

        if (Node.isPage(path)) {
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

}


export async function loadContentTree(fpath: string, route: string): Promise<Node> {

    let lstat

    try {
        await fs.access(fpath)
        lstat = await fs.lstat(fpath)
    } catch(err) {
        throw new Error(`Error: no such file or directory: ${fpath}`)
    }

    if (lstat.isDirectory()) {

        const dir = await fs.opendir(fpath)
        const node = new Node(route, 'dir')

        for await (const file of dir) {
            const cpath = np.join(fpath, file.name)
            const croute = np.join(route, file.name)
            node.children.push(await loadContentTree(cpath, croute))
        }

        return node
    }

    if (lstat.isFile() && Node.isPage(fpath)) {
        return new Node(route, 'page')
    }

    return new Node(route, 'asset')

}
