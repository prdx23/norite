import os

default_index_md = '''
---
title = 'Welcome to Norite!'
---

# Welcome to Norite!

Check out the documentation here - [github](https://github.com/prdx23/norite)
'''


default_index_html = '''
<!DOCTYPE html>
<html lang="en">

    <head>
        <meta charset="utf-8">

        <title>{% block title %} {{ page.title }} {% endblock %}</title>

        {% block head %}{% endblock %}

        <style>
            html {
                width: 100%;
                height: 100%;
            }
            body {
                margin: 5vh 10vw;
                font-family: sans-serif;
            }
        </style>

        <style> {{ get_syntax_css('default') }} </style>

    </head>

    <body>

        <main id='main'>
            {% block main %}
                <article>
                    {{ page.content | safe }}
                </article>
            {% endblock %}
        </main>

    </body>

</html>
'''


def init():
    if not os.path.exists('content'):
        os.makedirs('content')

    if not os.path.exists('source/templates'):
        os.makedirs('source/templates')

    with open('config.toml', 'w') as f:
        f.write('')

    with open('content/index.md', 'w') as f:
        f.write(default_index_md)

    with open('source/templates/index.html', 'w') as f:
        f.write(default_index_html)
