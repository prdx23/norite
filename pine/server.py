import time
from pathlib import Path
from threading import Thread
from functools import partial
from http.server import ThreadingHTTPServer, SimpleHTTPRequestHandler

from pine.builder import build

from watchdog.observers import Observer
from watchdog.events import FileSystemEventHandler


class Server(Thread):

    def __init__(self):
        Thread.__init__(self)

    def run(self, output, host, port):
        handler = partial(SimpleHTTPRequestHandler, directory=str(output))
        handler.protocol_version = 'HTTP/1.0'

        with ThreadingHTTPServer((host, port), handler) as httpd:
            host, port = httpd.socket.getsockname()[:2]
            url_host = f'[{host}]' if ':' in host else host
            print(
                f"Serving HTTP on {host} port {port} "
                f"(http://{url_host}:{port}/) ..."
            )
            try:
                httpd.serve_forever()
            except KeyboardInterrupt:
                print("\nKeyboard interrupt received, exiting.")


class Watcher:

    def __init__(self, directory, handler=FileSystemEventHandler()):
        self.observer = Observer()
        self.handler = handler
        self.directory = directory

    def run(self):
        self.observer.schedule(self.handler, self.directory, recursive=True)
        self.observer.start()
        print(f'Watching directory for changes: {self.directory}')

    def stop(self):
        self.observer.stop()

    def join(self):
        print(f'Watcher terminated: {self.directory}')
        self.observer.join()


class WatchHandler(FileSystemEventHandler):

    def __init__(self, config, debounce=0.4):
        super().__init__()
        self.config = config
        self.debounce = debounce
        self.last_timestamp = time.time()

    def on_any_event(self, event):
        if not event.is_directory and event.event_type != 'closed':
            if time.time() - self.last_timestamp < self.debounce:
                return

            self.last_timestamp = time.time()
            start = time.time()
            print()
            print(f'change detected in: {event.src_path}')
            print('rebuilding...')

            if build(self.config):
                end = round((time.time() - start) * 1000, 2)
                print('\033[0;32m\033[1m', end='')
                print(f'--- Site rebuilt! [ {end}ms ] ---', end='')
                print('\033[0m')
                # ]]]
                print()


def serve(config, host='localhost', port=1234):
    if not build(config):
        return

    output = Path(config['output'])
    content = Path(config['content'])
    static = Path(config['static'])

    print()
    watchers = [
        Watcher(content, WatchHandler(config)),
        Watcher(static, WatchHandler(config)),
        Watcher(Path('source'), WatchHandler(config)),
    ]
    [w.run() for w in watchers]

    print()
    server = Server()
    server.run(output, host, port)

    [w.stop() for w in watchers]
    [w.join() for w in watchers]
    print('bye!')
