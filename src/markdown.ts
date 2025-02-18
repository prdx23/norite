

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
import { VFile } from 'vfile'



export type Processor = UnifiedProcessor<any, any, any, any, any>



export function createProcessor(): Processor {
    return unified()
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


function remarkParseFrontmatterYAML() {
    return function (_: unknown, file: VFile) {
        matter(file)
    }
}

declare module 'vfile' {
    interface DataMap {
        matter?: Record<string, any>
    }
}
