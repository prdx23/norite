#!/usr/bin/env node

import { loadContentTree } from "./content"
import { config } from './config'

async function main() {

    const root = await loadContentTree(config.contentDir, '')
    root.printTree()
}


main()
