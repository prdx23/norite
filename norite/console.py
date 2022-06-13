import time
import argparse
from pathlib import Path

from norite.core.builder import build
from norite.core.toml import parse_toml_config

from norite.utils.init import init
from norite.utils.server import serve
from norite.utils.print_helpers import print_success, print_error


parser = argparse.ArgumentParser(
    prog='norite',
    description='A static website generator'
)
subparsers = parser.add_subparsers(
    title='Commands',
    dest='command',
    required=True,
    metavar='<command>',
)

init_parser = subparsers.add_parser(
    'init',
    help='Initialize a new project in the current directory'
)

build_parser = subparsers.add_parser(
    'build',
    help='Delete the output directory and rebuild the site'
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

    if args.command == 'init':
        init()
        print_success('\nNew project initialized!')
        return

    if not Path('config.toml').exists():
        print_error('Error: config.toml not found')
        return

    config = parse_toml_config(Path('config.toml'))

    if args.command == 'build':
        start = time.time()
        if build(config):
            end = round((time.time() - start) * 1000, 2)
            print_success(f'\n--- Site built! [ {end}ms ] ---')

    if args.command == 'serve':
        serve(config, args.bind, args.port)
