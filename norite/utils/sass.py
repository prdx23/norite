import subprocess
from pathlib import Path

from norite.utils.print_helpers import print_error

try:
    import sass
except:
    sass = None


def compile_sass(config, output):
    if config['sass']['compiler'] == 'dartsass':
        result = subprocess.run(
            [
                'sass',
                '--update',
                '--style', 'compressed',
                f'{Path("source/sass")}:{output / "css"}'
            ],
            capture_output=True
        )
        if result.returncode != 0:
            print_error(f'Sass Error: \n{result.stderr.decode()}\n')
            return False

    if config['sass']['compiler'] == 'libsass':
        if not sass:
            print_error('libSass not found')
            print_error('install with "pip install libsass"')
        else:
            sass.compile(
                dirname=('source/sass', output / 'css'),
                output_style='compressed',
            )
