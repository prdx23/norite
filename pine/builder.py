import shutil
from pathlib import Path

from pine.utils import global_context
from pine.parsetree import parsetree, printtree


def build(config):
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

    print('--- Site built! ---')
