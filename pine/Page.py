import shutil
from pathlib import Path

from pine.utils import extract_toml, md, environment, global_context
from pine.utils import ANSI_YELLOW, ANSI_RESET


class Base:

    reserved = [
        'is_page', 'is_asset',
        'permalink',
        'path', 'parent', 'root',
        'sections', 'assets',
        'parse', 'render',
        '_build_dir', '_build_path', '_set_root'
    ]

    def parse(self, *args, **kwargs):
        raise NotImplementedError

    def render(self, *args, **kwargs):
        raise NotImplementedError

    def _set_root(self, *args, **kwargs):
        raise NotImplementedError

    def __repr__(self):
        return f'{self.__class__.__name__}<{self.path}>'


class Page(Base):

    def __init__(self, path, root, output, children=[]):

        self.is_page = True
        self.is_asset = False

        self.path = path
        self.parent = None
        self.sections = [x for x in children if x and x.is_page]
        self.assets = [x for x in children if x and x.is_asset]

        if self.path == root:
            self._set_root(self)
        elif self.path.parent == root and self.path.name == 'index.md':
            self._set_root(self)

        for x in self.sections:
            x.parent = self

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

        self._build_dir = output / relative_path
        self._build_path = self._build_dir / Path('index.html')

    def _set_root(self, page):
        self.root = page
        [x._set_root(page) for x in self.sections]
        [x._set_root(page) for x in self.assets]

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
            if key not in self.reserved:
                setattr(self, key, value)
            else:
                print(
                    f'{ANSI_YELLOW}Warning: Ignoring key "{key}" '
                    f'in frontmatter of "{self.path}"{ANSI_RESET}'
                )

        self.content = md.reset().convert(''.join(lines))

        [x.parse() for x in self.sections]

    def render(self):
        if self.path.is_dir():
            [x.render() for x in self.sections]
            [x.render() for x in self.assets]
            return

        self._build_dir.mkdir(parents=True, exist_ok=True)

        template = environment.get_template(self.template)
        rendered = template.render(page=self, **global_context)
        with self._build_path.open('w') as f:
            f.write(rendered)

        [x.render() for x in self.sections]
        [x.render() for x in self.assets]

    def count(self):
        inner = [x.count() for x in self.sections]

        asset_count = sum(1 for x in self.assets)
        asset_count += sum(x[1] for x in inner)

        page_count = sum(x[0] for x in inner)
        if not self.path.is_dir():
            page_count += 1

        return page_count, asset_count


class Asset(Base):

    def __init__(self, path, root, output):
        self.is_page = False
        self.is_asset = True
        self.path = path

        relative_path = path.relative_to(root).parent
        self.permalink = f'/{str(relative_path / path.name)}'
        self._build_dir = output / relative_path
        self._build_path = self._build_dir / self.path.name

    def _set_root(self, page):
        self.root = page

    def render(self):
        self._build_dir.mkdir(parents=True, exist_ok=True)
        shutil.copyfile(self.path, self._build_path)
