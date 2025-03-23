



export type Config = {

    contentDir: string,
    templatesDir: string,
    outputDir: string,
    cacheDir: string,

}


export const defaultConfig: Config = {

    contentDir: 'src/content',
    templatesDir: 'src/templates',
    outputDir: '.norite/output',
    cacheDir: '.norite',

}
