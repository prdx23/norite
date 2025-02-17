

import * as fs from 'node:fs/promises'

import { Config, defaultConfig } from './config';
import { ContentNode, loadContentTree } from './content';



export class Engine {

    config: Config
    root: ContentNode

    constructor(root: ContentNode, config: Config) {
        this.root = root
        this.config = config
    }

    static async new(config: Config = defaultConfig) {
        const root = await loadContentTree(config.contentDir, '')
        root.printTree()
        return new Engine(root, config)
    }

    async build() {
        try {
            await fs.access(this.config.outputDir)
            await fs.rm(this.config.outputDir, { recursive: true })
        } catch {

        }

        await fs.mkdir(this.config.outputDir, { recursive: true })
        await this.root.build(this.config)
    }



}
