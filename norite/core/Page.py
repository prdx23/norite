import json
import shutil
from pathlib import Path

from norite.core import global_context
from norite.core.env import md, environment
from norite.core.toml import extract_toml, parse_toml
from norite.utils.print_helpers import print_warning


class Base:

    _reserved = [
        'is_page', 'is_asset', 'is_leaf',
        'permalink',
        'content', 'raw_content',
        'path', 'parent', 'root',
        'pages', 'assets',
    ]

    _index_names = [
        'index.md',
        'index.toml',
        'index.json',
    ]

    def _parse(self):
        if self.is_page:
            self._parse_page()

        if self.is_asset:
            self._parse_asset()

        [x._parse() for x in self.pages]
        [x._parse() for x in self.assets]

    def _render(self):
        if self.is_page:
            self._render_page()

        if self.is_asset:
            self._render_asset()

        [x._render() for x in self.pages]
        [x._render() for x in self.assets]

    def _set_root(self, page):
        self.root = page
        [x._set_root(page) for x in self.pages]
        [x._set_root(page) for x in self.assets]

    def _count(self):
        counts = [x._count() for x in self.pages]
        counts += [x._count() for x in self.assets]
        pages_count = sum(x[0] for x in counts)
        assets_count = sum(x[1] for x in counts)

        if not self.path.is_dir():
            if self.is_page:
                pages_count += 1
            if self.is_asset:
                assets_count += 1

        return pages_count, assets_count

    def __repr__(self):
        return f'{self.__class__.__name__}<{self.path}>'


class Page(Base):

    def __init__(self, path, root, output, children=[]):

        self.path = path
        self.parent = None
        self.pages = [x for x in children if x and x.is_page]
        self.assets = [x for x in children if x and x.is_asset]

        self.is_page = True
        self.is_asset = False
        self.is_leaf = False if len(self.pages) > 0 else True

        if self.path == root:
            self._set_root(self)
        elif self.path.parent == root and self.path.name in self._index_names:
            self._set_root(self)

        for x in self.pages:
            x.parent = self

        relative_path = path.relative_to(root).parent

        if path.is_file() and path.name not in self._index_names:
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

    def _parse_page(self):
        self.template = 'index.html'
        self.child_template = 'index.html'

        if self.path.is_dir():
            return

        with self.path.open('r') as f:
            lines = f.readlines()

        if self.path.suffix == '.toml':
            lines, toml = parse_toml(lines)
        elif self.path.suffix == '.json':
            lines, toml = [], json.loads(''.join(lines))
        else:
            lines, toml = extract_toml(lines)

        if self.parent:
            self.template = self.parent.child_template
            self.child_template = self.parent.child_template

        for key, value in toml.items():
            if key not in self._reserved and key[0] != '_':
                setattr(self, key, value)
            else:
                print_warning(
                    f'Warning: Ignoring reserved variable name "{key}" '
                    f'in frontmatter of "{self.path}"'
                )

        self._raw_content = ''.join(lines)

    def _render_page(self):
        if self.path.is_dir():
            return

        self._build_dir.mkdir(parents=True, exist_ok=True)

        md_template = environment.from_string(self._raw_content)
        templated_content = md_template.render(page=self, **global_context)

        self.raw_content = templated_content
        self.content = md.reset().convert(templated_content)

        template = environment.get_template(self.template)
        rendered = template.render(page=self, **global_context)
        with self._build_path.open('w') as f:
            f.write(rendered)


class Asset(Base):

    def __init__(self, path, root, output, children=[]):
        self.is_page = False
        self.is_asset = True
        self.path = path

        self.pages = []
        self.assets = [x for x in children if x and x.is_asset]

        relative_path = path.relative_to(root).parent

        if self.path.is_file():
            self.permalink = f'/{str(relative_path / path.name)}'
        else:
            self.permalink = ''

        self._build_dir = output / relative_path
        self._build_path = self._build_dir / self.path.name

    def _parse_asset(self):
        pass

    def _render_asset(self):
        if self.path.is_dir():
            return
        self._build_dir.mkdir(parents=True, exist_ok=True)
        shutil.copyfile(self.path, self._build_path)
