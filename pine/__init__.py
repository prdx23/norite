import shutil
from pathlib import Path

from pine.build import tree

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

    if 'content' not in config:
        config['content'] = 'content'

    output = Path(config['output'])
    if output.exists():
        shutil.rmtree(output)
    output.mkdir()

    t = tree(root, config)
    t.parse()
    t.render()
    print('rendered!')
