#!/usr/bin/env node


import { Engine } from './engine'

async function main() {

    const engine = await Engine.new()

    await engine.build()
}


main()
