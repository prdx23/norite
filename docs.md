# Table of Contents
- [Quick Start](#quick-start)
- [Directory Structure](#directory-structure)
- [Content](#content)
- [Templates](#templates)
- [Config](#config)
- [Advanced Features](#advanced-features)

# Quick Start

1. Install norite and create an empty config file:
```sh
npm install --save-dev norite
echo 'export default {}' > norite.config.js
```

2. Create the project structure:
```
project root
├── norite.config.js
└── src/
    ├── content/
    │   └── index.md
    └── templates/
        └── Home.tsx
```

3. Add content to `src/content/index.md`:
```markdown
---
template: 'Home'
title: 'Hello!'
---
# A Heading
Hello, world!
```

4. Create a template function in `src/templates/Home.tsx`:
```tsx
import { Template, Render } from 'norite'

const Home: Template = (context) => {
    return <html>
        <head>
            <title>${context.frontmatter.title}</title>
        </head>
        <body>
            <header> ${context.frontmatter.title} </header>
            <Render tag='main' html={context.content} />
        </body>
    </html>
}
export default Home
```

5. Run the development server and open `http://localhost:2323` to see your website:
```sh
npx norite dev
```

6. Build the website for production. The static files generated can be deployed with a simple server like nginx or caddy, or by using a hosting provider like Github Pages, Cloudflare, Netlify etc.
```sh
npx norite build
```


# Directory Structure

Norite uses two directories - one for [content](#content) (default: `src/content`) and one for [templates](#templates) (default: `src/templates`). There are no rules for how files inside these directories should be placed and they can be in any structure. Layout and URLs of the generated website map directly to the layout of the content directory. The project folder for an example website might look like this:

```
project root
├── norite.config.js
├── postcss.config.js
└── src
    ├── content
    │   ├── favicon.ico
    │   ├── index.json                  --> example.com
    │   ├── robots.txt
    │   ├── [rss.xml].json              --> example.com/rss.xml
    │   ├── [sitemap.xml].json          --> example.com/sitemap.xml
    │   ├── about
    │   │   └── index.md                --> example.com/about
    │   ├── articles
    │   │   ├── article1
    │   │   │   ├── index.md            --> example.com/articles/article1
    │   │   │   ├── image.png
    │   │   │   └── styles.css
    │   │   ├── article2
    │   │   │   ├── index.md            --> example.com/articles/article2
    │   │   │   └── custom_script.js
    │   │   └── index.md                --> example.com/articles
    │   └── projects
    │       └── index.json              --> example.com/projects
    └── templates
        ├── components
        │   └── Navbar.tsx
        ├── css
        │   ├── global.css
        │   ├── fonts.css
        │   └── theme.css
        ├── layouts
        │   ├── BaseLayout.tsx
        │   └── PageLayout.tsx
        ├── pages
        │   ├── About.tsx
        │   ├── ArticleList.tsx
        │   ├── ArticlePage.tsx
        │   ├── Home.tsx
        │   ├── ProjectList.tsx
        │   ├── Rss.tsx
        │   └── Sitemap.tsx
        └── utils.ts
```


# Content

All files inside the content directory that are not one of the content types described below are treated as assets. They would be directly copied to the generated website without any modifications and maintain their original directory structure. Norite has the following content types:

## Markdown

All markdown (`.md`) files in the content directory are parsed and converted to HTML. HTML files will have the same name as the markdown files, eg. `src/content/articles/title.md` would generate `dist/articles/title.html` and `src/content/projects/index.md` would generate `dist/projects/index.html`.

Markdown files should contain a frontmatter section at the top with a required key `template`. Frontmatter is written in YAML. The `template` key should be the path to a Javascript/JSX file in the template directory that would be used as the [template](#templates) for this file. The path is relative to the template directory and does not include the file extension. For example, the file `src/templates/layouts/Home.tsx` can be set as the template by specifying `layouts/Home`:

```markdown
---
template: 'layouts/Home'
title: 'Some Heading'
custom_key: 'custom value'
---

# Some Heading

Some text.

```

Other than the required `template` key, frontmatter can contain any other arbitrary keys which would be passed directly to the template.

Norite uses the remark/rehype ecosystem from [unified.js](https://unifiedjs.com/) to parse and render markdown. It includes some plugins by default - [smartypants](https://github.com/silvenon/remark-smartypants), [github flavored markdown](https://github.com/remarkjs/remark-gfm) and [syntax highlighting](https://github.com/wooorm/refractor) with [prismjs](https://prismjs.com/). Refer to the markdown section of the [config](#config) to see how to toggle these and to add custom remark or rehype plugins.

## index.json

All files named `index.json` in the content directory are also converted to HTML and output as `index.html`. It should contain a required key `template` containing the path to a template file similar to markdown. All other keys in the JSON would be passed directly to the template as frontmatter. This exists as a convenient alternative to a "frontmatter-only" `.md` file or for those pages of the website that only need data to render and don't need to process any markdown.

Example:
```json
{
    "template": "pages/Projects",
    "title": "Projects",
    "desc": "Projects I have worked on:",
    "projects": [
        {"name": "project 1", "url": "github.com/abcd/p1"},
        {"name": "project 2", "url": "example.com/p2"},
        {"name": "project 3", "url": "github.com/abcd/p3"}
    ]
}
```

## Custom Files

Any files in the content directory with their filename in this format - `[filename.ext].json`, are also treated as content. They function exactly the same as `index.json` above, except they will output a file with the filename given between the square brackets. These can be used to create non-HTML files (eg. `[rss.xml].json`, `[sitemap.xml].json`) or can also create HTML files that are not `index.html` (eg. `[about.html].json`).


# Templates

Templates are Javascript functions that define how norite renders content into HTML. Any Javascript or JSX file that returns a function as it's default export is considered a valid template. The function would be called once for each [content](#content) file that specifies it as it's template, and should return either a string or JSX. As it executes at build time it can use any custom logic to generate HTML, use npm libraries, fetch data from databases/CMS/APIs, and use Node built-in modules like `node:fs`, `node:path`, `node:crypto` etc. Each time the function is called it is provided with a [context](#context-object) object as the first argument, which contains all the relevant details, rendered markdown and frontmatter for that specific content file. When working in Typescript, norite also provides two types `Component` and `Template`.

An simple string template might look like this:
```js
function example(context) {
    return `<html>
        <head>
            <meta charset="utf-8" />
            <meta name="viewport" content="width=device-width, initial-scale=1.0" />
            <title>${context.frontmatter.title}</title>
        </head>
        <body>
            <header> ${context.frontmatter.title} </header>
            <main> ${context.content} </main>
            <footer> updated on: ${context.frontmatter.date} </footer>
        </body>
    </html>`
}
export default example
```

In a typical website, templates can be composed using components and JSX:
```tsx
// src/templates/layouts/BaseLayout.tsx

import { Component } from 'norite'

type BaseProps = {
    title?: string,
    class?: string,
}
export const BaseLayout: Component<BaseProps> = (props) => {

    let title = props.title ?? 'example.com'

    return <html lang="en">
        <head>
            <meta charset="utf-8" />
            <meta name="viewport" content="width=device-width, initial-scale=1.0" />
            <title>{title}</title>
            <meta name="title" content={title} />
        </head>
        <body class={props.class}>
            {props.children}
        </body>
    </html>
}
```

```tsx
// src/templates/pages/Home.tsx

import { Template, Render } from 'norite'
import { BaseLayout } from '../layouts/BaseLayout'

const Home: Template = (context) => {
    return <BaseLayout title={context.frontmatter.title}>
        <header>{context.frontmatter.title}</header>
        <main>
            <Render tag='div' html={context.content} />
        </main>
        <footer>updated on: {context.frontmatter.date}</footer>
    </BaseLayout>
}
export default Home
```

Note: norite works with both JSX and TSX, Typescript is optional.

The only difference between components and templates is that components receive "props" as their first parameter such that they can be used by other components or templates, and templates receive a [context](#context-object) object as the first parameter and are the final step that return a string or JSX to be rendered into HTML.

Norite's JSX runtime currently uses [preact](https://preactjs.com/) under the hood which will escape all html tags by default. This can be bypassed by using preact's `dangerouslySetInnerHTML` but since this code only runs at build time inside a template, norite provides a convenient custom tag to do the same thing - `<Render />`. The `<Render />` tag has two attributes: `tag` (name of the tag to use as the container) and `html` (string containing html) and can be used like this:

```tsx
<Render tag='div' html={context.content} />
```

## JSX

Logic can be added inside JSX using Javascript expressions, similar to any other framework using JSX. Norite's JSX runtime currently uses [preact](https://preactjs.com/) under the hood so any JSX considered valid by preact is also valid for norite. Here are some examples -

Conditionally rendering a tag:
```tsx
const Text: Component<{showHeading: boolean}> = (props) => {
    return <div>
        {props.showHeading && <h1>heading</h1>}
        <p>some text</p> 
    </div>
}
```


Looping through a list:
```tsx
export const Navbar: Component = () => {

    const links = [
        { href: '/articles', name: 'Articles' },
        { href: '/projects', name: 'Projects' },
        { href: '/about', name: 'About' },
    ]

    return <nav role='navigation'>
        <ul> {links.map(link => {
            return <li> <a href={link.href}>{link.name}</a> </li>
        })}</ul>
    </nav>
}
```


Content or JSX defined inside a tag is passed into `props.children`:
```tsx
const Text: Component = (props) => {
    return <p class='custom-text'>{props.children}</p>
}

const Example: Component = () => {
    return <div>
        <Text> here is some text </Text>
    </div>
}
```


As an alternative to named `<slot>` tags, multiple JSX elements can be passed in as props and used as needed:
```tsx
import { Component, JSXElement } from 'norite'

type Props = {
    nav: JSXElement,
    content: JSXElement,
}
const Layout: Component<Props> = (props) => {
    return <main>
        <header>{props.nav}</header>
        <section>{props.content}</section>
    </main>
}

const Example: Component = () => {
    const nav = <nav>
        <a href='/'>home</a>
    </nav>

    const content = <div> Hello world! </div>

    return <Layout nav={nav} content={content} />
}
```


## Context Object

When the function in a template file is executed at build time to render a template, it is given a `Context` object as the first and only parameter. The `Context` object provides data and metadata for rendering a content file including its HTML content and frontmatter. The `Context` object has the following keys:

```ts
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
    }[]
}
```

### key: **content**
This contains the generated HTML string for the file's markdown content. It can be used directly if the function returns a string, or can be included in JSX using the `<Render />` tag, which allows un-escaped HTML:
```tsx
import { Template, Render } from 'norite'

// string
const Example: Template = (context) => {
    return `<section>
       <div>${context.content}</div> 
    </section>`
}

// JSX
const Example: Template = (context) => {
    return <section>
        <Render tag='div' html={context.content} />
    </section>
}
```

If the content file is JSON, `content` would be an empty string.

### key: **frontmatter**
This contains the frontmatter data from the top of the markdown file, or if the content file is JSON it would contain all keys of that JSON file.

### key: **slug**
The final URL this file would have, relative to the root, eg. `/about` or `/projects/project1.html`.

### key: **globals**
This contains the object assigned to the `globals` key in the [config](#config) file. It is the same for all content files.

### key: **nodes**
This is a list of all files that norite is going to process to generate the website, along with their details. This is useful in cases where you might want the list of assets in a folder to include in this template, access content or frontmatter of other content pages (eg. linking to other articles at the bottom of an article, or making a list of articles), for generating navigation elements and pages, generating files like `rss.xml` and `sitemap.xml` etc.

Example: generating a list of articles -
```tsx
import { compareAsc, format } from 'date-fns'
import { Component, Render } from 'norite'

export const ArticleList: Component = (ctx) => {

    const articles = ctx.nodes
        .filter(x => x.type == 'page')
        .filter(x => x.slug.startsWith('/articles/'))
        .sort((x , y) => compareAsc(x.frontmatter.date, y.frontmatter.date))
        .reverse()

    return  <ul class='articles-ul' role='list'>
        {articles.map(article => {
            return <li>
                <span>
                    {format(article.frontmatter.date, 'MMM y')}
                </span>
                <a href={`${article.slug}`}>
                    {article.frontmatter.title}
                </a>
            </li>
        })}
    </ul>
}
```


## Custom Imports

Norite has support for three custom import prefixes that handle files in different ways: `bundle:`, `url:` and `raw:`. Paths are relative to the file importing them. Any output files emitted by these imports are placed in a directory called `bundle` in the built website.

### bundle:

Works for `.css`, `.js` and `.ts` files. The file is processed, bundled and placed in the `bundle` directory. The import returns a string containing the URL path of the generated bundle:

```tsx
import { Component } from 'norite'
import cssPath from 'bundle:../css/global.css'
import scriptPath from 'bundle:../js/main.ts'

export const Example: Component = () => {
    return <html>
        <head>
            {/* ... other tags */}
            <link rel='stylesheet' href={cssPath} />
        </head>
        <body>
            {/* ... other tags */}
            <script src={scriptPath}></script>
        </body>
    </html>
}
```

For `.css` files, all other css files imported by that file along with assets like fonts or images referenced in them would all be bundled automatically. CSS would also be pre-processed by PostCSS and can include things like nested CSS or tailwind syntax if the relevant PostCSS plugins are installed. For `.js` and `.ts` files, all imports inside those files, including npm libraries, would also be automatically bundled and Typescript would be transpiled to Javascript. These `.js` and `.ts` files are only bundled and included in the built website, and are not executed at build time when the template is rendered unlike other normal imports.

### url:

Works for any file type. The file is copied to the `bundle` directory with a content-hashed filename, and the import returns a string containing its URL path. Unlike `bundle:`, the file is copied as-is with no processing or bundling — useful for pre-built scripts from other repos, static assets that you want hashed for cache-busting, or any file that should be served as-is but with a stable hashed URL:

```tsx
import prebuiltScript from 'url:../../other-repo/dist/widget.js'
import logo from 'url:../assets/logo.svg'

export const Example: Component = () => {
    return <html>
        <body>
            <img src={logo} alt='logo' />
            <script src={prebuiltScript}></script>
        </body>
    </html>
}
```

### raw:

Works for any text file. Reads the file's contents at build time and returns it as a string. Nothing is emitted to the output directory. Useful for inlining SVGs into JSX, embedding shader source, dropping license/legal text into a page, etc:

```tsx
import { Render } from 'norite'
import iconSvg from 'raw:../assets/icon.svg'
import license from 'raw:../../LICENSE.txt'

export const Example: Component = () => {
    return <html>
        <body>
            <Render tag='span' html={iconSvg} />
            <footer>{license}</footer>
        </body>
    </html>
}
```

Since templates can use Node built-in modules directly, `raw:` is largely sugar over `fs.readFileSync` but it resolves paths relative to the importing file like a normal import.


# Config

The config for norite is specified in a file called `norite.config.js` placed at the root of the project directory. This file can be left empty, but it should exist, as norite uses this file to determine the project's root directory. Config includes the following keys:

```ts
type Config = {

    globals: {
        [k: string]: any,
    },

    contentDir: string,
    
    templatesDir: string,
    
    outputDir: string,

    markdown: {
        enableSmartypants: boolean,
        enableGfm: boolean,
        enableSyntaxHighlighting: boolean,
        
        remarkPlugins: any[],
        rehypePlugins: any[],
    },

    enablePostCSS: boolean,

    server: {
        host: string,
        port: number,
    },
}
```

## globals
default: `{}`

This object can contain any data, which will be included as part of the `globals` key of the [context](#context-object) object sent to every template. This is useful to store data needed by many templates like eg. URL origin (example.com), website title, author name, etc.

## contentDir
default: `src/content`

Path of directory containing all [content](#content). Path is relative to project root.

## templateDir
default: `src/templates`

Path of directory containing all [templates](#templates). Path is relative to project root.


## outputDir
default: `dist`

Path of directory where final generated website would be saved. Path is relative to project root.


## markdown
default:
```js
{
    enableSmartypants: true,
    enableGfm: true,
    enableSyntaxHighlighting: true,
    remarkPlugins: [],
    rehypePlugins: [],
}
```

Config for markdown. The three plugins included by default in norite can be toggled ([smartypants](https://github.com/silvenon/remark-smartypants), [gfm](https://github.com/remarkjs/remark-gfm) & [syntax highlighting](https://github.com/wooorm/refractor)) and custom [remark plugins](https://github.com/remarkjs/remark/blob/main/doc/plugins.md) or [rehype plugins](https://github.com/rehypejs/rehype/blob/main/doc/plugins.md) can be added.

Plugins can be included either directly:
```js
import Plugin1 from 'remark-plugin1'
import Plugin2 from 'remark-plugin1'

// in config -
remarkPlugins: [ Plugin1, Plugin2 ],
```

Or can be lists containing the plugin and its options:
```js
remarkPlugins: [ Plugin1, [Plugin2, {opts1: true, opts2: false}] ],
```

## enablePostCSS
default: `true`

Toggle the PostCSS integration. If enabled, it will look for a `postcss.config.js` file in your project root and pre-process all CSS files according to that PostCSS config.

## server
default:
```js
{
    host: 'localhost',
    port: 2323,
}
```

Config for the development server when the `norite dev` CLI command is used. The server will watch the [content](#contentdir) and [template](#templatedir) directories and automatically reload on changes. Host can be set to `0.0.0.0` to allow access to other devices on the same network.


## Example Config

The config object is returned as the default export from `norite.config.js` file. Here's how a config might look:

```js
import remarkMath from 'remark-math'
import rehypeKatex from 'rehype-katex'

export default {

    globals: {
        origin: 'https://example.com',
        title: 'Website Title',
    },

    markdown: {
        remarkPlugins: [ remarkMath ],
        rehypePlugins: [ [rehypeKatex, {fleqn: true}] ],
    },

    contentDir: 'src/content',
    templatesDir: 'src/templates',
    outputDir: 'dist',
}
```



# Advanced Features

Norite is written to be simple, flexible and lightweight, which means it intentionally excludes many advanced features present in other static website generators such as image optimizations, i18n, SEO management, integration with CMS or APIs etc.. Norite's main intention is to provide core building blocks around templates written as normal Javascript functions.

This means most of these advanced features can be implemented directly in Javascript using general npm libraries, for example:
- Using [sharp](https://sharp.pixelplumbing.com/) for image optimization.
- Fetching data from CMS and APIs directly.
- Writing a custom component to generate SEO meta tags using frontmatter and the data from [globals](#globals) key in config.
- Implementing a tag system by including tags in frontmatter and using a normal js `.filter()` function to filter the list of pages provided in [context](#context-object).
- Installing any template engine like [handlebars](https://github.com/handlebars-lang/handlebars.js), [mustache](https://github.com/janl/mustache.js/) etc. and using it to generate the strings that norite templates return.
- Even markdown is optional as content can consist purely of JSON files with relevant metadata to render templates and assets.

Similarly, norite doesn't have the concept of plugins, as norite can use normal Javascript functions or libraries to provide the same functionality.

Basically norite trades off convenience and speed (if no existing npm library implements your feature) for simplicity, having almost no limitations on what you can do with your website and not needing to learn custom template syntax or special framework specific processes to be able to use these features.

