import subprocess
from pathlib import Path

from norite.utils.colors import ANSI_RED, ANSI_RESET

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
            print(f'{ANSI_RED}Sass Error:')
            print(f'{result.stderr.decode()}{ANSI_RESET}')
            print()
            return False

    if config['sass']['compiler'] == 'libsass':
        if not sass:
            print(f'{ANSI_RED}libSass not found')
            print(f'install with "pip install libasass"{ANSI_RESET}')
        else:
            sass.compile(
                dirname=('source/sass', output / 'css'),
                output_style='compressed',
            )
