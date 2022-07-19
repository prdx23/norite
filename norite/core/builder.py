import os
import shutil
import traceback
from pathlib import Path

from norite.core import global_context
from norite.core.Page import Page, Asset
from norite.utils.rss import compile_rss
from norite.utils.sass import compile_sass
from norite.utils.sitemap import generate_sitemap
from norite.utils.robots_txt import generate_robots_txt
from norite.utils.print_helpers import print_error, print_warning


def parsetree(path, root, output, incl_drafts):

    if incl_drafts is False and path.stem[0] == '_':
        print_warning(f'* Marked as draft: {path}')
        return None

    if path.is_file():
        if path.suffix == '.md' and path.stem != 'index':
            return Page(path, root, output)

        if path.suffix != '.md' and path.name not in Page._index_names:
            return Asset(path, root, output)

    if path.is_dir():
        children = list(path.iterdir())
        inner = [parsetree(x, root, output, incl_drafts) for x in children]

        index = [x for x in children if x.name in Page._index_names]
        if index:
            return Page(index[0], root, output, inner)

        if any(x.is_page for x in inner if x):
            return Page(path, root, output, inner)
        else:
            return Asset(path, root, output, inner)


def build(config, incl_drafts):
    content = Path(config['content'])
    output = Path(config['output'])
    templates = Path('source/templates')

    # content path validation
    if not content.exists():
        print_error(f'Error: content directory "./{content}" not found')
        return False

    if not any(os.scandir(content)):
        print_warning('Warning: content directory is empty!')

    # templates path validation
    if not templates.exists():
        print_error(f'Error: templates directory "./{templates}" not found')
        return False

    if not any(os.scandir(templates)):
        print_warning('Warning: templates directory is empty!')

    # output path cleanup
    if output.exists():
        shutil.rmtree(output)

    if not output.exists():
        output.mkdir()

    try:
        global_context['config'] = config

        if incl_drafts:
            print_warning('Warning: Including drafts in output!')

        tree = parsetree(content, content, output, incl_drafts)
        tree._parse()
        tree._render()

        if config['sass']['enable']:
            compile_sass(config, output)

        if config['rss']['enable']:
            compile_rss(tree, global_context)

        generate_sitemap(tree, global_context)
        generate_robots_txt(tree, global_context)

        count = tree._count()
        print('\nGenerating - ', end='')
        print(f'{count[0]} Pages, {count[1]} Assets')
        return True

    except Exception as e:
        print()
        print_error(
            ''.join(traceback.TracebackException.from_exception(e).format())
        )
        return False
