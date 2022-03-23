from pathlib import Path

from pine.core.env import environment


sitemap_template = '''
<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
    <url>
        <loc>{{ config['baseurl'] }}</loc>
        <lastmod>{{ now().isoformat() }}</lastmod>
    </url>
    {%- for page in root | all_pages if page.permalink %}
    <url>
        <loc>{{ config['baseurl'] ~ page.permalink }}</loc>
        {%- if page.updated %}
        <lastmod>{{ page.updated.isoformat() }}</lastmod>
        {%- elif page.date %}
        <lastmod>{{ page.date.isoformat() }}</lastmod>
        {%- endif %}
    </url>
   {%- endfor %}
</urlset>
'''


def generate_sitemap(content_tree, global_context):

    template = environment.from_string(sitemap_template)
    sitemap = template.render(root=content_tree, **global_context)

    output = Path(global_context['config']['output']) / 'sitemap.xml'
    with output.open('w') as f:
        f.write(sitemap)
