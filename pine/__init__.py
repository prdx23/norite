from pathlib import Path
from pine.build import Section


def console():
    root = Path('content')
    s = Section(root)
    s.print_tree()
