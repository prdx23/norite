import shutil
from pathlib import Path

from pine.build import Section

import toml


def console():
    if not Path('config.toml').exists():
        print('config.toml not found')
        return

    with open('config.toml') as f:
        config = toml.load(f)

    if 'content' not in config:
        config['content'] = 'content'

    if 'output' not in config:
        config['output'] = 'output'

    root = Path(config['content'])

    s = Section(root, config)
    s.print_tree()
    print()

    if 'content' not in config:
        config['content'] = 'content'

    output = Path(config['output'])
    if output.exists():
        shutil.rmtree(output)
    output.mkdir()

    s.render()
