# Norite

Norite is a simple static website generator powered by [Jinja2](https://palletsprojects.com/p/jinja) as the templating engine.

Norite's main goal is to act as an easy to use rendering engine for people who like to design their own templates or want to have the option of building a custom structure for their websites. To achieve this goal norite exposes the entire content directory as a tree data-structure to the templates along with the rendered content, leaving it up to the template designer how to interpret and display this information.

Implemented Features:
- Markdown to HTML render
- Support for using toml or json files instead of markdown
- Jinja2 based HTML templates
- Support for embedding Jinja2 templates in markdown
- Support for nested folders in website content
- Support for custom templates for any subsection of the content folder
- Support for co-locating assets with content
- Syntax highlighting
- Sass compilation (via libsass or dart-sass)
- Built-in development server with auto reload on file changes
- Support for building custom RSS/Atom feeds and robots.txt using templates
- Automatic sitemap.xml generation

Todo (Features I am working on or plan to implement):
- Tests
- Python based Plugins
- Live reload in Javascript
- Incremental builds
- Link checker
- More examples


## Installation
Norite is in alpha but the features listed above are fully functional. If you like what you see and want to give it a try, you can install using:
```shell
pip install norite
```

It will install the following additional packages: [jinja2](https://pypi.org/project/Jinja2/), [markdown](https://pypi.org/project/Markdown/), [toml](https://pypi.org/project/toml/), [pygments](https://pypi.org/project/Pygments/) and [watchdog](https://pypi.org/project/watchdog/).

Alternatively, if you want to install it globally as a shell tool within an isolated python environment, install via [pipx](https://pypa.github.io/pipx/):
```shell
pipx install 'norite'
```

## Documentation
Checkout the documentation for norite here: [documentation](https://github.com/prdx23/norite/wiki)


## Inspiration
Norite is influenced by [Zola's](https://www.getzola.org/) features and its way of organizing content, borrows a few concepts from [Hugo](https://gohugo.io), and takes inspiration from [Pelican](https://blog.getpelican.com/)'s and [Mkdocs](https://www.mkdocs.org/)'s internal implementations for a few things. I would happily recommend using any of these excellent SSGs!


## License
**MIT License**: Copyright (c) 2022 - 2022 Arsh  
[License.txt](https://github.com/prdx23/norite/blob/master/LICENSE.txt)
