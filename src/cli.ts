#!/usr/bin/env node


import { Engine } from './engine'

async function main() {

    const engine = await Engine.new()

    console.time('parse templates')
    await engine.parseTemplates()
    console.timeEnd('parse templates')

    console.time('transform')
    await engine.transform()
    console.timeEnd('transform')

    console.time('build')
    await engine.build()
    console.timeEnd('build')

    engine.dispose()
}


main()
