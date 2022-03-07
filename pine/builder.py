import shutil
import traceback
import subprocess
from pathlib import Path

from pine.utils import global_context
from pine.utils import ANSI_RED, ANSI_RESET
from pine.parsetree import parsetree, printtree

try:
    import sass
except:
    sass = None


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

        if config['compile_sass'] and config['sass_compiler'] == 'dartsass':
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
                print(f'{ANSI_RED}Sass Error:')
                print(f'{result.stderr.decode()}{ANSI_RESET}')
                print()
                return False

        if config['compile_sass'] and config['sass_compiler'] == 'libsass':
            if not sass:
                print(f'{ANSI_RED}libSass not found')
                print(f'install with "pip install libasass"{ANSI_RESET}')
            else:
                sass.compile(
                    dirname=('source/sass', output / 'css'),
                    output_style='compressed',
                )

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
