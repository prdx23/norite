import shutil
import traceback
from pathlib import Path

from pine.core import global_context
from pine.utils.sass import compile_sass
from pine.utils.colors import ANSI_RED, ANSI_RESET
from pine.core.parsetree import parsetree, printtree


def build(config):
    content = Path(config['content'])
    output = Path(config['output'])
    static = Path(config['static'])

    if output.exists():
        shutil.rmtree(output)

    if not output.exists():
        output.mkdir()

    try:
        asset_tree = parsetree(static, static, output)
        asset_tree._parse()
        asset_tree._render()
        # printtree(asset_tree)

        if config['sass']['enable']:
            compile_sass(config, output)

        global_context['static'] = asset_tree
        global_context['config'] = config

        content_tree = parsetree(content, content, output)
        content_tree._parse()
        content_tree._render()
        # printtree(content_tree)

        c_count = content_tree.count()
        a_count = asset_tree.count()

        print('Generating - ', end='')
        print(f'{c_count[0] + a_count[0]} Pages, ', end='')
        print(f'{c_count[1] + a_count[1]} Assets')
        return True

    except Exception as e:
        print(ANSI_RED)
        print(''.join(traceback.TracebackException.from_exception(e).format()))
        print(ANSI_RESET)
        return False
