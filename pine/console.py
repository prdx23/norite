import shutil
from pathlib import Path

from pine.parsetree import parsetree, printtree
from pine.utils import global_context

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

    if 'static' not in config:
        config['static'] = 'static'

    content = Path(config['content'])
    output = Path(config['output'])
    static = Path(config['static'])

    if output.exists():
        shutil.rmtree(output)
    output.mkdir()

    s = parsetree(static, static, output)
    s.parse()
    s.render()
    # printtree(s)

    global_context['static'] = s
    global_context['config'] = config

    t = parsetree(content, content, output)
    t.parse()
    t.render()
    # printtree(t)

    print('rendered!')
