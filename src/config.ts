
import * as fs from 'fs/promises'
import * as np from 'node:path'
import Module from 'node:module'

import colors from 'yoctocolors'


export type Config = {

    origin: string,

    contentDir: string,
    templatesDir: string,
    outputDir: string,

    server: {
        host: string,
        port: number,
    },

    internal: {
        cacheDir: string,
    },

}


const defaultConfig: Config = {

    origin: '',

    contentDir: 'src/content',
    templatesDir: 'src/templates',
    outputDir: 'dist',

    server: {
        host: 'localhost',
        port: 2323,
    },

    internal: {
        cacheDir: '.norite',
    }

}



export async function loadConfig() {

    await fs.access(np.resolve('./norite.config.js')).catch(() => {
        throw new Error(
            colors.red('norite.config.js not found.\n') +
                colors.yellow(`run 'npx norite init' or create a blank `) +
                colors.yellow(`in project root to use defaults\n`)
        )
    })

    const require = Module.createRequire(np.resolve('.'))
    const configModule = require(np.resolve('./norite.config.js'))

    const config = Object.assign(
        defaultConfig,
        configModule.default ?? {},
    )

    const args = process.argv.slice(3)
    const flags = Object.fromEntries(args
        .map((arg, i) => {
            if (args[i + 1] && !args[i + 1].startsWith('--')) {
                return `${arg}=${args[i + 1]}`
            }
            return arg
        })
        .filter(arg => arg.startsWith('--'))
        .map(arg => arg.slice(2).split('='))
    )

    function test(key: string) {
        return flags[key] ? { [key]: flags[key] } : {}
    }

    Object.assign(
        config,
        test('contentDir'),
        test('templateDir'),
        test('outputDir'),
    )

    Object.assign(
        config.server,
        test('host'),
        test('port'),
    )

    return config
}
