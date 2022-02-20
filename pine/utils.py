from datetime import datetime

import toml
from markdown import Markdown
from jinja2 import Environment, FileSystemLoader, select_autoescape


def weight_sort(array, reverse=False):
    valid = [x for x in array if hasattr(x, 'weight')]
    return sorted(valid, key=lambda x: x.weight, reverse=reverse)


def date_sort(array, reverse=False):
    valid = [x for x in array if hasattr(x, 'date')]
    return sorted(valid, key=lambda x: x.date, reverse=reverse)


def date(value, format="%y-%m-%d"):
    return value.strftime(format)


md = Markdown()
environment = Environment(
    loader=FileSystemLoader('source/templates'),
    autoescape=select_autoescape(),
)
environment.filters['weight_sort'] = weight_sort
environment.filters['date_sort'] = date_sort
environment.filters['date'] = date
environment.globals['now'] = datetime.utcnow


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
