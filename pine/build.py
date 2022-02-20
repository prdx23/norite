import shutil
from pathlib import Path


class Page:

    def __init__(self, path, parent, config, index=False):
        self.path = path
        self.index = index
        self.parent = parent
        self.config = config

        root = Path(config['content'])
        self.relative_path = self.path.relative_to(root).parent
        if not self.index:
            self.relative_path = self.relative_path / self.path.stem

        if str(self.relative_path) == '.':
            self.permalink = '/'
        else:
            self.permalink = f'/{str(self.relative_path)}'

    def render(self):
        build_dir = Path(self.config['output']) / self.relative_path
        build_path = build_dir / Path('index.html')

        build_dir.mkdir(parents=True, exist_ok=True)
        with build_path.open('w') as o, self.path.open('r') as f:
            o.write(f.read())

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
