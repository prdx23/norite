import shutil
import traceback
import subprocess
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
        asset_tree = parsetree(static, static, output)
        asset_tree.parse()
        asset_tree.render()
        # printtree(asset_tree)

        if config['compile_sass']:
            result = subprocess.run(
                [
                    'sass',
                    '--update',
                    '--style', 'compressed',
                    f'{Path("source/sass")}:{output / "css"}'
                ],
                capture_output=True
            )
            if result.returncode != 0:
                print('\033[0;31m')
                print('Sass Error:')
                print(result.stderr.decode())
                print('\033[0m')
                # ]]
                print()
                return False

        global_context['assets'] = asset_tree
        global_context['config'] = config

        content_tree = parsetree(content, content, output)
        content_tree.parse()
        content_tree.render()
        # printtree(content_tree)

        c_count = content_tree.count()
        a_count = asset_tree.count()

        print('Generating - ', end='')
        print(f'{c_count[0] + a_count[0]} Pages, ', end='')
        print(f'{c_count[1] + a_count[1]} Assets')
        return True

    except Exception as e:
        print('\033[0;31m')
        print(''.join(traceback.TracebackException.from_exception(e).format()))
        print('\033[0m')
        return False
