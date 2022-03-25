import shutil
import traceback
from pathlib import Path

from norite.core import global_context
from norite.utils.rss import compile_rss
from norite.utils.sass import compile_sass
from norite.utils.sitemap import generate_sitemap
from norite.utils.colors import ANSI_RED, ANSI_RESET
from norite.core.parsetree import parsetree, printtree


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

        if config['rss']['enable']:
            compile_rss(content_tree, global_context)

        generate_sitemap(content_tree, global_context)

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
