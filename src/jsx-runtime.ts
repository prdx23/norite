
import { Fragment, jsx, jsxs } from 'preact/jsx-runtime'
import type { JSX as PJSX } from 'preact/jsx-runtime'

export {
    jsx as h,
    jsx,
    jsxs,
    jsx as jsxDEV,
    Fragment,
}

// declare global {
//     namespace JSX {
//         type ElementClass = PJSX.ElementClass
//         type Element = PJSX.Element
//         type IntrinsicElements = PJSX.IntrinsicElements
//     }
// }

export type { PJSX as JSX }

