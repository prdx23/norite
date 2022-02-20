import shutil
from pathlib import Path

import toml
from markdown import Markdown
from jinja2 import Environment, FileSystemLoader, select_autoescape


md = Markdown()
env = Environment(
    loader=FileSystemLoader('source/templates'),
    autoescape=select_autoescape()
)


class Page:

    def __init__(
            self, path, parent, config, index=False, template='index.html'):
        self.path = path
        self.index = index
        self.parent = parent
        self.config = config
        self.template = template

        root = Path(config['content'])
        self.relative_path = self.path.relative_to(root).parent
        if not self.index:
            self.relative_path = self.relative_path / self.path.stem

        if str(self.relative_path) == '.':
            self.permalink = '/'
        else:
            self.permalink = f'/{str(self.relative_path)}'

        self.parse()

    def parse(self):
        meta = {
            'self': self,
            'parent': self.parent,
            'permalink': self.permalink,
            'template': self.template,

        }
        if self.index:
            meta.update({
                'pages': self.parent.pages,
                'asssets': self.parent.assets,
                'sections': self.parent.sections,
            })

        with self.path.open('r') as f:
            raw = f.readlines()

        toml_i = []
        for i, line in enumerate(raw):
            if line.strip() == '---':
                toml_i.append(i)

        if len(toml_i) == 2:
            toml_str = ''
            for i in range(toml_i[0] + 1, toml_i[1]):
                toml_str += raw[i]
                raw[i] = ''

            raw[toml_i[0]] = ''
            raw[toml_i[1]] = ''

            meta.update(toml.loads(toml_str))

        meta['content'] = md.convert(''.join(raw))
        self.meta = meta

    def render(self):
        build_dir = Path(self.config['output']) / self.relative_path
        build_path = build_dir / Path('index.html')
        build_dir.mkdir(parents=True, exist_ok=True)

        template = env.get_template(self.template)
        rendered = template.render(meta=self.meta)
        with build_path.open('w') as f:
            f.write(rendered)

    # --------------------
    def print_tree(self, indent=0):
        print(' ' * indent, f'[{self.permalink}]: ', end='')
        print(self.path)


class Asset:

    def __init__(self, path, config):
        self.path = path
        self.config = config
        self.root = Path(config['content'])

        root = Path(config['content'])
        self.relative_path = self.path.relative_to(root).parent
        self.permalink = f'/{str(self.relative_path / path.name)}'

    def render(self):
        build_dir = Path(self.config['output']) / self.relative_path
        build_path = build_dir / self.path.name

        build_dir.mkdir(parents=True, exist_ok=True)
        shutil.copyfile(self.path, build_path)

    # --------------------
    def print_tree(self, indent=0):
        print(' ' * indent, f'[{self.permalink}]: ', end='')
        print(self.path.name)


class Section:

    def __init__(self, path, config):
        self.path = path
        self.config = config
        self.index = None
        self.pages = []
        self.assets = []
        self.sections = []

        for x in path.iterdir():
            if x.is_file():
                if x.suffix == '.md':
                    if x.stem == 'index':
                        self.index = Page(x, self, config, True)
                    else:
                        self.pages.append(Page(x, self, config))
                else:
                    self.assets.append(Asset(x, config))
            else:
                self.sections.append(Section(x, config))

    def render(self):
        if self.index:
            self.index.render()
        [x.render() for x in self.sections]
        [x.render() for x in self.pages]
        [x.render() for x in self.assets]

    @property
    def meta(self):
        if self.index:
            return self.index.meta
        return {}

    # --------------------
    def print_tree(self, indent=0):
        print(' ' * indent, end='')
        if self.index:
            self.index.print_tree()
        else:
            print(' [no index]: ', self.path)
        [x.print_tree(indent + 4) for x in self.sections]
        [x.print_tree(indent + 4) for x in self.pages]
        [x.print_tree(indent + 4) for x in self.assets]
