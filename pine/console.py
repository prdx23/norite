import argparse
from pathlib import Path

from pine.builder import build
from pine.server import serve

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

    config = {
        'content': 'content',
        'output': 'output',
        'static': 'static',
        'compile_sass': True,
    }

    config.update(toml_config)
    if args.command == 'build':
        if build(config):
            print()
            print('\033[0;32m\033[1m--- Site built! ---\033[0m')
    if args.command == 'serve':
        serve(config, args.bind, args.port)
