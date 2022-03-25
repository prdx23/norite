import time
import shutil
from pathlib import Path
from threading import Thread
from functools import partial
from http.server import ThreadingHTTPServer, SimpleHTTPRequestHandler

from norite.core.builder import build
from norite.utils.colors import ANSI_GREEN, ANSI_RESET

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

    def __init__(self, name, config, *args, debounce=0.4, **kwargs):
        super().__init__(*args, **kwargs)
        self.name = name
        self.config = config
        self.debounce = debounce
        self.last_timestamp = time.time()

    def on_any_event(self, event):
        if not event.is_directory and event.event_type != 'closed':
            if time.time() - self.last_timestamp < self.debounce:
                # self.last_timestamp = time.time()
                return

            self.last_timestamp = time.time()
            start = time.time()
            print()
            print(f'change detected in: {event.src_path}')
            print('rebuilding...')

            if build(self.config):
                end = round((time.time() - start) * 1000, 2)
                print(ANSI_GREEN)
                print(f'--- Site rebuilt! [ {end}ms ] ---{ANSI_RESET}')


def serve(config, host='localhost', port=1234):
    config['output'] = '__live_server'
    build(config)

    output = Path(config['output'])
    content = Path(config['content'])
    static = Path(config['static'])
    source = Path('source')

    debounce = 0.4
    if config['sass']['enable'] and config['sass']['compiler'] == 'dartsass':
        debounce = 1

    watchers = [
        Watcher(content, WatchHandler('content', config, debounce=debounce)),
        Watcher(static, WatchHandler('static', config, debounce=debounce)),
        Watcher(source, WatchHandler('source', config, debounce=debounce)),
    ]
    [w.run() for w in watchers]

    server = Server()
    server.run(output, host, port)

    [w.stop() for w in watchers]
    [w.join() for w in watchers]
    shutil.rmtree(output)

    print('bye!')
