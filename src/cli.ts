#!/usr/bin/env node


import colors from 'yoctocolors'

import { Engine } from './engine'
import { defaultConfig } from './config'

async function main() {

    const config = defaultConfig
    let engine

    try {
        engine = await Engine.new(config)
    } catch(err: any) {
        console.error(colors.red(err))
        // console.error(err.stack)
        return
    }


    try {
        console.time('parse templates')
        await engine.parseTemplates()
        console.timeEnd('parse templates')

        console.time('transform')
        await engine.transform()
        console.timeEnd('transform')

        console.time('build')
        await engine.build()
        console.timeEnd('build')

    } catch(err: any) {
        console.error(colors.red(err))
        console.error(err.stack)
    } finally {
        engine.dispose()
    }

}


main()
