#!/usr/bin/env node


import { Engine } from './engine'
import { loadConfig } from './config'

import colors from 'yoctocolors'



const helpText = `
Usage: norite [command] [options]

Commands:
    dev           - Start dev server
    build         - Build the website

Options:
    --help        - Show this help
    --host        - Set host (default: localhost)
    --port        - Set port (default: 2323)
    --contentDir  - Set content directory (default: src/content)
    --templateDir - Set template directory (default: src/templates)
    --outputDir   - Set output directory (default: dist)
`


async function main() {

    const command = process.argv[2]

    if (command != 'dev' && command != 'build') {
        console.log(helpText)
        return
    }

    try {

        const mode = command == 'build' ? 'build' : 'dev'
        const config = await loadConfig()
        const engine = await Engine.new(config, mode)

        if (command == 'dev') { await engine.dev() }
        if (command == 'build') { await engine.build() }

    } catch(err: any) {
        console.error(colors.red(err))
        console.error(err.stack)
    }

}

main()
