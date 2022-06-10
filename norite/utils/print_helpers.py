_ANSI_RED = '\033[0;31m'
_ANSI_YELLOW = '\033[0;33m'
_ANSI_GREEN = '\033[0;32m\033[1m'
_ANSI_RESET = '\033[0m'


def print_success(text, *args, **kwargs):
    print(f'{_ANSI_GREEN}{text}{_ANSI_RESET}', *args, **kwargs)


def print_warning(text, *args, **kwargs):
    print(f'{_ANSI_YELLOW}{text}{_ANSI_RESET}', *args, **kwargs)


def print_error(text, *args, **kwargs):
    print(f'{_ANSI_RED}{text}{_ANSI_RESET}', *args, **kwargs)
