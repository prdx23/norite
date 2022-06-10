from pathlib import Path

from norite.core.env import environment


robots_txt_default = '''
User-agent: *
Allow: /

Sitemap: {{ config['baseurl'] }}/sitemap.xml
'''


def generate_robots_txt(content_tree, global_context):

    robots_txt_file = Path('source/templates/robots.txt')

    if robots_txt_file.exists():
        template = environment.get_template(robots_txt_file.name)
    else:
        template = environment.from_string(robots_txt_default)

    robots_txt = template.render(root=content_tree, **global_context)

    output = Path(global_context['config']['output']) / 'robots.txt'
    with output.open('w') as f:
        f.write(robots_txt)
