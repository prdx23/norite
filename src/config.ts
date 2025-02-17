



export type Config = {

    contentDir: string,
    templatesDir: string,
    outputDir: string,

}


export const defaultConfig: Config = {

    contentDir: 'content',
    templatesDir: 'src/templates',
    outputDir: '.norite/output',

}
