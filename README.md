# Norite

Norite is an experimental static website builder. It transforms a directory of content and it's structure into a static website, using templates written in plain javascript or JSX.


### Features

- Website layout and URLs are generated directly from the structure of the content directory.
- All markdown (`.md`), `index.md` and `index.json` files are processed as content and generate HTML; all other files are treated as assets.
- Templates are written as plain Javascript/Typescript functions or JSX/TSX components with no special syntax. They execute at build time and can use any custom logic to generate HTML, use npm libraries, fetch data from databases/CMS/APIs etc.
- `css`, `js` and `ts` files imported and included in a template are automatically processed, transpiled and bundled.
- Markdown is parsed by [unified.js](https://unifiedjs.com/) ecosystem with support for custom remark/rehype plugins. Default plugins include - [smartypants](https://github.com/silvenon/remark-smartypants), [github flavored markdown](https://github.com/remarkjs/remark-gfm) and [syntax highlighting](https://github.com/wooorm/refractor) with [prismjs](https://prismjs.com/).
- CSS supports [PostCSS](https://postcss.org/) and it's plugins like [autoprefixer](https://github.com/postcss/autoprefixer), [preset-env](https://github.com/csstools/postcss-plugins/tree/main/plugin-packs/postcss-preset-env), [tailwind](https://tailwindcss.com/) etc.
- Support for Custom non-html files (eg.`rss.xml`, `sitemap.xml`, `data.txt` etc.) via `[filename.ext].json` files that use the same template system.
- Development server with auto-reload support.



## Install

Note: norite is in experimental beta state currently.

Install from npm:
```sh
npm install --save-dev norite
```

Create a config file named `norite.config.js` to define the project's root directory and optionally modify norite's behavior. It can be left empty if no custom config is needed.

```sh
echo 'export default {}' > norite.config.js
```

Norite supports the following commands:
- `norite dev`: start the dev server. It will watch the content and template directories for changes and auto-reload.
- `norite build`: generate the static website for production.

Use `norite --help` for details on more CLI options.

### Optional Typescript Support

Norite includes type definitions, for JSX runtime support add the following in your `tsconfig.json`:
```jsonc
{
  "compilerOptions": {
    /* ... other options */
    "jsx": "react-jsx",
    "jsxImportSource": "norite",
  },
}
```


## Quick Start
Refer to the [quick start](https://github.com/prdx23/norite/wiki#quick-start) section in the documentation.


## Documentation
Documentation for norite is here: [documentation](https://github.com/prdx23/norite/wiki)


## License
**MIT License**: Copyright (c) Arsh  
[License.txt](https://github.com/prdx23/norite/blob/master/LICENSE.txt)
