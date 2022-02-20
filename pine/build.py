

class Page:

    def __init__(self, path, index=False):
        self.path = path
        self.index = index
        if index:
            # self.permalink = self.path.parent.relative_to(root)
            self.permalink = self.path.parent
            pass
        else:
            # self.permalink = self.path.relative_to(root)
            self.permalink = self.path.parent
            self.permalink = self.permalink.with_name(self.path.stem)

    # --------------------
    def print_tree(self, indent=0):
        print(' ' * indent, f'[{self.permalink}]: ', end='')
        print(self.path)


class Asset:

    def __init__(self, path):
        self.path = path
        self.permalink = self.path.parent
        # self.permalink = self.path.relative_to(root)

    # --------------------
    def print_tree(self, indent=0):
        print(' ' * indent, f'[{self.permalink}]: ', end='')
        # print(self.path.name)
        print()


class Section:

    def __init__(self, path):
        self.pages = []
        self.assets = []
        self.sections = []
        self.path = path
        self.index = None

        for x in path.iterdir():
            if x.is_file():
                if x.suffix == '.md':
                    if x.stem == 'index':
                        self.index = Page(x, True)
                    else:
                        self.pages.append(Page(x))
                else:
                    self.assets.append(Asset(x))
            else:
                self.sections.append(Section(x))

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
