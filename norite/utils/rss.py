from pathlib import Path

from norite.core.env import environment
from norite.utils.print_helpers import print_error


def compile_rss(content_tree, global_context):

    filename = global_context['config']['rss']['filename']
    rss_template_file = Path('source/templates') / filename

    if not rss_template_file.exists():
        print_error(f'\nError: rss template "{rss_template_file}" not found\n')
        return

    rss_template = environment.get_template(rss_template_file.name)
    rss_feed = rss_template.render(root=content_tree, **global_context)

    output = Path(global_context['config']['output']) / rss_template_file.name
    with output.open('w') as f:
        f.write(rss_feed)
