#!/usr/bin/env node

import * as np from 'node:path'

import colors from 'yoctocolors'

import { MarkdownEngine } from './markdown'
import { TemplateEngine } from './template'
import { Engine } from './engine'
import { loadConfig } from './config'



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
                cacheDir: np.join(config.cacheDir, 'templates'),
            }),
        )
    } catch(err: any) {
        console.error(colors.red(err))
        // console.error(err.stack)
        return
    }


    try {

        console.time('parse templates')
        await engine.parseTemplates()
        console.timeEnd('parse templates')

        console.time('load nodes')
        await engine.loadNodes()
        console.timeEnd('load nodes')

        console.time('transform')
        await engine.transform()
        console.timeEnd('transform')

        console.time('build')
        await engine.build({
            outputDir: config.outputDir,
            link: true,
        })
        console.timeEnd('build')

    } catch(err: any) {
        console.error(colors.red(err))
        console.error(err.stack)
    } finally {
        engine.dispose()
    }

}


main()
