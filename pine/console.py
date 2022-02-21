import argparse
from pathlib import Path

from pine.builder import build
from pine.server import serve

import toml

parser = argparse.ArgumentParser(
    prog='pine',
    description='A static site generator'
)
# parser.add_argument(
#     '-p', '--port',
#     type=int,
#     default=1234,
#     help='Specify alternate port [default:1234]',
# )

subparsers = parser.add_subparsers(
    title='Commands',
    # action='store_true',
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

# build_parser.add_argument(
#     '-w', '--watch',
#     action='store_true',
#     help='watch the files for changes and re-build'
# )

# serve_parser = subparsers.add_parser('serve', help='serve help')
# serve_parser.add_argument('-c', type=str, help='c2 help')


def console():
    args = parser.parse_args()

    if not Path('config.toml').exists():
        print('config.toml not found')
        return

    with open('config.toml') as f:
        config = toml.load(f)

    if 'content' not in config:
        config['content'] = 'content'

    if 'output' not in config:
        config['output'] = 'output'

    if 'static' not in config:
        config['static'] = 'static'

    if args.command == 'build':
        if build(config):
            print()
            print('\033[0;32m\033[1m--- Site built! ---\033[0m')
    if args.command == 'serve':
        serve(config, args.bind, args.port)
