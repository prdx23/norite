#!/usr/bin/env node


import { Engine } from './engine'

async function main() {

    const engine = await Engine.new()

    console.time('transform: ')
    await engine.transform()
    console.timeEnd('transform: ')

    console.time('build: ')
    await engine.build()
    console.timeEnd('build: ')
}


main()
