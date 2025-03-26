

import { unified, type Processor as UnifiedProcessor } from 'unified'
import { visit } from 'unist-util-visit'
import { reporter } from 'vfile-reporter'
import { VFile } from 'vfile'
import { type Root } from 'mdast'
import yaml from 'yaml'

import remarkParse from 'remark-parse'
import remarkRehype from 'remark-rehype'
import rehypeStringify from 'rehype-stringify'
import remarkFrontmatter from 'remark-frontmatter'
import rehypeFormat from 'rehype-format'
import rehypeRaw from 'rehype-raw'
import remarkGfm from 'remark-gfm'
import remarkSmartypants from 'remark-smartypants'




export class MarkdownEngine {

    processor: UnifiedProcessor<any, any, any, any, any>

    constructor() {
        const remarkParseFrontmatterYAML = () => {
            return function (tree: Root, file: VFile) {
                visit(tree, 'yaml', (node) => {
                    file.data.matter = yaml.parse(node.value)
                })
            }
        }
        this.processor = unified()
            .use(remarkParse)
            .use(remarkFrontmatter)
            .use(remarkParseFrontmatterYAML)
            .use(remarkSmartypants)
            .use(remarkGfm)
            .use(remarkRehype, {allowDangerousHtml: true})
            .use(rehypeRaw)
            // .use(rehypeFormat, { indent: 4 })
            .use(rehypeStringify)
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
