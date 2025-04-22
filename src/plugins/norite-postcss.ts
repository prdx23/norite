
import * as fs from 'node:fs/promises'
import * as esbuild from 'esbuild'
import postcss from 'postcss'
import postcssrc from 'postcss-load-config'


export function noritePostcss(): esbuild.Plugin {

    return {
        name: 'norite-postcss',
        async setup(build) {

            let postcssConfig: postcssrc.Result | false
            await postcssrc()
                .then(config => postcssConfig = config)
                .catch(err => {
                    if (
                        err instanceof Error &&
                        /No PostCSS Config found/i.test(err.message)
                    ) {
                        postcssConfig = false
                    } else {
                        throw err
                    }
                })

            build.onLoad({ filter: /.*\.css$/ }, async (args) => {

                if (!postcssConfig) { return { loader: 'css' } }

                const css = await fs.readFile(args.path, 'utf8')
                const result = await postcss(postcssConfig.plugins)
                    .process(css, {
                        ...postcssConfig.options,
                        from: args.path,
                        to: args.path,
                    })

                // const watchFiles = []
                // const watchDirs = []
                // for (const message of result.messages) {
                //     if (message.type === 'dependency') {
                //         watchFiles.push(message.file)
                //     } else if (message.type === 'dir-dependency') {
                //         const dir = message.dir
                //         if (message.glob) {
                //             watchDirs.push(np.join(dir, message.glob))
                //         } else {
                //             watchDirs.push(np.join(dir, '**', '*'))
                //         }
                //     }
                // }

                const warnings = result.warnings().map(warn => {
                    return {
                        text: warn.text,
                        location: warn.node?.source?.start ? {
                            file: args.path,
                            line: warn.node.source.start.line,
                            column: warn.node.source.start.column,
                        } : undefined
                    }
                })

                return {
                    contents: result.css,
                    loader: 'css',
                    warnings,
                    // watchFiles,
                    // watchDirs,
                }

            })

        }
    }
}
