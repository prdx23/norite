
from datetime import datetime, timezone

from markdown import Markdown
from jinja2 import Environment, FileSystemLoader, select_autoescape


def weight_sort(array, reverse=False):
    valid = [x for x in array if hasattr(x, 'weight')]
    return sorted(valid, key=lambda x: x.weight, reverse=reverse)


def date_sort(array, reverse=False):
    valid = [x for x in array if hasattr(x, 'date')]
    return sorted(valid, key=lambda x: x.date, reverse=reverse)


def strftime(value, format="%y-%m-%d"):
    return value.strftime(format)


def markdown_filter(content):
    return md.reset().convert(content)


md = Markdown(
    output_format='html5',
    extensions=['extra', 'codehilite'],
    extension_configs={
        'extra': {
            'footnotes': {},
            'fenced_code': {},
        },
        'codehilite': {
            'css_class': 'highlight',
            'guess_lang': False,
        }
    },
)

environment = Environment(
    loader=FileSystemLoader('source/templates'),
    autoescape=select_autoescape(),
)
environment.filters['weight_sort'] = weight_sort
environment.filters['date_sort'] = date_sort
environment.filters['strftime'] = strftime
environment.filters['markdown'] = markdown_filter
environment.filters['md'] = markdown_filter
environment.globals['now'] = lambda: datetime.now(timezone.utc)
