import toml
import collections.abc

from pine.utils.colors import ANSI_YELLOW, ANSI_RESET


def extract_toml(lines):
    # find toml frontmatter if present
    toml_i = []
    for i, line in enumerate(lines):
        if line.strip() == '---':
            toml_i.append(i)

    # toml not found, return empty dict
    if len(toml_i) != 2:
        return lines, {}

    # parse toml fromtmatter
    toml_str = ''
    for i in range(toml_i[0] + 1, toml_i[1]):
        toml_str += lines[i]
        lines[i] = ''

    lines[toml_i[0]] = ''
    lines[toml_i[1]] = ''

    return lines, toml.loads(toml_str)


def parse_toml(lines):
    return [], toml.loads(''.join(lines))


def parse_toml_config(path):

    with open('config.toml') as f:
        toml_config = toml.load(f)

    default_config = {

        'content': 'content',
        'output': 'output',
        'static': 'static',

        'baseurl': 'https://example.com',

        'sass': {
            'enable': False,
            'compiler': 'libsass',
        },

        'rss': {
            'enable': False,
            'filename': 'rss.xml',
        },

        'extra': {
        },

    }

    config = {}
    for k, v in default_config.items():
        if isinstance(v, collections.abc.Mapping):
            v.update(toml_config.get(k, {}))
            config[k] = v
        else:
            config[k] = toml_config.get(k, v)

    if config['sass']['compiler'] not in ['libsass', 'dartsass']:
        config['sass']['compiler'] = 'libsass'

    if config['baseurl'] == 'https://example.com':
        print(f'{ANSI_YELLOW}Warning:', end='')
        print(f' "baseurl" missing in config, using "{config["baseurl"]}"')
        print(ANSI_RESET)

    return config
