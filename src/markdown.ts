

import { unified, type Processor as UnifiedProcessor } from 'unified'

import remarkParse from 'remark-parse'
import remarkRehype from 'remark-rehype'
import rehypeStringify from 'rehype-stringify'
import remarkFrontmatter from 'remark-frontmatter'
import rehypeFormat from 'rehype-format'
import rehypeRaw from 'rehype-raw'
import remarkGfm from 'remark-gfm'
import remarkSmartypants from 'remark-smartypants'

import { matter } from 'vfile-matter'
import { reporter } from 'vfile-reporter'
import { VFile } from 'vfile'



export class MarkdownEngine {

    processor: UnifiedProcessor<any, any, any, any, any>

    constructor() {
        const remarkParseFrontmatterYAML = () => {
            return function (_: unknown, file: VFile) {
                matter(file)
            }
        }
        this.processor = unified()
            .use(remarkParse)
            .use(remarkFrontmatter)
            .use(remarkSmartypants)
            .use(remarkGfm)
            .use(remarkParseFrontmatterYAML)
            .use(remarkRehype, {allowDangerousHtml: true})
            .use(rehypeRaw)
            .use(rehypeFormat, { indent: 4 })
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
