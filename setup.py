import setuptools


with open('README.md', 'r') as fh:
    long_description = fh.read()


with open('norite/version.py') as fp:
    temp = {}
    exec(fp.read(), temp)
    version = temp['__version__']


setuptools.setup(
    name='norite',
    version=version,
    author='Arsh',
    author_email='hi@prdx.me',
    description='A simple static website generator powered by Jinja2',
    long_description=long_description,
    long_description_content_type="text/markdown",
    url='https://github.com/prdx23/norite',
    packages=setuptools.find_packages(),
    classifiers=[
        'Programming Language :: Python :: 3',
        'Programming Language :: Python :: 3.6',
        'Programming Language :: Python :: 3.7',
        'Programming Language :: Python :: 3.8',
        'Programming Language :: Python :: 3.9',
        'Programming Language :: Python :: 3.10',
        'License :: OSI Approved :: MIT License',
        'Operating System :: OS Independent',
        'Development Status :: 3 - Alpha',
        'Environment :: Console',
        'Environment :: Web Environment',
        'Topic :: Internet :: WWW/HTTP',
        'Topic :: Text Processing :: Markup :: Markdown',
        'Topic :: Text Processing :: Markup :: HTML',
    ],
    keywords='static web site generator SSG jinja jinja2 markdown',
    project_urls={
        'Source': 'https://github.com/prdx23/norite',
        'Tracker': 'https://github.com/prdx23/norite/issues',
        'Documentation': 'https://github.com/prdx23/norite/wiki',
    },
    python_requires='>=3.6',
    install_requires=[
        'toml',
        'jinja2',
        'markdown',
        'watchdog',
        'pygments',
    ],
    entry_points={
        'console_scripts': ['norite=norite:console'],
    }
)
