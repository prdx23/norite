#!/usr/bin/env node

import * as np from 'node:path'

import { MarkdownEngine } from './markdown'
import { TemplateEngine } from './template'
import { Engine } from './engine'
import { loadConfig } from './config'

import colors from 'yoctocolors'
import chokidar from 'chokidar'


async function build(engine: Engine) {
    console.time('build')
    await engine.parseTemplates()
    await engine.loadNodes()
    await engine.transform()
    await engine.build({
        outputDir: engine.config.outputDir,
        link: false,
    })
    console.timeEnd('build')
    console.log()
    engine.dispose()
}


async function dev(engine: Engine) {

    type RunType = 'all' | 'content' | 'transform'
    async function run(type: RunType) {
        console.time('build')
        if (type == 'all') {
            await engine.parseTemplates()
            await engine.loadNodes()
        } else if (type == 'content') {
            await engine.loadNodes()
        }
        await engine.transform()
        await engine.build({
            outputDir: np.join(engine.config.internal.cacheDir, 'output'),
            link: true,
        })
        console.timeEnd('build')
        console.log()
    }
    await run('all')


    const queue: RunType[] = []
    let isProcessing = false;
    async function processQueue(type: RunType, event: string, path: string) {
        console.log(`${colors.cyan(event)}: ${path}`)
        queue.push(type)
        if (isProcessing) { return }

        isProcessing = true
        while (queue.length > 0) { await run(queue.shift()!) }
        isProcessing = false
    }

    const contentWatcher = chokidar.watch(engine.config.contentDir, {
        persistent: true,
        ignoreInitial: true,
    })
    contentWatcher.on('add', async (path) => {
        processQueue('content', 'add', path)
    })
    contentWatcher.on('change', async (path) => {
        processQueue('transform', 'change', path)
    })
    contentWatcher.on('unlink', async (path) => {
        processQueue('content', 'remove', path)
    })

    const templatesWatcher = chokidar.watch(engine.config.templatesDir, {
        persistent: true,
        ignoreInitial: true,
    })
    templatesWatcher.on('add', async (path) => {
        processQueue('all', 'add', path)
    })
    templatesWatcher.on('change', async (path) => {
        processQueue('all', 'change', path)
    })
    templatesWatcher.on('unlink', async (path) => {
        processQueue('all', 'remove', path)
    })

}



async function main() {

    const config = await loadConfig()
    let engine: Engine

    try {
        engine = new Engine(
            [],
            config,
            new MarkdownEngine(),
            await TemplateEngine.new({
                sourceDir: config.templatesDir,
                cacheDir: np.join(config.internal.cacheDir, 'templates'),
            }),
        )
    } catch(err: any) {
        console.error(colors.red(err))
        console.error(err.stack)
        return
    }

    const command = process.argv[2]
    try {
        if (command == 'dev') {
            await dev(engine)
        } else if (command == 'build') {
            await build(engine)
        } else {
            console.log(helpText)
            engine.dispose()
        }
    } catch(err: any) {
        console.error(colors.red(err))
        console.error(err.stack)
    }

    process.on('SIGINT', () => {
        console.log('\nExiting...')
        engine.dispose()
        process.exit(0)
    })

}


main()


const helpText = `
Usage: norite [command] [options]

Commands:
    dev          - Start dev server
    build        - Build the website

Options:
    --help       - Show this help
    --host       - Set host (default: localhost)
    --port       - Set port (default: 2323)
    --contentDir - Set content directory (default: src/content)
    --templateDir- Set template directory (default: src/templates)
    --outputDir  - Set output directory (default: dist)
`
