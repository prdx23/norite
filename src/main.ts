
import { ComponentChildren } from 'preact'
import { h } from 'preact'


type Component<P = {}> = (props: P & { children?: ComponentChildren }) => ComponentChildren

type Context = {
    content: string,
    frontmatter: any,
    meta: {
        origin: string,
        slug: string,
        // [k: string]: any,
    }
}

type Template = (props: Context) => ComponentChildren


export function Render(props: {tag: string, html: string}) {
    return h(
        props.tag,
        { dangerouslySetInnerHTML: { __html: props.html } },
    )
}

export type {
    Component, ComponentChildren, Context, Template
}
