
import { h } from 'preact'


export function Render(props: {tag: string, html: string}) {
    return h(
        props.tag,
        { dangerouslySetInnerHTML: { __html: props.html } },
    )
}
