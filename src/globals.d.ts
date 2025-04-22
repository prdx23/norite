
declare module 'bundle:*.ts' {
    const path: string;
    export default path;
}

declare module 'bundle:*.js' {
    const path: string;
    export default path;
}

declare module 'bundle:*.css' {
    const path: string;
    export default path;
}


declare module 'norite' {
    import { type ComponentChildren } from 'preact'
    import { h, VNode, ClassAttributes } from 'preact'

    type Context = {
        content: string,
        frontmatter: any,
        slug: string,
        globals: {
            [k: string]: any,
        },
        nodes: {
            type: 'page' | 'asset',
            slug: string,
            content: string,
            frontmatter: any,
            html: string,
            _path: string
            _sourcePath: string
            _outputPath: string
        }[]
    }

    type Component<P = {}> = (
        props: P & { children?: ComponentChildren }
    ) => ComponentChildren


    type Template = (props: Context) => ComponentChildren


    // export function Render(props: {tag: string, html: string}) {
    //     return h(
    //         props.tag,
    //         { dangerouslySetInnerHTML: { __html: props.html } },
    //     )
    // }

    export function Render(props: {
        tag: string;
        html: string;
    }): VNode<(
        ClassAttributes<HTMLElement> & h.JSX.HTMLAttributes<EventTarget> &
        h.JSX.SVGAttributes<SVGElement>
    ) | null>;

    // export { Render }

    export type {
        Component, ComponentChildren, Context, Template,
        ComponentChildren as JSXElement,
    }
}
