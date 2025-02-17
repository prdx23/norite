#!/usr/bin/env node

import * as fs from 'node:fs/promises'


import { loadContentTree } from "./content"
import { config } from './config'

async function main() {

    const root = await loadContentTree(config.contentDir, '')
    root.printTree()

    try {
        await fs.access(config.outputDir)
        await fs.rm(config.outputDir, { recursive: true })
    } catch {

    }

    await fs.mkdir(config.outputDir, { recursive: true })
    await root.build(config)
}


main()
