import setuptools


setuptools.setup(
    name='pine',
    version='0.1',
    author='Arsh',
    author_email='hi@prdx.me',
    description='',
    packages=setuptools.find_packages(),
    python_requires='>=3.6',
    entry_points={
        'console_scripts': ['pine=pine:console'],
    }
)
