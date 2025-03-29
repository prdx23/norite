

import { unified, type Processor as UnifiedProcessor } from 'unified'
import { visit } from 'unist-util-visit'
import { reporter } from 'vfile-reporter'
import { VFile } from 'vfile'
import { type Root as MdRoot } from 'mdast'
import { type Root as HRoot } from 'hast'
import { h } from 'hastscript'
import yaml from 'yaml'

import remarkParse from 'remark-parse'
import remarkRehype from 'remark-rehype'
import rehypeStringify from 'rehype-stringify'
import remarkFrontmatter from 'remark-frontmatter'
import rehypeFormat from 'rehype-format'
import rehypeRaw from 'rehype-raw'
import remarkGfm from 'remark-gfm'
import remarkSmartypants from 'remark-smartypants'
import remarkPrism from 'remark-prism'
import rehypeParse from 'rehype-parse'

import { MarkdownOpts } from './config'




export class MarkdownProcessor {

    processor: UnifiedProcessor<any, any, any, any, any>

    constructor(opts: MarkdownOpts) {
        const remarkParseFrontmatterYAML = () => {
            return function (tree: MdRoot, file: VFile) {
                visit(tree, 'yaml', (node) => {
                    file.data.matter = yaml.parse(node.value)
                })
            }
        }
        this.processor = unified()
            .use(remarkParse)
            .use(remarkFrontmatter)
            .use(remarkParseFrontmatterYAML)

        if (opts.enableSmartypants) {
            this.processor.use(remarkSmartypants)
        }

        if (opts.enableGfm) {
            this.processor.use(remarkGfm)
        }

        if (opts.enableSyntaxHighlighting) {
            this.processor.use(remarkPrism)
        }

        for (const plugin of opts.remarkPlugins) {
            if (plugin[0] && plugin[1]) {
                this.processor.use(plugin[0], plugin[1])
            } else {
                this.processor.use(plugin)
            }
        }

        this.processor
            .use(remarkRehype, { allowDangerousHtml: true })

        for (const plugin of opts.rehypePlugins) {
            if (plugin[0] && plugin[1]) {
                this.processor.use(plugin[0], plugin[1])
            } else {
                this.processor.use(plugin)
            }
        }

        this.processor
            .use(rehypeRaw)
            .use(rehypeStringify, { allowDangerousHtml: true })
    }

    async parse(text: string): Promise<{ content: string, frontmatter: any }> {
        const file = new VFile({ value: text })
        const result = await this.processor.process(file)

        const report = reporter(file, { silent: true })
        if (report) { console.error(report) }

        return { content: String(result), frontmatter: result.data.matter }
    }

}


declare module 'vfile' {
    interface DataMap {
        matter?: Record<string, any>
    }
}


export class HtmlProcessor {

    processor: UnifiedProcessor<any, any, any, any, any>
    static scriptName: string = 'norite-reload.js'

    constructor(mode: 'dev' | 'build') {

        const rehypeAddDoctype = () => {
            return function (tree: HRoot) {
                tree.children.unshift({ type: 'text', value: '\n' })
                tree.children.unshift({ type: 'doctype' })
            }
        }

        const rehypeInjectScript = (opts: { filename: string }) => {
            return function (tree: HRoot) {
                visit(tree, 'element', (node) => {
                    if (node.tagName === 'body') {
                        node.children.push(h('script', { src: opts.filename }))
                    }
                })
            }
        }

        this.processor = unified()
            .use(rehypeParse)
            .use(rehypeAddDoctype)

        if (mode == 'dev') {
            this.processor.use(
                rehypeInjectScript,
                { filename: `/${HtmlProcessor.scriptName}` }
            )
        }

        this.processor
            .use(rehypeFormat, { indent: 4 })
            .use(rehypeStringify)
    }

    async parse(text: string): Promise<string> {
        const file = new VFile({ value: text })
        const result = await this.processor.process(file)

        const report = reporter(file, { silent: true })
        if (report) { console.error(report) }

        return String(result)
    }

}
