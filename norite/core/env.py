
from datetime import datetime, timezone

from markdown import Markdown
from jinja2 import Environment, FileSystemLoader, select_autoescape
from pygments import highlight
from pygments.lexers import get_lexer_by_name
from pygments.formatters import HtmlFormatter


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


def highlight_filter(code, lang, wrapcode=True, *args, **kwargs):
    lexer = get_lexer_by_name(lang, stripall=True)
    formatter = HtmlFormatter(*args, wrapcode=wrapcode, **kwargs)
    return highlight(code, lexer, formatter)


def get_syntax_css(style='default'):
    return HtmlFormatter(style=style).get_style_defs('.highlight')


def all_pages(page):
    pages = []
    for inner in page.pages:
        pages.append(inner)
        pages += all_pages(inner)
    return pages


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
    extensions=[
        'jinja2.ext.loopcontrols', 'jinja2.ext.debug', 'jinja2.ext.do',
    ],
)
environment.filters['weight_sort'] = weight_sort
environment.filters['date_sort'] = date_sort
environment.filters['strftime'] = strftime
environment.filters['all_pages'] = all_pages
environment.filters['markdown'] = markdown_filter
environment.filters['md'] = markdown_filter
environment.filters['highlight'] = highlight_filter
environment.filters['hl'] = highlight_filter
environment.globals['now'] = lambda: datetime.now(timezone.utc)
environment.globals['datetime'] = datetime
environment.globals['get_syntax_css'] = get_syntax_css
