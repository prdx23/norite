import time
import argparse
from pathlib import Path

from pine.core import default_config
from pine.core.builder import build
from pine.utils.server import serve
from pine.utils.colors import ANSI_GREEN, ANSI_RESET

import toml

parser = argparse.ArgumentParser(
    prog='pine',
    description='A static site generator'
)
subparsers = parser.add_subparsers(
    title='Commands',
    dest='command',
    required=True,
    metavar='<command>',
)

build_parser = subparsers.add_parser(
    'build',
    help='Delete output directory and rebuild the site'
)

serve_parser = subparsers.add_parser(
    'serve',
    help='Start a dev server, reload on changes automatically'
)
serve_parser.add_argument(
    '-p', '--port',
    help='Specify alternate port [default: 1234]',
    type=int,
    default=1234,
)
serve_parser.add_argument(
    '-b', '--bind',
    help='Specify alternate host [default: localhost]',
    type=str,
    default='localhost',
)


def console():
    args = parser.parse_args()

    if not Path('config.toml').exists():
        print('config.toml not found')
        return

    with open('config.toml') as f:
        toml_config = toml.load(f)

    config = default_config
    config.update(toml_config)
    if config['sass']['compiler'] not in ['libsass', 'dartsass']:
        config['sass']['compiler'] = 'libsass'

    if args.command == 'build':
        start = time.time()
        if build(config):
            end = round((time.time() - start) * 1000, 2)
            print(ANSI_GREEN)
            print(f'--- Site built! [ {end}ms ] ---{ANSI_RESET}')
    if args.command == 'serve':
        serve(config, args.bind, args.port)
