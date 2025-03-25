
import * as fs from 'fs/promises'
import * as np from 'node:path'

import colors from 'yoctocolors'


export type Config = {

    contentDir: string,
    templatesDir: string,
    outputDir: string,
    cacheDir: string,

}


const defaultConfig: Config = {

    contentDir: 'src/content',
    templatesDir: 'src/templates',
    outputDir: '.norite/output',
    cacheDir: '.norite',

}



export async function loadConfig() {

    await fs.access(np.resolve('./norite.config.js')).catch(() => {
        throw new Error(
            colors.red('norite.config.js not found.\n') +
                colors.yellow(`run 'npx norite init' or create a blank `) +
                colors.yellow(`in project root to use defaults\n`)
        )
    })

    return defaultConfig
}
