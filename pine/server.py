from pathlib import Path
from threading import Thread
from functools import partial
from http.server import ThreadingHTTPServer, SimpleHTTPRequestHandler

from pine.builder import build


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


def serve(config, host='localhost', port=1234):
    build(config)
    output = Path(config['output'])

    server = Server()
    server.run(output, host, port)
    print('end')
