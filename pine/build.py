import shutil
from pathlib import Path

from pine.utils import extract_toml, md, environment


def tree(path, config={}):
    if config:
        Base.config = config

    if path.is_file() and path.suffix == '.md' and path.stem != 'index':
        return Page(path)

    if path.is_file() and path.suffix != '.md':
        return Asset(path)

    if path.is_dir():
        children = list(path.iterdir())
        inner = [tree(x) for x in children]

        index = [x for x in children if x.name == 'index.md']
        if index:
            return Page(index[0], inner)

        return Page(path, inner)


class Base:
    config = {}

    def __repr__(self):
        return str(self.path)


class Page(Base):

    def __init__(self, path, children=[]):

        self.path = path
        self.parent = None
        self.sections = [x for x in children if isinstance(x, Page)]
        self.assets = [x for x in children if isinstance(x, Asset)]

        for x in self.sections:
            x.parent = self

        root = Path(self.config['content'])
        relative_path = path.relative_to(root).parent

        if path.is_file() and path.name != 'index.md':
            relative_path = relative_path / self.path.stem

        if path.is_file():
            if str(relative_path) == '.':
                self.permalink = '/'
            else:
                self.permalink = f'/{str(relative_path)}'
        else:
            self.permalink = ''

        self._relative_path = relative_path

    def parse(self):

        self.template = 'index.html'
        self.child_template = 'index.html'

        if self.path.is_dir():
            [x.parse() for x in self.sections]
            return

        with self.path.open('r') as f:
            lines = f.readlines()

        lines, toml = extract_toml(lines)

        if self.parent:
            self.template = self.parent.child_template
            self.child_template = self.parent.child_template

        for key, value in toml.items():
            setattr(self, key, value)

        self.content = md.convert(''.join(lines))

        [x.parse() for x in self.sections]

    def render(self):
        if self.path.is_dir():
            [x.render() for x in self.sections]
            return

        build_dir = Path(self.config['output']) / self._relative_path
        build_path = build_dir / Path('index.html')
        build_dir.mkdir(parents=True, exist_ok=True)

        template = environment.get_template(self.template)
        rendered = template.render(page=self, config=self.config)
        with build_path.open('w') as f:
            f.write(rendered)

        [x.render() for x in self.sections]
        [x.render() for x in self.assets]

    # --------------------

    def print_tree(self, indent=0):
        print(' ' * indent, f'[{self.permalink}]: ', end='')
        print(self.path)
        # print(' ' * indent, f'[{self.permalink}] ', end='')
        # print(' ' * indent, f'[]: ', end='')
        # print('parent:', self.parent, '  - ', self.path)
        # print(' ' * indent, self.path)
        # print(' ' * indent, 'template: ', self.template)
        # print(' ' * indent, 'child_template: ', self.child_template)
        # print(' ' * indent, 'parent: ', self.parent)
        # print(' ' * indent, 'permalink: ', self.permalink)
        # print(' ' * indent, 'sections: ', self.sections)
        # print(' ' * indent, 'assets: ', self.assets)
        # print()
        [x.print_tree(indent + 4) for x in self.sections]
        [x.print_tree(indent + 4) for x in self.assets]
        print()
        pass


class Asset(Base):

    def __init__(self, path):
        self.path = path

        root = Path(self.config['content'])
        self._relative_path = path.relative_to(root).parent
        self.permalink = f'/{str(self._relative_path / path.name)}'

    def render(self):
        build_dir = Path(self.config['output']) / self._relative_path
        build_path = build_dir / self.path.name

        build_dir.mkdir(parents=True, exist_ok=True)
        shutil.copyfile(self.path, build_path)

    # --------------------

    def print_tree(self, indent=0):
        # print(' ' * indent, f'[{self.permalink}]: ', end='')
        # print(self.path.name)
        print(' ' * indent, self.path)
        pass
