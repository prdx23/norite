import setuptools


setuptools.setup(
    name='norite',
    version='0.1',
    author='Arsh',
    author_email='hi@prdx.me',
    description='',
    packages=setuptools.find_packages(),
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
