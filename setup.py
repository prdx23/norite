import setuptools


setuptools.setup(
    name='pine',
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
    ],
    entry_points={
        'console_scripts': ['pine=pine:console'],
    }
)
