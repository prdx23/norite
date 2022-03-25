import time
import argparse
from pathlib import Path

from norite.core.builder import build
from norite.core.toml import parse_toml_config

from norite.utils.server import serve
from norite.utils.colors import ANSI_GREEN, ANSI_RESET


parser = argparse.ArgumentParser(
    prog='norite',
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

    config = parse_toml_config(Path('config.toml'))

    if args.command == 'build':
        start = time.time()
        if build(config):
            end = round((time.time() - start) * 1000, 2)
            print(ANSI_GREEN)
            print(f'--- Site built! [ {end}ms ] ---{ANSI_RESET}')
    if args.command == 'serve':
        serve(config, args.bind, args.port)
