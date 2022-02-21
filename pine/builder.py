import shutil
import traceback
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

    try:
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

        c_count = t.count()
        a_count = s.count()

        print('Generating - ', end='')
        print(f'{c_count[0] + a_count[0]} Pages, ', end='')
        print(f'{c_count[1] + a_count[1]} Assets')
        return True

    except Exception as e:
        print('\033[0;31m')
        print(''.join(traceback.TracebackException.from_exception(e).format()))
        print('\033[0m')
        return False
