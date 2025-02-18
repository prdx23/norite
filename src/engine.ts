

import * as fs from 'node:fs/promises'

import { type Config, defaultConfig } from './config';
import { type ContentNode, loadContentTree } from './content';
import { type Processor, createProcessor } from './markdown';



export class Engine {

    config: Config
    root: ContentNode
    processor: Processor

    constructor(root: ContentNode, config: Config, processor: Processor) {
        this.root = root
        this.config = config
        this.processor = processor
    }

    static async new(config: Config = defaultConfig) {
        const root = await loadContentTree(config.contentDir, '')
        // root.printTree()

        const processor = createProcessor()

        return new Engine(root, config, processor)
    }

    async build(opts: { link: boolean } = { link: true }) {
        try {
            await fs.access(this.config.outputDir)
            await fs.rm(this.config.outputDir, { recursive: true })
        } catch {

        }

        await fs.mkdir(this.config.outputDir, { recursive: true })
        await this.root.build(this.config, opts)
    }

    async transform() {
        await this.root.transform(this.processor, this.config)
    }

}
