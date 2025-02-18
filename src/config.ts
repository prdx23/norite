



export type Config = {

    contentDir: string,
    templatesDir: string,
    outputDir: string,

    _templatesCacheDir: string,
}


export const defaultConfig: Config = {

    contentDir: 'content',
    templatesDir: 'src',
    outputDir: '.norite/output',

    _templatesCacheDir: '.norite/_templates',
}
